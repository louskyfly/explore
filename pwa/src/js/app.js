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
  settings: renderSettings
};

export async function initApp() {
  try { await db.getDB(); } catch(e) { console.error('DB error:', e); }
  try { await theme.init(); } catch(e) { console.error('Theme error:', e); }

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
    try { await navigator.serviceWorker.register('/sw.js'); } catch (e) {}
  }
}
