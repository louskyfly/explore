import { db } from '../db.js';
import { updateHeader, showToast, showModal } from '../components.js';

export async function renderSettings(container) {
  updateHeader('Paramètres');
  const currentTheme = await db.getSetting('theme') || 'dark';
  const username = await db.getSetting('username') || '';
  const teamId = await db.getSetting('currentTeam');
  const team = teamId ? await db.getTeam(teamId) : null;

  container.innerHTML = `
    <div class="page">
      <div style="text-align:center;margin-bottom:24px" class="animate-in">
        <div style="font-size:48px;margin-bottom:8px">⚙️</div>
        <h2 style="font-size:22px;font-weight:700">Paramètres</h2>
      </div>

      <div class="section-title animate-in stagger-1">Apparence</div>
      <div class="glass-card animate-in stagger-2" style="padding:16px;margin-bottom:16px">
        <label class="input-label">Thème</label>
        <div style="display:flex;gap:8px">
          <button class="btn btn-sm setting-theme-btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" data-theme="dark" style="flex:1">🌙 Sombre</button>
          <button class="btn btn-sm setting-theme-btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" data-theme="light" style="flex:1">☀️ Clair</button>
          <button class="btn btn-sm setting-theme-btn ${currentTheme === 'auto' ? 'btn-primary' : 'btn-secondary'}" data-theme="auto" style="flex:1">🔄 Auto</button>
        </div>
      </div>

      <div class="section-title animate-in stagger-3">Profil</div>
      <div class="glass-card animate-in stagger-4" style="padding:16px;margin-bottom:16px">
        <div class="input-group" style="margin-bottom:12px">
          <label class="input-label">Pseudo</label>
          <input class="input" id="settings-username" value="${username}" placeholder="Votre pseudo">
        </div>
        ${team ? `
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--input-bg);border-radius:12px">
            <div class="team-avatar" style="background:${team.color};width:40px;height:40px;font-size:18px;margin:0">${team.emoji}</div>
            <div style="flex:1">
              <div style="font-weight:600">${team.name}</div>
              <div style="font-size:12px;color:var(--text-secondary)">Code: ${team.code}</div>
            </div>
            <button class="btn btn-sm btn-danger" id="btn-leave-team">Quitter</button>
          </div>
        ` : `
          <div style="text-align:center;color:var(--text-secondary);font-size:14px;padding:12px 0">
            Aucune équipe
          </div>
        `}
      </div>

      <div class="section-title animate-in stagger-5">Données</div>
      <div class="glass-card animate-in stagger-6" style="padding:16px;margin-bottom:16px">
        <button class="btn btn-secondary btn-full" id="btn-export" style="margin-bottom:8px">📤 Exporter les données (JSON)</button>
        <button class="btn btn-secondary btn-full" id="btn-import" style="margin-bottom:8px">📥 Importer des données</button>
        <button class="btn btn-danger btn-full" id="btn-reset">🗑️ Tout réinitialiser</button>
        <input type="file" id="import-file" accept=".json" style="display:none">
      </div>

      <div class="section-title animate-in">Notifications</div>
      <div class="glass-card animate-in" style="padding:16px;margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:600">Notifications push</div>
            <div style="font-size:13px;color:var(--text-secondary)">Alertes pour les succès et défis</div>
          </div>
          <button class="btn btn-sm ${Notification?.permission === 'granted' ? 'btn-primary' : 'btn-secondary'}" id="btn-notif-perm">
            ${Notification?.permission === 'granted' ? 'Activées' : 'Activer'}
          </button>
        </div>
      </div>

      <div style="text-align:center;padding:20px 0;color:var(--text-tertiary);font-size:13px" class="animate-in">
        <div>🧭 PhotoMap v1.0.0</div>
        <div style="margin-top:4px">Rallye Découverte PWA</div>
      </div>
    </div>
  `;

  document.querySelectorAll('.setting-theme-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.theme;
      await db.setSetting('theme', mode);
      const resolved = mode === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
      document.documentElement.setAttribute('data-theme', resolved);
      document.querySelectorAll('.setting-theme-btn').forEach(b => {
        b.className = `btn btn-sm setting-theme-btn ${b.dataset.theme === mode ? 'btn-primary' : 'btn-secondary'}`;
      });
      showToast(`Thème ${mode === 'dark' ? 'sombre' : mode === 'light' ? 'clair' : 'automatique'}`, 'success');
    });
  });

  document.getElementById('settings-username')?.addEventListener('change', async (e) => {
    const name = e.target.value.trim();
    if (name) await db.setSetting('username', name);
  });

  document.getElementById('btn-leave-team')?.addEventListener('click', async () => {
    await db.setSetting('currentTeam', null);
    showToast('Vous avez quitté l\'équipe', 'info');
    renderSettings(container);
  });

  document.getElementById('btn-export')?.addEventListener('click', async () => {
    const data = {
      photos: await db.getAllPhotos(),
      progress: await db.getAllProgress(),
      teams: await db.getAllTeams(),
      challenges: await db.getAllChallenges(),
      history: await db.getHistory(),
      achievements: await db.getAllAchievements(),
      settings: await db.getSettings(),
      exportDate: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `explore-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Données exportées', 'success');
  });

  document.getElementById('btn-import')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });

  document.getElementById('import-file')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.photos) for (const p of data.photos) await db.addPhoto(p);
      if (data.progress) for (const p of data.progress) await db.saveProgress(p);
      if (data.teams) for (const t of data.teams) await db.saveTeam(t);
      if (data.challenges) for (const c of data.challenges) await db.saveChallenge(c);
      if (data.history) for (const h of data.history) await db.addHistory(h);
      if (data.achievements) for (const a of data.achievements) await db.saveAchievement(a);
      showToast('Données importées avec succès', 'success');
    } catch (err) {
      showToast('Erreur lors de l\'import', 'error');
    }
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    showModal('Réinitialiser', '<p style="text-align:center;color:var(--text-secondary)">Supprimer toutes les données ? Cette action est irréversible.</p>', [
      { id: 'cancel', label: 'Annuler', class: 'btn-secondary' },
      { id: 'confirm', label: 'Tout supprimer', class: 'btn-danger', onClick: () => {
        indexedDB.deleteDatabase('explore_pwa');
        location.reload();
      }}
    ]);
  });

  document.getElementById('btn-notif-perm')?.addEventListener('click', async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      showToast(perm === 'granted' ? 'Notifications activées' : 'Notifications refusées', perm === 'granted' ? 'success' : 'info');
      renderSettings(container);
    }
  });
}
