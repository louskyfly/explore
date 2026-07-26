import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, formatDate, getStatusById, getTagColor, STATUSES } from '../components.js';

export async function renderHome(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Explore');

  const activities = await db.getActivities(profile);
  activities.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

  const allTags = await db.getSetting('all_tags') || [];
  const usedTags = [...new Set(activities.flatMap(a => a.tags || []))].sort();
  const tagsToShow = usedTags.length > 0 ? usedTags : allTags;

  container.innerHTML = `
    <div class="page">
      <div class="search-container">
        <input type="text" class="search-input" id="search-input" placeholder="Rechercher...">
      </div>
      <div class="filter-chips" id="filter-chips">
        <button class="filter-chip active" data-filter="all">Toutes</button>
        ${tagsToShow.map(t => `
          <button class="filter-chip" data-filter="${t}" style="--chip-color:${getTagColor(t)}">
            <span class="tag-dot" style="background:${getTagColor(t)}"></span>
            ${t}
          </button>
        `).join('')}
      </div>
      <div id="activities-list"></div>
      <button class="fab" id="fab-add" aria-label="Ajouter">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  `;

  let currentFilter = 'all';
  let searchQuery = '';

  function getFiltered() {
    let filtered = activities;
    if (currentFilter !== 'all') {
      filtered = filtered.filter(a => (a.tags || []).includes(currentFilter));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q) ||
        (a.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (a.locationName || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  function cardHtml(a) {
    const firstTag = (a.tags || [])[0] || null;
    const tagColor = firstTag ? getTagColor(firstTag) : 'var(--accent)';
    const status = getStatusById(a.status);
    if (a.image) {
      return `
        <div class="activity-card" data-id="${a.id}">
          <div class="activity-card-image"><img src="${a.image}" alt="${a.title}" loading="lazy"></div>
          <div class="activity-card-body">
            <div class="activity-card-title">${a.title}</div>
            ${firstTag ? `<span class="activity-card-tag" style="background:${tagColor}22;color:${tagColor}">${firstTag}</span>` : ''}
            <div class="activity-card-location">${status.icon} ${a.locationName || status.label}</div>
          </div>
        </div>
      `;
    }
    return `
      <div class="activity-card no-image" data-id="${a.id}">
        <div class="activity-card-image" style="background:${tagColor}"></div>
        <div class="activity-card-body">
          <div class="activity-card-title">${a.title}</div>
          ${firstTag ? `<span class="activity-card-tag" style="background:${tagColor}22;color:${tagColor}">${firstTag}</span>` : ''}
          <div class="activity-card-location">${status.icon} ${a.locationName || status.label}</div>
        </div>
      </div>
    `;
  }

  function renderList() {
    const list = container.querySelector('#activities-list');
    const filtered = getFiltered();

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">\uD83C\uDF1F</div>
        <p>${activities.length === 0 ? 'Aucune activite pour l\'instant !' : 'Aucun resultat'}</p>
        <p class="text-secondary" style="font-size:13px">${activities.length === 0 ? 'Appuie sur + pour en ajouter une' : 'Essaie d\'autres filtres'}</p>
      </div>`;
      return;
    }

    if (currentFilter !== 'all') {
      list.innerHTML = `<div class="activities-grid">${filtered.map(cardHtml).join('')}</div>`;
    } else {
      const groups = {};
      filtered.forEach(a => {
        const tag = (a.tags || [])[0] || 'Sans tag';
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(a);
      });

      const order = [...new Set(filtered.flatMap(a => (a.tags || [])[0] || 'Sans tag'))];
      list.innerHTML = order.map(tag => {
        const items = groups[tag];
        const color = getTagColor(tag);
        return `
          <div class="tag-section">
            <div class="tag-section-header">
              <div class="tag-section-dot" style="background:${color}"></div>
              <div class="tag-section-title">${tag}</div>
            </div>
            <div class="activities-grid">${items.map(cardHtml).join('')}</div>
          </div>
        `;
      }).join('');
    }

    list.querySelectorAll('.activity-card').forEach(card => {
      card.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('navigate-detail', { detail: { id: card.dataset.id } }));
      });
    });
  }

  renderList();

  container.querySelector('#search-input').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderList();
  });

  container.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderList();
    });
  });

  container.querySelector('#fab-add').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate-create'));
  });
}
