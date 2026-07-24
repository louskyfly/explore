import { updateHeader, showToast } from '../components.js';

export function renderLocationPicker(container, params) {
  updateHeader('Choisir un lieu');

  const initialLat = params?.lat || 46.6;
  const initialLng = params?.lng || 1.8;

  container.innerHTML = `
    <div class="page" style="padding:0;display:flex;flex-direction:column;height:100%">
      <div class="picker-search-container">
        <input type="text" class="search-input" id="picker-search" placeholder="Rechercher une adresse..." autocomplete="off">
        <div id="picker-search-results" class="picker-search-results hidden"></div>
      </div>
      <div id="picker-map" class="picker-map"></div>
      <div class="picker-footer">
        <div id="picker-selected" class="picker-selected">
          <span class="picker-pin">\uD83D\uDCCD</span>
          <span id="picker-address">Appuie sur la carte ou recherche un lieu</span>
        </div>
        <button class="btn btn-primary" id="picker-confirm">Confirmer</button>
      </div>
    </div>
  `;

  let marker = null;
  let selectedLat = initialLat;
  let selectedLng = initialLng;
  let selectedName = '';

  const map = L.map('picker-map', { zoomControl: false }).setView([initialLat, initialLng], 13);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 100);

  if (params?.lat && params?.lng) {
    marker = L.circleMarker([params.lat, params.lng], {
      radius: 10, fillColor: '#EC407A', color: '#fff', weight: 3, fillOpacity: 0.9
    }).addTo(map);
    reverseGeocode(params.lat, params.lng);
  }

  async function reverseGeocode(lat, lng) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { 'User-Agent': 'ExplorePWA/1.0' } }
      );
      const data = await res.json();
      selectedName = data.display_name || '';
      const short = shortenAddress(data);
      document.getElementById('picker-address').textContent = short || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      selectedName = '';
      document.getElementById('picker-address').textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  function shortenAddress(data) {
    if (!data) return '';
    const addr = data.address || {};
    const parts = [];
    if (addr.house_number && addr.road) {
      parts.push(`${addr.road} ${addr.house_number}`);
    } else if (addr.road) {
      parts.push(addr.road);
    }
    if (addr.city || addr.town || addr.village) {
      parts.push(addr.city || addr.town || addr.village);
    }
    return parts.join(', ') || data.display_name?.split(',').slice(0, 2).join(',') || '';
  }

  function placeMarker(lat, lng) {
    selectedLat = lat;
    selectedLng = lng;
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else {
      marker = L.circleMarker([lat, lng], {
        radius: 10, fillColor: '#EC407A', color: '#fff', weight: 3, fillOpacity: 0.9
      }).addTo(map);
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
    reverseGeocode(lat, lng);
  }

  map.on('click', (e) => {
    placeMarker(e.latlng.lat, e.latlng.lng);
  });

  let debounce;
  const searchInput = container.querySelector('#picker-search');
  const resultsDiv = container.querySelector('#picker-search-results');

  searchInput.addEventListener('input', () => {
    clearTimeout(debounce);
    const q = searchInput.value.trim();
    if (q.length < 3) {
      resultsDiv.classList.add('hidden');
      return;
    }
    debounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6&addressdetails=1`,
          { headers: { 'User-Agent': 'ExplorePWA/1.0' } }
        );
        const data = await res.json();
        if (data.length === 0) {
          resultsDiv.innerHTML = '<div class="picker-search-item empty">Aucun resultat</div>';
        } else {
          resultsDiv.innerHTML = data.map(r => `
            <div class="picker-search-item" data-lat="${r.lat}" data-lon="${r.lon}">
              <div class="picker-search-icon">\uD83D\uDCCD</div>
              <div class="picker-search-text">
                <div class="picker-search-name">${shortenAddress(r)}</div>
                <div class="picker-search-detail">${r.display_name.split(',').slice(0, 4).join(',')}</div>
              </div>
            </div>
          `).join('');

          resultsDiv.querySelectorAll('.picker-search-item[data-lat]').forEach(item => {
            item.addEventListener('click', () => {
              const lat = parseFloat(item.dataset.lat);
              const lon = parseFloat(item.dataset.lon);
              placeMarker(lat, lon);
              resultsDiv.classList.add('hidden');
              searchInput.value = '';
            });
          });
        }
        resultsDiv.classList.remove('hidden');
      } catch (e) {
        console.error('Nominatim error:', e);
        showToast('Erreur de recherche', 'error');
      }
    }, 400);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const firstItem = resultsDiv.querySelector('.picker-search-item[data-lat]');
      if (firstItem) firstItem.click();
    }
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => resultsDiv.classList.add('hidden'), 250);
  });

  searchInput.addEventListener('focus', () => {
    if (resultsDiv.children.length > 0) resultsDiv.classList.remove('hidden');
  });

  container.querySelector('#picker-confirm').addEventListener('click', () => {
    if (params?.onSelect) {
      params.onSelect(selectedLat, selectedLng, selectedName);
    }
    window.history.back();
  });
}
