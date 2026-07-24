import { db, genId } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, showToast, CATEGORIES, STATUSES, getCategoryById, getStatusById } from '../components.js';

export async function renderCreateActivity(container, editingId) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader(editingId ? 'Modifier' : 'Nouvelle activite');

  let activity = null;
  if (editingId) {
    activity = await db.getActivity(editingId);
    if (!activity) {
      showToast('Activite introuvable', 'error');
      return;
    }
  }

  container.innerHTML = `
    <div class="page">
      <form id="activity-form">
        <div class="input-group">
          <label class="input-label">Photo</label>
          <div class="image-picker ${activity && activity.image ? 'has-image' : ''}" id="image-picker">
            ${activity && activity.image ? `<img src="${activity.image}" alt="Photo">` : ''}
            <div class="image-picker-content">
              <span class="image-picker-icon">\uD83D\uDCF7</span>
              <span class="image-picker-text">Ajouter une photo</span>
            </div>
            ${activity && activity.image ? '<button type="button" class="image-picker-remove" id="remove-image">\u2715</button>' : ''}
          </div>
          <input type="file" id="image-input" accept="image/*" style="display:none">
          <input type="hidden" id="act-image" value="${activity ? (activity.image || '') : ''}">
        </div>

        <div class="input-group">
          <label class="input-label">Nom de l'activite *</label>
          <input class="input" type="text" id="act-title" placeholder="Ex: Statue equestre Place..." value="${activity ? escapeAttr(activity.title) : ''}" required>
        </div>

        <div class="input-group">
          <label class="input-label">Description</label>
          <textarea class="input" id="act-desc" placeholder="Details, impressions...">${activity ? escapeHtml(activity.description || '') : ''}</textarea>
        </div>

        <div class="input-group">
          <label class="input-label">Categorie</label>
          <select class="input" id="act-category">
            ${CATEGORIES.map(c => `
              <option value="${c.id}" ${activity && activity.category === c.id ? 'selected' : ''}>${c.icon} ${c.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="input-group">
          <label class="input-label">Statut</label>
          <div class="status-selector" id="status-selector">
            ${STATUSES.map(s => `
              <button type="button" class="status-selector-btn ${(activity ? activity.status : 'todo') === s.id ? 'active' : ''}" data-status="${s.id}">
                ${s.icon} ${s.label}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="act-status" value="${activity ? activity.status : 'todo'}">
        </div>

        <div class="input-group">
          <label class="input-label">Date</label>
          <input class="input" type="date" id="act-date" value="${activity ? (activity.date || '') : ''}">
        </div>

        <div class="input-group">
          <label class="input-label">Lieu</label>
          <div style="display:flex;gap:8px;align-items:center">
            <input class="input" type="text" id="act-location-name" placeholder="Nom du lieu" value="${activity ? escapeAttr(activity.locationName || '') : ''}" style="flex:1">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-pick-location">Carte</button>
          </div>
          <input type="hidden" id="act-lat" value="${activity ? (activity.lat || '') : ''}">
          <input type="hidden" id="act-lng" value="${activity ? (activity.lng || '') : ''}">
        </div>

        <div style="display:flex;gap:12px;margin-top:8px">
          <button type="submit" class="btn btn-primary btn-full">
            ${editingId ? 'Enregistrer' : 'Creer'}
          </button>
        </div>

        ${editingId ? `
          <button type="button" class="btn btn-danger btn-full" style="margin-top:12px" id="btn-delete">
            Supprimer
          </button>
        ` : ''}
      </form>
    </div>
  `;

  const imagePicker = container.querySelector('#image-picker');
  const imageInput = container.querySelector('#image-input');
  const imageHidden = container.querySelector('#act-image');

  imagePicker.addEventListener('click', (e) => {
    if (e.target.id === 'remove-image' || e.target.closest('#remove-image')) return;
    imageInput.click();
  });

  imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop lourde (max 5 Mo)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      imageHidden.value = dataUrl;
      imagePicker.classList.add('has-image');
      imagePicker.innerHTML = `
        <img src="${dataUrl}" alt="Photo">
        <button type="button" class="image-picker-remove" id="remove-image">\u2715</button>
      `;
      container.querySelector('#remove-image').addEventListener('click', (e) => {
        e.stopPropagation();
        imageHidden.value = '';
        imagePicker.classList.remove('has-image');
        imagePicker.innerHTML = `
          <span class="image-picker-icon">\uD83D\uDCF7</span>
          <span class="image-picker-text">Ajouter une photo</span>
        `;
      });
    };
    reader.readAsDataURL(file);
  });

  if (imageHidden.value) {
    container.querySelector('#remove-image')?.addEventListener('click', (e) => {
      e.stopPropagation();
      imageHidden.value = '';
      imagePicker.classList.remove('has-image');
      imagePicker.innerHTML = `
        <span class="image-picker-icon">\uD83D\uDCF7</span>
        <span class="image-picker-text">Ajouter une photo</span>
      `;
    });
  }

  container.querySelectorAll('.status-selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.status-selector-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector('#act-status').value = btn.dataset.status;
    });
  });

  container.querySelector('#activity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = container.querySelector('#act-title').value.trim();
    if (!title) return showToast('Titre requis', 'error');

    const now = Date.now();
    const data = {
      id: editingId || genId(),
      profile,
      title,
      description: container.querySelector('#act-desc').value.trim(),
      category: container.querySelector('#act-category').value,
      status: container.querySelector('#act-status').value,
      date: container.querySelector('#act-date').value,
      locationName: container.querySelector('#act-location-name').value.trim() || null,
      lat: parseFloat(container.querySelector('#act-lat').value) || null,
      lng: parseFloat(container.querySelector('#act-lng').value) || null,
      image: container.querySelector('#act-image').value || null,
      createdAt: activity ? activity.createdAt : now,
      updatedAt: now
    };

    await db.addActivity(data);
    showToast(editingId ? 'Modifie !' : 'Cree !', 'success');
    window.dispatchEvent(new CustomEvent('navigate-home'));
  });

  if (editingId) {
    container.querySelector('#btn-delete').addEventListener('click', () => {
      showModal('Supprimer ?', 'Cette action est irreversible.', [
        { id: 'cancel', label: 'Annuler', class: 'btn-secondary' },
        {
          id: 'delete', label: 'Supprimer', class: 'btn-danger',
          onClick: async () => {
            await db.deleteActivity(editingId);
            showToast('Supprimee', 'success');
            window.dispatchEvent(new CustomEvent('navigate-home'));
          }
        }
      ]);
    });
  }

  container.querySelector('#btn-pick-location').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate-picker', {
      detail: {
        lat: parseFloat(container.querySelector('#act-lat').value) || null,
        lng: parseFloat(container.querySelector('#act-lng').value) || null,
        onSelect: (lat, lng, name) => {
          container.querySelector('#act-lat').value = lat;
          container.querySelector('#act-lng').value = lng;
          container.querySelector('#act-location-name').value = name || '';
        }
      }
    }));
  });
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showModal(title, content, actions = []) {
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
}
