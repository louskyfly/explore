import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, getStatusById, getTagColor } from '../components.js';

export async function renderMap(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Carte');

  container.innerHTML = `
    <div class="page map-page">
      <div id="explore-map" class="full-map"></div>
      <div class="map-search-container">
        <input type="text" class="search-input map-search-input" id="map-search" placeholder="Rechercher un lieu...">
      </div>
      <div id="map-search-results" class="map-search-results hidden"></div>
    </div>
  `;

  setTimeout(async () => {
    const map = L.map('explore-map', { zoomControl: false }).setView([46.6, 1.8], 6);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const activities = await db.getActivities(profile);
    const markers = L.layerGroup();

    activities.forEach(a => {
      if (!a.lat || !a.lng) return;
      const status = getStatusById(a.status);
      const marker = L.circleMarker([a.lat, a.lng], {
        radius: 8,
        fillColor: status.color,
        color: '#fff',
        weight: 2,
        fillOpacity: 0.9
      });
      const tagsHtml = (a.tags || []).map(t => `<span class="tag-dot" style="background:${getTagColor(t)};display:inline-block;width:8px;height:8px;border-radius:50%;margin:0 1px;"></span>`).join('');
      const popupContent = `
        <div class="map-popup">
          ${a.image ? `<img src="${a.image}" class="map-popup-image" alt="${a.title}">` : ''}
          <div class="map-popup-body">
            <h3>${a.title}</h3>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
              <span style="font-size:11px;color:${status.color}">${status.icon} ${status.label}</span>
              ${tagsHtml}
            </div>
            ${a.locationName ? `<p class="map-popup-location">${a.locationName}</p>` : ''}
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { className: 'explore-popup' });
      marker.activityId = a.id;
      marker.on('click', () => {
        setTimeout(() => {
          const popup = map.getPopup();
          if (popup) {
            popup.on('click', () => {
              window.dispatchEvent(new CustomEvent('navigate-activity', { detail: a.id }));
            });
            popup.getElement()?.querySelector('.map-popup-body')?.addEventListener('click', () => {
              window.dispatchEvent(new CustomEvent('navigate-activity', { detail: a.id }));
            });
          }
        }, 50);
      });
      markers.addLayer(marker);
    });

    markers.addTo(map);

    if (activities.length > 0) {
      const bounds = markers.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.2));
      }
    }

    const searchInput = container.querySelector('#map-search');
    const resultsDiv = container.querySelector('#map-search-results');
    let debounce;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = searchInput.value.trim();
      if (q.length < 3) {
        resultsDiv.classList.add('hidden');
        return;
      }
      debounce = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`, {
            headers: { 'User-Agent': 'ExplorePWA/1.0' }
          });
          const data = await res.json();
          if (data.length === 0) {
            resultsDiv.innerHTML = '<div class="map-search-item">Aucun resultat</div>';
          } else {
            resultsDiv.innerHTML = data.map(r => `
              <div class="map-search-item" data-lat="${r.lat}" data-lon="${r.lon}">
                ${r.display_name.split(',').slice(0, 3).join(',')}
              </div>
            `).join('');
            resultsDiv.querySelectorAll('.map-search-item[data-lat]').forEach(item => {
              item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                map.setView([lat, lon], 14);
                resultsDiv.classList.add('hidden');
                searchInput.value = '';
              });
            });
          }
          resultsDiv.classList.remove('hidden');
        } catch (e) {
          console.error('Search error:', e);
        }
      }, 300);
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => resultsDiv.classList.add('hidden'), 200);
    });
  }, 50);
}
