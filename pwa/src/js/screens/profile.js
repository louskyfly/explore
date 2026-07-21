import { db } from '../db.js';
import { updateHeader, showModal, showToast, formatDate, timeAgo } from '../components.js';

export async function renderProfile(container) {
  updateHeader('Profil');
  const username = await db.getSetting('username') || '';
  const teamId = await db.getSetting('currentTeam');
  const team = teamId ? await db.getTeam(teamId) : null;
  const allProgress = await db.getAllProgress();
  const allPhotos = await db.getAllPhotos();
  const allChallenges = await db.getAllChallenges();
  const allAchievements = await db.getAllAchievements();
  const sortedPhotos = allPhotos.sort((a, b) => b.timestamp - a.timestamp);

  const totalPoints = allProgress.reduce((s, p) => s + (p.points || 0), 0) + allChallenges.filter(c => c.completed).reduce((s, c) => s + (c.earnedPoints || 0), 0);
  const completedSteps = allProgress.filter(p => p.completed).length;

  container.innerHTML = `
    <div class="page">
      <div class="profile-header animate-in">
        <div class="avatar-large" style="width:72px;height:72px;font-size:28px;margin:0 auto 10px">${username ? username[0].toUpperCase() : '?'}</div>
        <h2 style="font-size:20px;font-weight:700">${username || 'Invité'}</h2>
        ${team ? `<p style="font-size:13px;color:var(--text-secondary);margin-top:3px">${team.emoji || '👥'} ${team.name}</p>` : ''}
      </div>

      <div class="stats-grid animate-in stagger-1">
        <div class="stat-card glass-card"><div class="stat-value">${totalPoints}</div><div class="stat-label">Points</div></div>
        <div class="stat-card glass-card"><div class="stat-value">${allPhotos.length}</div><div class="stat-label">Photos</div></div>
        <div class="stat-card glass-card"><div class="stat-value">${completedSteps}</div><div class="stat-label">Étapes</div></div>
        <div class="stat-card glass-card"><div class="stat-value">${allChallenges.filter(c => c.completed).length}</div><div class="stat-label">Défis</div></div>
      </div>

      <div class="section-title animate-in stagger-2">🖼️ Ma Galerie</div>
      ${sortedPhotos.length ? `
        <div class="gallery-grid animate-in stagger-3">
          ${sortedPhotos.map(photo => `
            <div class="gallery-item" data-photo-id="${photo.id}">
              <img src="${photo.data}" alt="${photo.poiName || 'Photo'}" loading="lazy">
              <div class="gallery-item-overlay">
                <span>${photo.poiName || 'Photo'}</span>
                ${photo.score !== undefined ? ` · ${photo.score}%` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="glass-card animate-in stagger-3" style="padding:24px;text-align:center">
          <div style="font-size:36px;margin-bottom:8px">📷</div>
          <p style="color:var(--text-secondary);font-size:14px">Aucune photo pour l'instant</p>
          <p style="color:var(--text-tertiary);font-size:12px;margin-top:4px">Prenez des photos via la carte ou les défis</p>
        </div>
      `}

      <div class="section-title animate-in stagger-4" style="margin-top:20px">⚙️ Paramètres</div>
      <div class="glass-card animate-in stagger-5" style="padding:14px">
        <div class="input-group" style="margin-bottom:10px">
          <label class="input-label">Pseudo</label>
          <div style="display:flex;gap:8px">
            <input class="input" id="profile-username" value="${username}" placeholder="Votre pseudo" style="flex:1">
            <button class="btn btn-primary btn-sm" id="btn-save-username">✓</button>
          </div>
        </div>
        <div class="input-group" style="margin-bottom:0">
          <label class="input-label">Thème</label>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm btn-theme glass-theme-btn" data-theme="dark" style="flex:1">🌙 Sombre</button>
            <button class="btn btn-sm btn-theme glass-theme-btn" data-theme="light" style="flex:1">☀️ Clair</button>
            <button class="btn btn-sm btn-theme glass-theme-btn" data-theme="auto" style="flex:1">🔄 Auto</button>
          </div>
        </div>
      </div>

      ${allAchievements.length ? `
        <div class="section-title animate-in stagger-6" style="margin-top:20px">🏆 Succès récents</div>
        ${allAchievements.slice(-3).reverse().map(a => `
          <div class="achievement-card glass-card animate-in">
            <div class="achievement-icon" style="background:rgba(48,209,88,0.15)">${a.icon || '🏅'}</div>
            <div class="achievement-info"><h4>${a.name}</h4><p>${a.description}</p></div>
          </div>
        `).join('')}
      ` : ''}
    </div>
  `;

  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', async () => {
      const photoId = item.dataset.photoId;
      const photo = await db.getPhoto(photoId);
      if (photo) showPhotoDetail(photo);
    });
  });

  document.getElementById('btn-save-username')?.addEventListener('click', async () => {
    const name = document.getElementById('profile-username')?.value?.trim();
    if (name) {
      await db.setSetting('username', name);
      showToast('Pseudo mis à jour', 'success');
    }
  });

  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.theme;
      await db.setSetting('theme', mode);
      const resolved = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
      document.documentElement.setAttribute('data-theme', resolved);
      showToast(`Thème ${mode === 'dark' ? 'sombre' : mode === 'light' ? 'clair' : 'auto'}`, 'success');
    });
  });
}

function showPhotoDetail(photo) {
  const content = `
    <div style="margin: -20px -20px 16px">
      <img src="${photo.data}" style="width:100%;display:block" alt="${photo.poiName || 'Photo'}">
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <div style="font-size:16px;font-weight:700">${photo.poiName || 'Photo'}</div>
      <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">${formatDate(photo.timestamp)} · ${timeAgo(photo.timestamp)}</div>
    </div>
    <div style="display:flex;gap:12px;justify-content:center;margin-bottom:16px">
      ${photo.score !== undefined ? `<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--accent)">${photo.score}%</div><div style="font-size:10px;color:var(--text-secondary)">Score</div></div>` : ''}
      ${photo.points !== undefined ? `<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--accent)">+${photo.points}</div><div style="font-size:10px;color:var(--text-secondary)">Points</div></div>` : ''}
      ${photo.lat ? `<div style="text-align:center"><div style="font-size:12px;font-weight:600">📍</div><div style="font-size:10px;color:var(--text-secondary)">${photo.lat.toFixed(4)}, ${photo.lng.toFixed(4)}</div></div>` : ''}
    </div>
  `;
  showModal(photo.poiName || 'Photo', content, [
    { id: 'delete', label: '🗑️ Supprimer', class: 'btn-danger' },
    { id: 'close', label: 'Fermer', class: 'btn-secondary' }
  ]);
  document.querySelector('[data-action="delete"]')?.addEventListener('click', async () => {
    await db.deletePhoto(photo.id);
    showToast('Photo supprimée', 'info');
    renderProfile(document.getElementById('page-container'));
  });
}
