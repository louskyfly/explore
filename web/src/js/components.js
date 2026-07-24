export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const icons = { success: '\u2713', error: '\u2715', info: '\u2139' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showModal(title, content, actions = []) {
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
      <div class="modal-body">${content}</div>
      ${actions.length ? `<div style="padding:0 20px 24px;display:flex;gap:8px;">${actions.map(a =>
        `<button class="btn ${a.class || 'btn-primary'}" style="flex:1" data-action="${a.id}">${a.label}</button>`
      ).join('')}</div>` : ''}
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
  actions.forEach(a => {
    const btn = modal.querySelector(`[data-action="${a.id}"]`);
    if (btn && a.onClick) btn.addEventListener('click', () => { a.onClick(modal); close(); });
  });

  return { modal, close };
}

export function showSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  if (show) {
    sidebar.classList.remove('hidden');
    document.getElementById('sidebar-backdrop').onclick = () => showSidebar(false);
    document.getElementById('btn-close-sidebar').onclick = () => showSidebar(false);
  } else {
    sidebar.classList.add('hidden');
  }
}

export function updateHeader(title) {
  document.getElementById('page-title').textContent = title;
}

export function updateSidebarUser(name, profileLabel) {
  document.getElementById('sidebar-username').textContent = name || 'Invite';
  document.getElementById('sidebar-profile-name').textContent = profileLabel || 'Aucun profil';
  document.getElementById('sidebar-avatar').textContent = (name || '?')[0].toUpperCase();
}

export function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "a l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export const CATEGORIES = [
  { id: 'monument', label: 'Monument', icon: '\uD83C\uDFDB', cssClass: 'cat-monument' },
  { id: 'nature', label: 'Nature', icon: '\uD83C\uDF33', cssClass: 'cat-nature' },
  { id: 'restaurant', label: 'Restaurant', icon: '\uD83C\uDF5D', cssClass: 'cat-restaurant' },
  { id: 'museum', label: 'Musee', icon: '\uD83C\uDFAD', cssClass: 'cat-museum' },
  { id: 'activity', label: 'Activite', icon: '\u26A1', cssClass: 'cat-activity' },
  { id: 'shopping', label: 'Shopping', icon: '\uD83D\uDECD', cssClass: 'cat-shopping' },
  { id: 'event', label: 'Evenement', icon: '\uD83C\uDFA8', cssClass: 'cat-event' },
  { id: 'other', label: 'Autre', icon: '\u2726', cssClass: 'cat-other' }
];

export const STATUSES = [
  { id: 'todo', label: 'A faire', icon: '\uD83D\uDCCB', color: '#64D2FF', cssClass: 'status-todo' },
  { id: 'reserved', label: 'Reserve', icon: '\uD83D\uDCC5', color: '#FF9F0A', cssClass: 'status-reserved' },
  { id: 'in_progress', label: 'En cours', icon: '\u23F3', color: '#BF5AF2', cssClass: 'status-in-progress' },
  { id: 'done', label: 'Fait', icon: '\u2705', color: '#30D158', cssClass: 'status-done' },
  { id: 'cancelled', label: 'Annule', icon: '\u274C', color: '#FF453A', cssClass: 'status-cancelled' }
];

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[7];
}

export function getStatusById(id) {
  return STATUSES.find(s => s.id === id) || STATUSES[0];
}
