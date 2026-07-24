import { db, genId } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, showToast, STATUSES, getStatusById, getTagColor } from '../components.js';

let _pendingPickerData = null;

export function setPendingPickerData(data) { _pendingPickerData = data; }
export function getPendingPickerData() { const d = _pendingPickerData; _pendingPickerData = null; return d; }

export async function renderCreateActivity(container, editingId) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader(editingId ? 'Modifier' : 'Nouvelle activite');

  let activity = null;
  if (editingId) {
    try { activity = await db.getActivity(editingId); } catch(e) {}
    if (!activity) {
      container.innerHTML = '<div class="page"><div class="empty-state"><div class="empty-state-icon">\u274C</div><p>Activite introuvable</p></div></div>';
      return;
    }
  }

  let allTags = [];
  try { allTags = await db.getSetting('all_tags') || []; } catch(e) {}

  let imageData = activity ? (activity.image || '') : '';
  let tags = activity ? (activity.tags || []) : [];
  let locationName = activity ? (activity.locationName || '') : '';
  let lat = activity ? (activity.lat || null) : null;
  let lng = activity ? (activity.lng || null) : null;

  const pickerData = getPendingPickerData();
  if (pickerData) {
    lat = pickerData.lat;
    lng = pickerData.lng;
    locationName = pickerData.name || '';
  }

  container.innerHTML = `
    <div class="page">
      <form id="activity-form">
        <div class="input-group">
          <label class="input-label">Photo</label>
          <div class="image-picker ${imageData ? 'has-image' : ''}" id="image-picker">
            ${imageData ? `<img src="${imageData}" alt="Photo">` : ''}
            <div class="image-picker-content">
              <span class="image-picker-icon">\uD83D\uDCF7</span>
              <span class="image-picker-text">Ajouter une photo</span>
            </div>
            ${imageData ? '<button type="button" class="image-picker-remove" id="remove-image">\u2715</button>' : ''}
          </div>
          <input type="file" id="image-input" accept="image/*" capture="environment" style="display:none">
        </div>

        <div class="input-group">
          <label class="input-label">Nom *</label>
          <input class="input" type="text" id="act-title" placeholder="Ex: Statue equestre..." value="${activity ? escapeAttr(activity.title) : ''}" required>
        </div>

        <div class="input-group">
          <label class="input-label">Description</label>
          <textarea class="input" id="act-desc" placeholder="Details, impressions...">${activity ? escapeHtml(activity.description || '') : ''}</textarea>
        </div>

        <div class="input-group">
          <label class="input-label">Tags</label>
          <div class="tags-input-container" id="tags-container">
            <div class="tags-list" id="tags-list"></div>
            <div style="position:relative">
              <input class="input" type="text" id="tag-input" placeholder="Ajouter un tag..." autocomplete="off">
              <div id="tag-suggestions" class="tag-suggestions hidden"></div>
            </div>
          </div>
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
        </div>

        <div class="input-group">
          <label class="input-label">Date</label>
          <input class="input" type="date" id="act-date" value="${activity ? (activity.date || '') : ''}">
        </div>

        <div class="input-group">
          <label class="input-label">Lieu</label>
          <div class="location-picker-btn" id="btn-pick-location">
            <div class="location-picker-icon">\uD83D\uDCCD</div>
            <div class="location-picker-text">
              <span id="act-location-display">${locationName ? escapeHtml(locationName) : 'Choisir sur la carte'}</span>
              <span class="location-picker-sub">${locationName ? 'Appuie pour modifier' : 'Chercher une adresse reelle'}</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;margin-top:8px;padding-bottom:20px;">
          <button type="submit" class="btn btn-primary btn-full">
            ${editingId ? 'Enregistrer' : 'Creer'}
          </button>
        </div>

        ${editingId ? `
          <button type="button" class="btn btn-danger btn-full" style="margin-top:4px;margin-bottom:20px" id="btn-delete">
            Supprimer
          </button>
        ` : ''}
      </form>
    </div>
  `;

  const tagsList = container.querySelector('#tags-list');
  const tagInput = container.querySelector('#tag-input');
  const tagSuggestions = container.querySelector('#tag-suggestions');

  function renderTags() {
    tagsList.innerHTML = tags.map(t => `
      <span class="tag-pill" style="background:${getTagColor(t)}22;color:${getTagColor(t)};border:1px solid ${getTagColor(t)}44;">
        ${escapeHtml(t)}
        <button type="button" class="tag-remove" data-tag="${escapeAttr(t)}">\u2715</button>
      </span>
    `).join('');

    tagsList.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        tags = tags.filter(t => t !== btn.dataset.tag);
        renderTags();
      });
    });
  }

  renderTags();

  tagInput.addEventListener('input', () => {
    const q = tagInput.value.trim().toLowerCase();
    if (q.length < 1) {
      tagSuggestions.classList.add('hidden');
      return;
    }
    const matches = allTags.filter(t => t.toLowerCase().includes(q) && !tags.includes(t));

    let html = '';
    if (matches.length > 0) {
      html = matches.map(t => `
        <div class="tag-suggestion-item" data-tag="${escapeAttr(t)}">
          <span class="tag-dot" style="background:${getTagColor(t)}"></span>
          ${escapeHtml(t)}
        </div>
      `).join('');
    }
    if (tagInput.value.trim() && !allTags.some(t => t.toLowerCase() === q)) {
      html += `<div class="tag-suggestion-item" data-create="${escapeAttr(tagInput.value.trim())}">
        <span class="tag-dot" style="background:var(--accent)"></span>
        + Creer "${escapeHtml(tagInput.value.trim())}"
      </div>`;
    }
    if (!html) {
      tagSuggestions.classList.add('hidden');
      return;
    }
    tagSuggestions.innerHTML = html;
    tagSuggestions.classList.remove('hidden');

    tagSuggestions.querySelectorAll('.tag-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const newTag = (item.dataset.create || item.dataset.tag || '').trim();
        if (newTag && !tags.includes(newTag)) {
          tags.push(newTag);
          renderTags();
          if (!allTags.includes(newTag)) {
            allTags.push(newTag);
            db.setSetting('all_tags', allTags);
          }
        }
        tagInput.value = '';
        tagSuggestions.classList.add('hidden');
      });
    });
  });

  tagInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = tagInput.value.trim();
      if (val && !tags.includes(val)) {
        tags.push(val);
        renderTags();
        if (!allTags.includes(val)) {
          allTags.push(val);
          db.setSetting('all_tags', allTags);
        }
      }
      tagInput.value = '';
      tagSuggestions.classList.add('hidden');
    }
  });

  tagInput.addEventListener('blur', () => {
    setTimeout(() => tagSuggestions.classList.add('hidden'), 200);
  });

  const imagePicker = container.querySelector('#image-picker');
  const imageInput = container.querySelector('#image-input');

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
      imageData = reader.result;
      imagePicker.classList.add('has-image');
      imagePicker.innerHTML = `
        <img src="${imageData}" alt="Photo">
        <button type="button" class="image-picker-remove" id="remove-image">\u2715</button>
      `;
      container.querySelector('#remove-image').addEventListener('click', (e) => {
        e.stopPropagation();
        imageData = '';
        imagePicker.classList.remove('has-image');
        imagePicker.innerHTML = `
          <span class="image-picker-icon">\uD83D\uDCF7</span>
          <span class="image-picker-text">Ajouter une photo</span>
        `;
      });
    };
    reader.readAsDataURL(file);
  });

  if (imageData) {
    container.querySelector('#remove-image')?.addEventListener('click', (e) => {
      e.stopPropagation();
      imageData = '';
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
    });
  });

  container.querySelector('#activity-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = container.querySelector('#act-title').value.trim();
    if (!title) return showToast('Titre requis', 'error');

    const activeBtn = container.querySelector('.status-selector-btn.active');
    const status = activeBtn ? activeBtn.dataset.status : 'todo';
    const now = Date.now();

    const data = {
      id: editingId || genId(),
      profile,
      title,
      description: container.querySelector('#act-desc').value.trim(),
      tags,
      status,
      date: container.querySelector('#act-date').value,
      locationName: locationName || null,
      lat,
      lng,
      image: imageData || null,
      createdAt: activity ? activity.createdAt : now,
      updatedAt: now
    };

    await db.addActivity(data);
    showToast(editingId ? 'Modifie !' : 'Cree !', 'success');
    window.dispatchEvent(new CustomEvent('navigate-home'));
  });

  if (editingId) {
    container.querySelector('#btn-delete').addEventListener('click', () => {
      showConfirmModal('Supprimer ?', 'Cette action est irreversible.', async () => {
        await db.deleteActivity(editingId);
        showToast('Supprimee', 'success');
        window.dispatchEvent(new CustomEvent('navigate-home'));
      });
    });
  }

  container.querySelector('#btn-pick-location').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('navigate-picker', {
      detail: {
        editingId: editingId || null,
        lat,
        lng,
        tagsSnapshot: [...tags],
        imageDataSnapshot: imageData
      }
    }));
  });
}

export function getPickerParamsFromCreate(container) {
  return {};
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

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
