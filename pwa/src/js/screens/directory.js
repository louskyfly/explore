import { bilbao } from '../data/bilbao.js';
import { zaragoza } from '../data/zaragoza.js';
import { db } from '../db.js';
import { updateHeader, showModal, showToast } from '../components.js';

const cities = [bilbao, zaragoza];

let selectedCity = 'bilbao';
let selectedCategory = 'all';
let sortBy = 'alpha';
let userPosition = null;

function getCurrentCity() {
  return cities.find(c => c.id === selectedCity) || cities[0];
}

function getFilteredPois() {
  const city = getCurrentCity();
  let pois = city.pois.map(p => ({ ...p, catInfo: city.categories[p.category] }));
  if (selectedCategory !== 'all') {
    pois = pois.filter(p => p.category === selectedCategory);
  }
  if (sortBy === 'alpha') {
    pois.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  } else if (sortBy === 'category') {
    pois.sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name, 'fr'));
  } else if (sortBy === 'nearby' && userPosition) {
    pois.forEach(p => {
      p._dist = getDistance(userPosition.lat, userPosition.lng, p.lat, p.lng);
    });
    pois.sort((a, b) => (a._dist || 99999) - (b._dist || 99999));
  }
  return pois;
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km) {
  if (km < 1) return Math.round(km * 1000) + ' m';
  return km.toFixed(1) + ' km';
}

export async function renderDirectory(container) {
  updateHeader('Annuaire');

  if (!userPosition && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => { userPosition = pos.coords; refreshList(container); },
      () => {},
      { enableHighAccuracy: false, timeout: 5000 }
    );
  }

  const allProgress = await db.getAllProgress();
  const allPhotos = await db.getAllPhotos();

  container.innerHTML = buildHTML(allProgress, allPhotos);
  bindEvents(container, allProgress, allPhotos);
}

function refreshList(container) {
  const allProgress = [];
  const allPhotos = [];
  db.getAllProgress().then(p => {
    allProgress.push(...p);
    return db.getAllPhotos();
  }).then(photos => {
    allPhotos.push(...photos);
    const listEl = container.querySelector('#directory-list');
    if (listEl) {
      listEl.innerHTML = buildPoiCards(allProgress, allPhotos);
      bindCardEvents(container, allProgress, allPhotos);
    }
  });
}

function buildHTML(allProgress, allPhotos) {
  const city = getCurrentCity();
  const cats = city.categories;

  return `<div class="page">
    <div class="dir-city-tabs" style="display:flex;gap:8px;margin-bottom:12px;">
      ${cities.map(c => `<button class="city-tab ${c.id === selectedCity ? 'active' : ''}" data-city-select="${c.id}">${c.flag} ${c.name}</button>`).join('')}
    </div>

    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:12px;scrollbar-width:none" class="dir-chips-scroll">
      <button class="filter-chip ${selectedCategory === 'all' ? 'active' : ''}" data-dir-cat="all">Tous</button>
      ${Object.entries(cats).map(([key, val]) => `<button class="filter-chip ${selectedCategory === key ? 'active' : ''}" data-dir-cat="${key}">${val.icon} ${val.label}</button>`).join('')}
    </div>

    <div style="display:flex;gap:6px;margin-bottom:16px;">
      <select class="input" style="padding:8px 12px;font-size:13px;border-radius:10px;" id="dir-sort">
        <option value="alpha" ${sortBy === 'alpha' ? 'selected' : ''}>A → Z</option>
        <option value="category" ${sortBy === 'category' ? 'selected' : ''}>Par catégorie</option>
        <option value="nearby" ${sortBy === 'nearby' ? 'selected' : ''}>Proximité</option>
      </select>
    </div>

    <div id="directory-list">
      ${buildPoiCards(allProgress, allPhotos)}
    </div>
  </div>`;
}

function buildPoiCards(allProgress, allPhotos) {
  const pois = getFilteredPois();
  const city = getCurrentCity();
  if (pois.length === 0) {
    return `<div class="empty-state"><div class="empty-state-icon">🔍</div><h3>Aucun lieu</h3><p>Essayez un autre filtre</p></div>`;
  }
  return pois.map(p => {
    const dist = (userPosition && p.lat && p.lng)
      ? `<span style="font-size:11px;color:var(--text-tertiary);">· ${formatDist(getDistance(userPosition.lat, userPosition.lng, p.lat, p.lng))}</span>`
      : '';
    const catColor = p.catInfo?.color || '#888';
    return `<div class="glass-card" style="border-radius:14px;padding:0;margin-bottom:10px;overflow:hidden;cursor:pointer" data-poi-card="${p.id}">
      <div style="display:flex;gap:12px;padding:12px;align-items:flex-start;">
        <div style="width:64px;height:64px;border-radius:12px;overflow:hidden;flex-shrink:0;background:linear-gradient(135deg,${catColor}33,${catColor}11);">
          <img src="${p.image || ''}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px\\'>${p.emoji || '📍'}</div>'">
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:15px;font-weight:600;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
          <span class="category-pill" style="background:${catColor}22;color:${catColor};font-size:10px;padding:2px 6px;border-radius:4px;">${p.catInfo?.icon || ''} ${p.catInfo?.label || p.category}</span>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.4;">${p.description || ''}</div>
          ${dist ? `<div style="margin-top:4px;">🧭 ${dist}</div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function bindEvents(container, allProgress, allPhotos) {
  container.querySelectorAll('[data-city-select]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCity = btn.dataset.citySelect;
      selectedCategory = 'all';
      renderDirectory(container);
    });
  });

  container.querySelectorAll('[data-dir-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.dirCat;
      updateChips(container);
      updateList(container, allProgress, allPhotos);
    });
  });

  const sortEl = container.querySelector('#dir-sort');
  if (sortEl) {
    sortEl.addEventListener('change', () => {
      sortBy = sortEl.value;
      updateList(container, allProgress, allPhotos);
    });
  }

  bindCardEvents(container, allProgress, allPhotos);
}

function updateChips(container) {
  container.querySelectorAll('[data-dir-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dirCat === selectedCategory);
  });
}

function updateList(container, allProgress, allPhotos) {
  const listEl = container.querySelector('#directory-list');
  if (listEl) {
    listEl.innerHTML = buildPoiCards(allProgress, allPhotos);
    bindCardEvents(container, allProgress, allPhotos);
  }
}

function bindCardEvents(container, allProgress, allPhotos) {
  container.querySelectorAll('[data-poi-card]').forEach(card => {
    card.addEventListener('click', async () => {
      const poiId = card.dataset.poiCard;
      showPoiDetail(poiId, allProgress, allPhotos);
    });
  });
}

function showPoiDetail(poiId, allProgress, allPhotos) {
  const allPois = [];
  cities.forEach(c => c.pois.forEach(p => allPois.push({ ...p, catInfo: c.categories[p.category], cityName: c.name, cityFlag: c.flag })));
  const poi = allPois.find(p => p.id === poiId);
  if (!poi) return;

  const catColor = poi.catInfo?.color || '#888';
  const dist = (userPosition && poi.lat && poi.lng)
    ? formatDist(getDistance(userPosition.lat, userPosition.lng, poi.lat, poi.lng))
    : '';

  const content = `
    <div style="border-radius:14px;overflow:hidden;margin:-4px -4px 16px;">
      ${poi.image
        ? `<img src="${poi.image}" alt="${poi.name}" style="width:100%;height:200px;object-fit:cover;" onerror="this.outerHTML='<div style=\\'width:100%;height:200px;background:linear-gradient(135deg,${catColor}33,${catColor}11);display:flex;align-items:center;justify-content:center;font-size:64px\\'>${poi.emoji || '📍'}</div>'">`
        : `<div style="width:100%;height:200px;background:linear-gradient(135deg,${catColor}33,${catColor}11);display:flex;align-items:center;justify-content:center;font-size:64px;">${poi.emoji || '📍'}</div>`
      }
    </div>
    <span class="category-pill" style="background:${catColor}22;color:${catColor};margin-bottom:12px;display:inline-flex;">${poi.catInfo?.icon || ''} ${poi.catInfo?.label || poi.category}</span>
    <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">${poi.description || ''}</p>
    ${dist ? `<p style="font-size:13px;color:var(--text-tertiary);margin-bottom:12px;">📍 ${dist}</p>` : ''}
    ${poi.lat && poi.lng ? `<p style="font-size:11px;color:var(--text-tertiary);">📍 ${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}</p>` : ''}
  `;

  showModal(poi.name, content, [
    {
      id: 'navigate',
      label: '🧭 Naviguer',
      class: 'btn-secondary',
      onClick: () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${poi.lat},${poi.lng}`;
        window.open(url, '_blank');
      }
    },
    {
      id: 'validate',
      label: '📸 Valider ce lieu',
      class: 'btn-primary',
      onClick: async () => {
        const teamId = await db.getSetting('currentTeam');
        if (!teamId) {
          showToast('Aucune équipe sélectionnée', 'error');
          return;
        }
        const progress = await db.getAllProgress();
        let prog = progress.find(p => p.teamId === teamId && p.poiId === poi.id);
        if (prog) {
          prog.completed = true;
          prog.completedAt = Date.now();
        } else {
          prog = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            teamId,
            poiId: poi.id,
            city: selectedCity,
            routeId: '',
            completed: true,
            completedAt: Date.now()
          };
        }
        await db.saveProgress(prog);
        showToast('✓ Lieu validé !', 'success');
      }
    }
  ]);
}
