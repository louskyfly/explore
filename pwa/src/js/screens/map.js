import { bilbao } from '../data/bilbao.js';
import { zaragoza } from '../data/zaragoza.js';
import { db, genId } from '../db.js';
import { updateHeader, showToast, showModal, timeAgo } from '../components.js';
import { analysis } from '../utils/analysis.js';

const cities = [bilbao, zaragoza];
let map = null;
let markers = [];
let polylines = [];
let userMarker = null;
let activeCity = 'bilbao';
let activeFilter = 'all';
let activeRoute = null;
let mapReady = false;
let proximityWatchId = null;
let lastProximityAlert = 0;
let completedPoiIds = new Set();
let photoNotificationInterval = null;
let lastPhotoCount = 0;

const PROXIMITY_RADIUS_KM = 3;
const PROXIMITY_ALERT_RADIUS_M = 500;
const PROXIMITY_COOLDOWN_MS = 60000;

const allCategories = [
  { key: 'all', label: 'Tout', icon: '📍' },
  { key: 'monuments', label: 'Monuments', icon: '🏛️' },
  { key: 'viewpoints', label: 'Points de vue', icon: '🔭' },
  { key: 'nature', label: 'Nature', icon: '🌿' },
  { key: 'streetart', label: 'Street Art', icon: '🎨' },
  { key: 'architecture', label: 'Architecture', icon: '🏗️' },
  { key: 'unusual', label: 'Insolite', icon: '✨' },
  { key: 'culture', label: 'Culture', icon: '🎭' },
  { key: 'gastronomy', label: 'Gastronomie', icon: '🍷' }
];

function getCity(id) { return cities.find(c => c.id === id); }

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildGoogleMapsRouteUrl(steps) {
  if (steps.length < 2) return '#';
  const origin = `${steps[0].lat},${steps[0].lng}`;
  const destination = `${steps[steps.length - 1].lat},${steps[steps.length - 1].lng}`;
  const waypoints = steps.slice(1, -1).map(s => `${s.lat},${s.lng}`).join('|');
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
  return url;
}

async function loadCompletedPois() {
  const photos = await db.getAllPhotos();
  completedPoiIds = new Set(photos.map(p => p.poiId).filter(Boolean));
}

export function renderMap(container) {
  updateHeader('Carte');
  activeRoute = null;

  if (map) {
    try { map.remove(); } catch(e) {}
    map = null;
  }
  mapReady = false;

  container.innerHTML = `
    <div class="map-page">
      <div class="map-city-selector">
        ${cities.map(c => `
          <button class="city-tab ${c.id === activeCity ? 'active' : ''}" data-city="${c.id}">${c.flag} ${c.name}</button>
        `).join('')}
      </div>
      <div id="map-view" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0"></div>
      <div class="map-route-selector" id="route-selector"></div>
      <div class="map-filters" id="map-filters">
        ${allCategories.map(c => `
          <button class="filter-chip ${activeFilter === c.key ? 'active' : ''}" data-filter="${c.key}">
            ${c.icon} ${c.label}
          </button>
        `).join('')}
      </div>
      <button class="map-locate-btn" id="btn-locate" aria-label="Ma position">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
      </button>
    </div>
  `;

  loadCompletedPois().then(() => {
    setTimeout(() => initMap(), 50);
  });

  container.querySelectorAll('.city-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeCity = tab.dataset.city;
      activeRoute = null;
      container.querySelectorAll('.city-tab').forEach(t => t.classList.toggle('active', t.dataset.city === activeCity));
      renderRouteSelector();
      updateMapMarkers();
    });
  });

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeFilter = chip.dataset.filter;
      activeRoute = null;
      container.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === activeFilter));
      renderRouteSelector();
      updateMapMarkers();
    });
  });

  document.getElementById('btn-locate')?.addEventListener('click', locateUser);

  renderRouteSelector();
  startProximityWatch();
  startPhotoNotifications();
}

function renderRouteSelector() {
  const el = document.getElementById('route-selector');
  if (!el) return;
  const city = getCity(activeCity);
  if (!city) { el.innerHTML = ''; return; }

  el.innerHTML = `
    <div class="route-selector-scroll">
      <button class="route-chip ${!activeRoute ? 'active' : ''}" data-route="all">📍 Tous les lieux</button>
      ${city.routes.map(r => `
        <button class="route-chip ${activeRoute === r.id ? 'active' : ''}" data-route="${r.id}" style="--route-color:${r.color}">
          ${r.emoji} ${r.name}
        </button>
      `).join('')}
    </div>
  `;

  el.querySelectorAll('.route-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const routeId = chip.dataset.route;
      activeRoute = routeId === 'all' ? null : routeId;
      el.querySelectorAll('.route-chip').forEach(c => c.classList.toggle('active', c.dataset.route === (activeRoute || 'all')));
      updateMapMarkers();
    });
  });
}

function initMap() {
  if (mapReady) return;
  const mapEl = document.getElementById('map-view');
  if (!mapEl) return;

  const city = getCity(activeCity);
  if (!city) return;

  if (map) {
    try { map.remove(); } catch(e) {}
    map = null;
  }

  try {
    map = L.map('map-view', {
      center: city.center,
      zoom: city.zoom,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    mapReady = true;
    updateMapMarkers();
    locateUser();

    setTimeout(() => map.invalidateSize(), 300);
  } catch (e) {
    console.error('Map init error:', e);
    map = null;
    setTimeout(() => initMap(), 500);
  }
}

function updateMapMarkers() {
  if (!map) return;

  markers.forEach(m => map.removeLayer(m));
  polylines.forEach(p => map.removeLayer(p));
  markers = [];
  polylines = [];

  const city = getCity(activeCity);
  if (!city) return;

  map.setView(city.center, city.zoom, { animate: true });

  if (activeRoute) {
    const route = city.routes.find(r => r.id === activeRoute);
    if (route) renderRouteOnMap(route, city);
  } else {
    const pois = activeFilter === 'all' ? city.pois : city.pois.filter(p => p.category === activeFilter);
    pois.forEach(poi => addMarker(poi, city));
    if (pois.length) {
      const bounds = L.latLngBounds(pois.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }
}

function renderRouteOnMap(route, city) {
  const steps = route.steps.map((step, i) => ({
    id: step.poiId || step.id,
    name: step.name,
    description: step.description,
    lat: step.lat,
    lng: step.lng,
    category: step.category,
    emoji: city.categories[step.category]?.icon || '📍',
    stepIndex: i,
    routeId: route.id,
    challenges: step.challenges || []
  }));

  steps.forEach(step => addMarker(step, city, route));

  const mapsUrl = buildGoogleMapsRouteUrl(steps);

  const navBanner = document.getElementById('map-nav-banner');
  if (navBanner) navBanner.remove();

  const banner = document.createElement('div');
  banner.id = 'map-nav-banner';
  banner.className = 'map-nav-banner';
  banner.innerHTML = `
    <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="flex:1">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3,11 22,2 13,21 11,13 3,11"/></svg>
      🚶 Marcher ce parcours sur Maps
    </a>
    <button class="btn btn-secondary btn-sm" id="btn-close-nav-banner">✕</button>
  `;
  document.querySelector('.map-page')?.appendChild(banner);
  document.getElementById('btn-close-nav-banner')?.addEventListener('click', () => banner.remove());

  fetchOSRMRoute(steps, route.color);
}

async function fetchOSRMRoute(steps, color) {
  if (steps.length < 2) return;

  const coords = steps.map(s => `${s.lng},${s.lat}`).join(';');

  try {
    const resp = await fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=true`);
    const data = await resp.json();

    if (data.code === 'Ok' && data.routes?.[0]?.geometry) {
      const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

      const polyline = L.polyline(routeCoords, {
        color: color,
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);
      polylines.push(polyline);

      map.fitBounds(polyline.getBounds(), { padding: [80, 80] });
      return;
    }
  } catch (e) {
    console.warn('OSRM failed, using straight lines:', e);
  }

  const coordsFallback = steps.map(s => [s.lat, s.lng]);
  if (coordsFallback.length > 1) {
    const polyline = L.polyline(coordsFallback, {
      color: color,
      weight: 4,
      opacity: 0.7,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);
    polylines.push(polyline);
  }
  if (coordsFallback.length) {
    map.fitBounds(L.latLngBounds(coordsFallback), { padding: [80, 80] });
  }
}

function addMarker(poi, city, route = null) {
  const cat = city.categories[poi.category];
  const color = cat?.color || '#173B7A';
  const isCompleted = completedPoiIds.has(poi.id);

  let markerHtml;
  if (isCompleted) {
    markerHtml = poi.stepIndex !== undefined
      ? `<div class="custom-marker-route completed-marker" style="background:${color};opacity:0.45">
           <span class="marker-num">${poi.stepIndex + 1}</span>
           <div class="marker-check">✓</div>
         </div>`
      : `<div class="custom-marker completed-marker" style="background:${color};opacity:0.45">
           <span>${poi.emoji || cat?.icon || '📍'}</span>
           <div class="marker-check">✓</div>
         </div>`;
  } else {
    markerHtml = poi.stepIndex !== undefined
      ? `<div class="custom-marker-route" style="background:${color}">
           <span class="marker-num">${poi.stepIndex + 1}</span>
         </div>`
      : `<div class="custom-marker" style="background:${color}">
           <span>${poi.emoji || cat?.icon || '📍'}</span>
         </div>`;
  }

  const icon = L.divIcon({
    className: '',
    html: markerHtml,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(map);

  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}&travelmode=walking`;
  const imgHtml = poi.image ? `<img class="map-popup-img" src="${poi.image}" alt="${poi.name}" loading="lazy" onerror="this.style.display='none'">` : '';
  const popupContent = `
    <div class="map-popup">
      ${imgHtml}
      <div class="map-popup-body">
        ${isCompleted ? '<div style="text-align:center;margin-bottom:8px"><span style="font-size:11px;font-weight:700;color:var(--success);background:rgba(48,209,88,0.12);padding:3px 10px;border-radius:8px">✅ Lieu complété</span></div>' : ''}
        <div class="map-popup-icon" style="background:${color}20;color:${color}">${poi.emoji || cat?.icon || '📍'}</div>
        <div class="map-popup-name">${poi.name}</div>
        <div class="map-popup-cat" style="background:${color}15;color:${color}">${cat?.label || poi.category}</div>
        <p class="map-popup-desc">${poi.description || ''}</p>
        <div class="map-popup-actions">
          <a href="${navigateUrl}" target="_blank" rel="noopener" class="btn btn-primary btn-sm map-nav-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3,11 22,2 13,21 11,13 3,11"/></svg>
            Naviguer
          </a>
          <button class="btn btn-sm map-photo-btn" data-poi-id="${poi.id}" data-route-id="${poi.routeId || ''}" data-poi-name="${poi.name}">
            📸 Photo
          </button>
        </div>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, { maxWidth: 260, className: 'glass-popup' });
  marker.poiData = poi;
  markers.push(marker);

  marker.on('popupopen', () => {
    const photoBtn = document.querySelector(`.map-photo-btn[data-poi-id="${poi.id}"]`);
    if (photoBtn) {
      photoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startMapPhoto(poi, route);
      });
    }
  });
}

function startMapPhoto(poi, route) {
  const content = `
    <div class="camera-view" id="camera-container">
      <video id="camera-video" autoplay playsinline></video>
      <canvas id="camera-canvas"></canvas>
    </div>
    <div class="camera-controls">
      <button class="btn btn-secondary btn-icon" id="btn-switch-camera">🔄</button>
      <button class="camera-btn" id="btn-capture"></button>
      <button class="btn btn-secondary btn-icon" id="btn-upload">📁</button>
    </div>
    <input type="file" id="file-input" accept="image/*" style="display:none">
    <div id="photo-result"></div>
    <div id="challenge-score"></div>
  `;

  showModal(`📸 ${poi.name}`, content, []);

  setTimeout(() => initCameraForPoi(poi, route), 100);
}

async function initCameraForPoi(poi, route) {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const fileInput = document.getElementById('file-input');
  const resultDiv = document.getElementById('photo-result');
  const scoreDiv = document.getElementById('challenge-score');

  let stream = null;
  let facingMode = 'environment';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
  } catch (err) {
    console.log('Camera not available');
  }

  document.getElementById('btn-switch-camera')?.addEventListener('click', async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      video.srcObject = stream;
    } catch (err) {}
  });

  document.getElementById('btn-upload')?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => processMapPhoto(ev.target.result, poi, route, resultDiv, scoreDiv);
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-capture')?.addEventListener('click', () => {
    if (video?.srcObject) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      processMapPhoto(canvas.toDataURL('image/jpeg', 0.9), poi, route, resultDiv, scoreDiv);
    }
  });
}

async function processMapPhoto(photoData, poi, route, resultDiv, scoreDiv) {
  analysis.init();
  resultDiv.innerHTML = `<div class="photo-result"><img src="${photoData}" alt="Photo"></div>`;
  scoreDiv.innerHTML = '<div style="text-align:center;padding:16px"><div class="splash-loader-bar" style="width:80px;margin:0 auto"></div><p style="margin-top:8px;color:var(--text-secondary);font-size:13px">Vérification de la position...</p></div>';

  const inRadius = await checkPhotoLocation(poi);
  if (!inRadius) {
    scoreDiv.innerHTML = `
      <div style="text-align:center;padding:20px">
        <div style="font-size:48px;margin-bottom:8px">📍</div>
        <div style="font-size:15px;font-weight:700;color:var(--danger);margin-bottom:4px">Trop loin du lieu !</div>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.4">Vous devez être à moins de ${PROXIMITY_RADIUS_KM} km de <strong>${poi.name}</strong> pour prendre une photo.</p>
        <button class="btn btn-primary" style="margin-top:16px" id="btn-retry-location">🔄 Réessayer</button>
      </div>
    `;
    document.getElementById('btn-retry-location')?.addEventListener('click', () => {
      processMapPhoto(photoData, poi, route, resultDiv, scoreDiv);
    });
    return;
  }

  scoreDiv.innerHTML = '<div style="text-align:center;padding:16px"><div class="splash-loader-bar" style="width:80px;margin:0 auto"></div><p style="margin-top:8px;color:var(--text-secondary);font-size:13px">Analyse IA en cours...</p></div>';

  try {
    const result = await analysis.detectObjectPresence(photoData, 'plaza');
    const passed = result.passed;
    const points = Math.round(50 * result.score / 100);

    scoreDiv.innerHTML = `
      <div class="photo-score">
        <div class="photo-score-value">${result.score}%</div>
        <div class="photo-score-label">${passed ? (result.score >= 70 ? '🌟 Photo validée !' : '✅ Acceptée') : '🤔 À retenter — seuil non atteint'}</div>
      </div>
      <div style="padding:0 16px 16px;display:flex;gap:8px">
        <button class="btn btn-secondary" style="flex:1" id="btn-retake">🔄 Reprendre</button>
        ${passed ? `<button class="btn btn-primary" style="flex:1" id="btn-save-photo">✓ Valider (+${points} pts)</button>` : ''}
      </div>
    `;

    document.getElementById('btn-retake')?.addEventListener('click', () => {
      resultDiv.innerHTML = '';
      scoreDiv.innerHTML = '';
      startMapPhoto(poi, route);
    });

    document.getElementById('btn-save-photo')?.addEventListener('click', async () => {
      const photo = {
        id: genId(),
        data: photoData,
        poiId: poi.id,
        poiName: poi.name,
        city: poi.category,
        routeId: route?.id || '',
        score: result.score,
        points,
        lat: poi.lat,
        lng: poi.lng,
        timestamp: Date.now()
      };
      await db.addPhoto(photo);
      await db.addHistory({
        id: genId(),
        type: 'photo_taken',
        title: `Photo de ${poi.name}`,
        detail: `Score: ${result.score}% — +${points} pts`,
        timestamp: Date.now()
      });
      completedPoiIds.add(poi.id);
      showToast(`📸 Photo de "${poi.name}" sauvegardée ! +${points} pts`, 'success');
      document.querySelector('.modal-close')?.click();
      updateMapMarkers();
    });
  } catch (err) {
    console.error(err);
    scoreDiv.innerHTML = `<div style="text-align:center;padding:16px;color:var(--danger)">Erreur lors de l'analyse</div>`;
  }
}

function checkPhotoLocation(poi) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const dist = haversineDistance(pos.coords.latitude, pos.coords.longitude, poi.lat, poi.lng);
        resolve(dist <= PROXIMITY_RADIUS_KM);
      },
      () => resolve(true),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

function startProximityWatch() {
  if (proximityWatchId) return;
  if (!navigator.geolocation) return;

  proximityWatchId = navigator.geolocation.watchPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      const now = Date.now();
      if (now - lastProximityAlert < PROXIMITY_COOLDOWN_MS) return;

      const city = getCity(activeCity);
      if (!city) return;

      for (const poi of city.pois) {
        if (completedPoiIds.has(poi.id)) continue;
        const dist = haversineDistance(latitude, longitude, poi.lat, poi.lng);
        if (dist <= PROXIMITY_RADIUS_KM) {
          const distM = Math.round(dist * 1000);
          const cat = city.categories[poi.category];
          showToast(`📍 Vous êtes à ${distM}m de "${poi.name}" ${cat?.icon || ''}`, 'info', 5000);
          lastProximityAlert = now;
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`📍 Proche de ${poi.name}`, {
              body: `À ${distM}m — ${poi.description?.substring(0, 60) || 'Explorez ce lieu'}`,
              icon: '/icons/icon-192.png'
            });
          }
          break;
        }
      }
    },
    () => {},
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
}

function startPhotoNotifications() {
  if (photoNotificationInterval) return;
  db.getAllPhotos().then(photos => { lastPhotoCount = photos.length; });
  photoNotificationInterval = setInterval(async () => {
    const photos = await db.getAllPhotos();
    if (photos.length > lastPhotoCount) {
      const newPhotos = photos.length - lastPhotoCount;
      if (newPhotos > 0) {
        showToast(`📸 ${newPhotos} nouvelle${newPhotos > 1 ? 's' : ''} photo${newPhotos > 1 ? 's' : ''} publiée${newPhotos > 1 ? 's' : ''} !`, 'info', 4000);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('📸 Nouvelle photo !', {
            body: `${newPhotos} photo${newPhotos > 1 ? 's' : ''} prise${newPhotos > 1 ? 's' : ''} par un autre explorateur`,
            icon: '/icons/icon-192.png'
          });
        }
      }
      lastPhotoCount = photos.length;
    }
  }, 15000);
}

function locateUser() {
  if (!navigator.geolocation || !map) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      if (userMarker) map.removeLayer(userMarker);
      const icon = L.divIcon({
        className: '',
        html: '<div class="user-location-marker"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      userMarker = L.marker([latitude, longitude], { icon }).addTo(map);
      userMarker.bindPopup('<b>📍 Vous êtes ici</b>');
      map.setView([latitude, longitude], map.getZoom(), { animate: true });
    },
    () => {},
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

export function selectCity(cityId) {
  activeCity = cityId;
  activeRoute = null;
  if (map) {
    const city = getCity(cityId);
    if (city) map.setView(city.center, city.zoom, { animate: true });
    renderRouteSelector();
    updateMapMarkers();
  }
}

window.addEventListener('selectCity', e => selectCity(e.detail));
