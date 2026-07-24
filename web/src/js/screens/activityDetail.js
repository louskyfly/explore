import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, showToast, getCategoryById, getStatusById, STATUSES, formatDate } from '../components.js';

export async function renderActivityDetail(container, activityId) {
  const profile = getCurrentProfile();
  if (!profile) return;

  const activity = await db.getActivity(activityId);
  if (!activity) {
    showToast('Activite introuvable', 'error');
    window.dispatchEvent(new CustomEvent('navigate-home'));
    return;
  }

  updateHeader('Detail');

  const cat = getCategoryById(activity.category);
  const status = getStatusById(activity.status);

  container.innerHTML = `
    <div class="page" style="padding:0;padding-bottom:24px;">
      ${activity.image ? `<img class="detail-image" src="${activity.image}" alt="">` : ''}
      <div style="padding:16px;">
        <div class="glass-card animate-in" style="padding:20px;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
            ${!activity.image ? `<div class="activity-icon ${cat.cssClass}" style="width:52px;height:52px;font-size:26px;border-radius:14px;">${cat.icon}</div>` : ''}
            <div style="flex:1">
              <h2 style="font-size:20px;font-weight:700;">${escapeHtml(activity.title)}</h2>
              <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
                <span class="status-pill ${status.cssClass}">${status.icon} ${status.label}</span>
                <span class="activity-category ${cat.cssClass}">${cat.label}</span>
              </div>
            </div>
          </div>

          ${activity.description ? `
            <p style="font-size:14px;color:var(--text-secondary);line-height:1.5;margin:16px 0;">${escapeHtml(activity.description)}</p>
          ` : ''}

          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            ${activity.date ? `
              <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-secondary);">
                \uD83D\uDCC5 <span>${formatDate(activity.date)}</span>
              </div>
            ` : ''}
            ${activity.locationName ? `
              <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-secondary);">
                \uD83D\uDCCD <span>${escapeHtml(activity.locationName)}</span>
              </div>
            ` : ''}
            <div style="display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-secondary);">
              \u23F0 <span>Creee ${formatDate(activity.createdAt)}</span>
            </div>
          </div>
        </div>

        <div class="glass-card animate-in stagger-1" style="padding:16px;margin-bottom:16px;">
          <h3 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.3px;">Statut</h3>
          <div class="status-selector" id="status-selector">
            ${STATUSES.map(s => `
              <button type="button" class="status-selector-btn ${activity.status === s.id ? 'active' : ''}" data-status="${s.id}">
                ${s.icon} ${s.label}
              </button>
            `).join('')}
          </div>
        </div>

        ${activity.lat && activity.lng ? `
          <div class="glass-card animate-in stagger-2" style="padding:0;margin-bottom:16px;overflow:hidden;">
            <div id="detail-map" style="height:200px;"></div>
          </div>
        ` : ''}

        <div style="display:flex;gap:10px;" class="animate-in stagger-3">
          <button class="btn btn-secondary" style="flex:1" id="btn-edit">
            Modifier
          </button>
          <button class="btn btn-danger" id="btn-delete" style="padding:12px 16px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  if (activity.lat && activity.lng) {
    setTimeout(() => {
      try {
        const map = L.map('detail-map', { zoomControl: false, attributionControl: false }).setView([activity.lat, activity.lng], 15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        L.marker([activity.lat, activity.lng]).addTo(map);
        setTimeout(() => map.invalidateSize(), 100);
      } catch (e) {}
    }, 100);
  }

  container.querySelectorAll('.status-selector-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const newStatus = btn.dataset.status;
      if (newStatus === activity.status) return;
      activity.status = newStatus;
      activity.updatedAt = Date.now();
      await db.addActivity(activity);
      showToast(`Statut: ${getStatusById(newStatus).label}`, 'success');
      renderActivityDetail(container, activityId);
    });
  });

  container.querySelector('#btn-edit').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate-edit', { detail: { id: activityId } }));
  });

  container.querySelector('#btn-delete').addEventListener('click', () => {
    showConfirmModal('Supprimer ?', 'Cette action est irreversible.', async () => {
      await db.deleteActivity(activityId);
      showToast('Supprimee', 'success');
      window.dispatchEvent(new CustomEvent('navigate-home'));
    });
  });
}

function showConfirmModal(title, message, onConfirm) {
  const container = document.getElementById('modal-container');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="icon-btn modal-close" aria-label="Fermer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body"><p style="color:var(--text-secondary);font-size:14px;">${message}</p></div>
      <div style="padding:0 20px 24px;display:flex;gap:8px;">
        <button class="btn btn-secondary" style="flex:1" data-action="cancel">Annuler</button>
        <button class="btn btn-danger" style="flex:1" data-action="confirm">Supprimer</button>
      </div>
    </div>
  `;
  container.appendChild(modal);
  const close = () => {
    modal.querySelector('.modal-backdrop').style.opacity = '0';
    modal.querySelector('.modal-sheet').style.transform = 'translateY(100%)';
    setTimeout(() => modal.remove(), 300);
  };
  modal.querySelector('.modal-backdrop').addEventListener('click', close);
  modal.querySelector('.modal-close').addEventListener('click', close);
  modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
  modal.querySelector('[data-action="confirm"]').addEventListener('click', () => { close(); onConfirm(); });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
