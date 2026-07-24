import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, showToast, getCategoryById, getStatusById } from '../components.js';

let map = null;
let markers = [];

export async function renderMap(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Carte');

  container.innerHTML = `
    <div class="page" style="padding:0;height:100%;position:relative;">
      <div id="map-view" style="width:100%;height:100%;"></div>
      <button class="map-locate-btn" id="btn-locate" aria-label="Ma position">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3m10-10h-3M5 12H2"/></svg>
      </button>
      <div class="search-bar" style="position:absolute;top:12px;left:12px;right:12px;z-index:50;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="map-search" placeholder="Rechercher un lieu...">
      </div>
      <div id="map-search-results" style="position:absolute;top:56px;left:12px;right:12px;z-index:50;display:none;"></div>
    </div>
  `;

  setTimeout(() => {
    try {
      map = L.map('map-view', {
        zoomControl: false,
        attributionControl: false
      }).setView([48.8566, 2.3522], 5);

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

      loadMarkers(profile);

      document.getElementById('btn-locate').addEventListener('click', () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
          }, () => showToast('Position indisponible', 'error'));
        }
      });
    } catch (e) {
      console.error('Map error:', e);
    }
  }, 100);

  const searchInput = container.querySelector('#map-search');
  const resultsDiv = container.querySelector('#map-search-results');
  let searchTimeout = null;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 3) {
      resultsDiv.style.display = 'none';
      return;
    }
    searchTimeout = setTimeout(async () => {
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&accept-language=fr`);
        const results = await resp.json();
        if (results.length === 0) {
          resultsDiv.style.display = 'none';
          return;
        }
        resultsDiv.style.display = 'block';
        resultsDiv.className = 'glass-card';
        resultsDiv.style.padding = '8px';
        resultsDiv.innerHTML = results.map(r => `
          <div class="search-result-item" data-lat="${r.lat}" data-lng="${r.lon}" data-name="${escapeAttr(r.display_name)}" style="padding:10px 12px;border-radius:10px;cursor:pointer;font-size:13px;color:var(--text-primary);transition:background 0.15s;">
            \uD83D\uDCCD ${escapeHtml(r.display_name.length > 60 ? r.display_name.substring(0, 60) + '...' : r.display_name)}
          </div>
        `).join('');

        resultsDiv.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            map.setView([lat, lng], 15);
            resultsDiv.style.display = 'none';
            searchInput.value = '';
          });
          item.addEventListener('mouseenter', () => { item.style.background = 'var(--ripple)'; });
          item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
        });
      } catch (e) {}
    }, 400);
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => { resultsDiv.style.display = 'none'; }, 200);
  });
}

async function loadMarkers(profile) {
  if (!map) return;
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const activities = await db.getActivitiesByProfile(profile);
  const withCoords = activities.filter(a => a.lat && a.lng);

  withCoords.forEach(a => {
    const cat = getCategoryById(a.category);
    const status = getStatusById(a.status);

    const icon = L.divIcon({
      className: '',
      html: `<div class="custom-marker" style="background:${status.color};border:2px solid rgba(255,255,255,0.4);">
        <span>${cat.icon}</span>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });

    const marker = L.marker([a.lat, a.lng], { icon }).addTo(map);
    const popupImg = a.image ? `<img src="${a.image}" style="width:100%;height:100px;object-fit:cover;border-radius:10px 10px 0 0;">` : '';
    marker.bindPopup(`
      <div class="map-popup">
        ${popupImg}
        <div style="padding:12px;">
          <div class="map-popup-title">${escapeHtml(a.title)}</div>
          <div style="display:flex;gap:6px;margin:6px 0;">
            <span class="status-pill ${status.cssClass}" style="font-size:11px;">${status.icon} ${status.label}</span>
            <span class="activity-category ${cat.cssClass}" style="font-size:11px;">${cat.label}</span>
          </div>
          <div class="map-popup-actions">
            <button class="btn btn-sm btn-primary" onclick="window.dispatchEvent(new CustomEvent('navigate-detail',{detail:{id:'${a.id}'}}))">Voir</button>
          </div>
        </div>
      </div>
    `, { className: 'glass-popup', maxWidth: 260 });
    markers.push(marker);
  });
}

export function refreshMapMarkers() {
  const profile = getCurrentProfile();
  if (profile && map) loadMarkers(profile);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;');
}
