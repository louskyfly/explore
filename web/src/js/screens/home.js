import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, formatDate, timeAgo, getStatusById, getTagColor, STATUSES, showModal } from '../components.js';

export async function renderHome(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Explore');

  const activities = await db.getActivities(profile);
  activities.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));

  container.innerHTML = `
    <div class="page">
      <div class="search-container">
        <input type="text" class="search-input" id="search-input" placeholder="Rechercher...">
      </div>
      <div class="filter-chips" id="filter-chips">
        <button class="filter-chip active" data-filter="all">Toutes</button>
        ${STATUSES.map(s => `
          <button class="filter-chip" data-filter="${s.id}">${s.icon} ${s.label}</button>
        `).join('')}
      </div>
      <div id="activities-list" class="activities-grid"></div>
      <button class="fab" id="fab-add" aria-label="Ajouter">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>
  `;

  let currentFilter = 'all';
  let searchQuery = '';

  function renderList() {
    const list = container.querySelector('#activities-list');
    let filtered = activities;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(a => a.status === currentFilter);
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

    if (filtered.length === 0) {
      list.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">\uD83C\uDF1F</div>
        <p>${activities.length === 0 ? 'Aucune activite pour l\'instant !' : 'Aucun resultat'}</p>
        <p class="text-secondary" style="font-size:13px">${activities.length === 0 ? 'Appuie sur + pour en ajouter une' : 'Essaie d\'autres filtres'}</p>
      </div>`;
      return;
    }

    list.innerHTML = filtered.map(a => {
      const status = getStatusById(a.status);
      const tagsHtml = (a.tags || []).map(t => `<span class="tag-dot" style="background:${getTagColor(t)}" title="${t}"></span>`).join('');
      return `
        <div class="activity-card" data-id="${a.id}">
          ${a.image ? `<div class="activity-card-image"><img src="${a.image}" alt="${a.title}" loading="lazy"></div>` : ''}
          <div class="activity-card-body">
            <h3 class="activity-card-title">${a.title}</h3>
            ${a.date ? `<span class="activity-card-date">${formatDate(new Date(a.date).getTime())}</span>` : ''}
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
              <span class="status-badge ${status.cssClass}">${status.icon} ${status.label}</span>
              <div class="tag-dots">${tagsHtml}</div>
            </div>
            ${a.locationName ? `<span class="activity-card-location">\uD83D\uDCCD ${a.locationName}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

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
