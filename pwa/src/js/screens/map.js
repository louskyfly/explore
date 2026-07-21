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
function getRoute(cityId, routeId) { return getCity(cityId)?.routes.find(r => r.id === routeId); }

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

  setTimeout(() => initMap(), 50);

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
  const coords = [];
  route.steps.forEach((step, i) => {
    addMarker({
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
    }, city, route);

    coords.push([step.lat, step.lng]);
  });

  if (coords.length > 1) {
    const polyline = L.polyline(coords, {
      color: route.color,
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
      lineCap: 'round'
    }).addTo(map);
    polylines.push(polyline);
  }

  if (coords.length) {
    map.fitBounds(L.latLngBounds(coords), { padding: [80, 80] });
  }
}

function addMarker(poi, city, route = null) {
  const cat = city.categories[poi.category];
  const color = cat?.color || '#173B7A';

  const markerHtml = poi.stepIndex !== undefined
    ? `<div class="custom-marker-route" style="background:${color}">
         <span class="marker-num">${poi.stepIndex + 1}</span>
       </div>`
    : `<div class="custom-marker" style="background:${color}">
         <span>${poi.emoji || cat?.icon || '📍'}</span>
       </div>`;

  const icon = L.divIcon({
    className: '',
    html: markerHtml,
    iconSize: [36, 36],
    iconAnchor: [18, 36]
  });

  const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(map);

  const navigateUrl = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`;
  const popupContent = `
    <div class="map-popup">
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
  scoreDiv.innerHTML = '<div style="text-align:center;padding:16px"><div class="splash-loader-bar" style="width:80px;margin:0 auto"></div><p style="margin-top:8px;color:var(--text-secondary);font-size:13px">Analyse...</p></div>';

  try {
    const result = await analysis.detectObjectPresence(photoData, 'plaza');
    const points = Math.round(50 * result.score / 100);

    scoreDiv.innerHTML = `
      <div class="photo-score">
        <div class="photo-score-value">${result.score}%</div>
        <div class="photo-score-label">${result.score >= 70 ? '🌟 Photo validée !' : result.score >= 40 ? '👍 Pas mal !' : '🤔 À retenter'}</div>
      </div>
      <div style="padding:0 16px 16px;display:flex;gap:8px">
        <button class="btn btn-secondary" style="flex:1" id="btn-retake">🔄 Retake</button>
        <button class="btn btn-primary" style="flex:1" id="btn-save-photo">✓ Valider</button>
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
        detail: `Score: ${result.score}% - +${points} pts`,
        timestamp: Date.now()
      });
      showToast(`📸 Photo de "${poi.name}" sauvegardée !`, 'success');
      document.querySelector('.modal-close')?.click();
    });
  } catch (err) {
    console.error(err);
    scoreDiv.innerHTML = `<div style="text-align:center;padding:16px;color:var(--danger)">Erreur d'analyse</div>`;
  }
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
