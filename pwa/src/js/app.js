import { router } from './router.js';
import { theme } from './theme.js';
import { showSidebar, updateSidebarUser, showToast } from './components.js';
import { db } from './db.js';
import { renderHome } from './screens/home.js';
import { renderMap, selectCity } from './screens/map.js';
import { renderRally } from './screens/rally.js';
import { renderTeams } from './screens/teams.js';
import { renderProfile } from './screens/profile.js';
import { renderGallery } from './screens/gallery.js';
import { renderStats } from './screens/stats.js';
import { renderAchievements, checkAchievements } from './screens/achievements.js';
import { renderHistory } from './screens/history.js';
import { renderSettings } from './screens/settings.js';
import { renderDirectory } from './screens/directory.js';

const screenRenderers = {
  home: renderHome,
  map: renderMap,
  rally: renderRally,
  teams: renderTeams,
  profile: renderProfile,
  gallery: renderGallery,
  stats: renderStats,
  achievements: renderAchievements,
  history: renderHistory,
  settings: renderSettings,
  directory: renderDirectory
};

export async function initApp() {
  try { await db.getDB(); } catch(e) { console.error('DB error:', e); }
  try { await theme.init(); } catch(e) { console.error('Theme error:', e); }

  await handleJoinUrl();

  router.init();
  router.onChange(async (tab) => {
    const renderer = screenRenderers[tab];
    if (renderer) {
      const container = document.getElementById('page-container');
      container.innerHTML = '';
      try { await renderer(container); } catch(e) { console.error('Screen error:', e); }
    }
  });

  document.getElementById('btn-menu')?.addEventListener('click', async () => {
    const username = await db.getSetting('username') || 'Invité';
    const teamId = await db.getSetting('currentTeam');
    const team = teamId ? await db.getTeam(teamId) : null;
    updateSidebarUser(username, team?.name || null);
    showSidebar(true);
  });

  document.getElementById('btn-notifications')?.addEventListener('click', () => {
    showToast('Notifications', 'info');
  });

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      showSidebar(false);
      if (screenRenderers[action]) {
        router.navigate(action);
      } else if (action === 'about') {
        showToast('PhotoMap v1.0.0 - Rallye Découverte PWA', 'info', 4000);
      }
    });
  });

  const container = document.getElementById('page-container');
  try { await renderHome(container); } catch(e) { console.error('Home render error:', e); }

  try { checkAchievements(); } catch(e) {}

  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(() => { Notification.requestPermission(); }, 5000);
  }

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      navigator.serviceWorker.addEventListener('message', e => {
        if (e.data?.type === 'SW_UPDATED') {
          showToast(`📦 Mise à jour disponible (v${e.data.version})`, 'info', 5000);
          setTimeout(() => window.location.reload(), 2000);
        }
      });
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    } catch (e) {}
  }
}

async function handleJoinUrl() {
  const params = new URLSearchParams(window.location.search);
  const joinToken = params.get('join');
  if (!joinToken) return;

  let teamData;
  try {
    teamData = JSON.parse(decodeURIComponent(escape(atob(joinToken))));
  } catch(e) {
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  const existingTeams = await db.getAllTeams().catch(() => []);
  let team = existingTeams.find(t => t.name === teamData.n && t.color === teamData.c);

  if (!team) {
    team = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      name: teamData.n,
      code: Math.random().toString(36).substr(2, 6).toUpperCase(),
      color: teamData.c,
      emoji: teamData.e || '👥',
      members: [],
      createdBy: 'invité',
      createdAt: Date.now()
    };
    await db.saveTeam(team);
  }

  const currentTeam = await db.getSetting('currentTeam');
  if (currentTeam === team.id) {
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);';
    overlay.innerHTML = `
      <div style="background:#1c1c2e;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;width:90vw;max-width:360px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">${team.emoji || '👥'}</div>
        <h2 style="font-size:20px;margin-bottom:4px;">${team.name}</h2>
        <p style="font-size:13px;color:#8e8e93;margin-bottom:20px;">Rejoins cette équipe !</p>
        <input type="text" id="join-pseudo" placeholder="Ton pseudo" maxlength="20"
          style="width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.06);color:#fff;font-size:16px;font-family:inherit;outline:none;margin-bottom:16px;text-align:center;">
        <button id="join-confirm" style="width:100%;padding:14px;border-radius:10px;border:none;background:#173B7A;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">
          Rejoindre
        </button>
        <button id="join-cancel" style="width:100%;padding:10px;border-radius:10px;border:none;background:transparent;color:#8e8e93;font-size:13px;cursor:pointer;margin-top:8px;">
          Annuler
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('join-pseudo');
    input.focus();

    const doJoin = async () => {
      const pseudo = input.value.trim();
      if (!pseudo) { input.style.borderColor = '#FF453A'; return; }
      if (!team.members.includes(pseudo)) {
        team.members.push(pseudo);
        await db.saveTeam(team);
      }
      await db.setSetting('currentTeam', team.id);
      await db.setSetting('username', pseudo);
      overlay.remove();
      window.history.replaceState({}, '', window.location.pathname);
      showToast(`Bienvenue dans "${team.name}" !`, 'success', 3000);
      resolve();
    };

    document.getElementById('join-confirm').addEventListener('click', doJoin);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doJoin(); });
    document.getElementById('join-cancel').addEventListener('click', () => {
      overlay.remove();
      window.history.replaceState({}, '', window.location.pathname);
      resolve();
    });
  });
}
