import { router } from './router.js';
import { theme } from './theme.js';
import { showSidebar, updateSidebarUser, updateHeader, showToast } from './components.js';
import { db } from './db.js';
import { renderHome } from './screens/home.js';
import { renderMap } from './screens/map.js';
import { renderStats } from './screens/stats.js';
import { renderSettings } from './screens/settings.js';
import { renderCreateActivity } from './screens/createActivity.js';
import { renderActivityDetail } from './screens/activityDetail.js';
import { renderLocationPicker } from './screens/locationPicker.js';
import { showAuthScreen, hideAuthScreen, getCurrentProfile, setCurrentProfile, logout, PROFILES } from './screens/profileSelect.js';
import { sync } from './sync.js';

const screenRenderers = {
  home: renderHome,
  map: renderMap,
  stats: renderStats,
  settings: renderSettings
};

let screenStack = [];

function pushScreen(renderer, params = {}) {
  screenStack.push({ renderer, params });
}

function popScreen() {
  if (screenStack.length) {
    const prev = screenStack.pop();
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    prev.renderer(container, prev.params);
    return true;
  }
  return false;
}

export async function initApp() {
  try { await db.getDB(); } catch(e) { console.error('DB error:', e); }
  try { await theme.init(); } catch(e) { console.error('Theme error', e); }

  router.init();

  router.onChange(async (tab) => {
    screenStack = [];
    const renderer = screenRenderers[tab];
    if (renderer) {
      const container = document.getElementById('page-container');
      container.innerHTML = '';
      try { await renderer(container); } catch(e) { console.error('Screen error:', e); }
    }
  });

  document.getElementById('btn-menu')?.addEventListener('click', async () => {
    const profile = getCurrentProfile();
    const profileName = profile ? PROFILES[profile].name : 'Invite';
    updateSidebarUser(profileName, profile ? `Profil: ${profileName}` : null);
    showSidebar(true);
  });

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      showSidebar(false);
      if (action === 'logout') {
        logout();
      } else if (screenRenderers[action]) {
        router.navigate(action);
      }
    });
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
  });

  window.addEventListener('profile-login', async (e) => {
    const profileId = e.detail.profileId;
    setCurrentProfile(profileId);

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('tabbar').classList.remove('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');

    const badge = document.getElementById('profile-badge');
    badge.classList.remove('hidden');
    badge.style.background = PROFILES[profileId].color;
    document.getElementById('profile-badge-name').textContent = PROFILES[profileId].name;

    screenStack = [];
    router.currentTab = 'home';
    router.updateTabBar();
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    try { await renderHome(container); } catch(e) { console.error(e); }

    const token = await sync.getToken();
    if (token) {
      try { await sync.pull(); } catch(e) {}
    }
  });

  window.addEventListener('profile-logout', () => {
    setCurrentProfile(null);
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('tabbar').classList.add('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
    document.getElementById('profile-badge').classList.add('hidden');
    showAuthScreen();
  });

  window.addEventListener('navigate-home', () => {
    screenStack = [];
    router.navigate('home');
  });

  window.addEventListener('navigate-create', async () => {
    const currentRenderer = screenRenderers[router.currentTab];
    if (currentRenderer) pushScreen(currentRenderer);
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    try { await renderCreateActivity(container); } catch(e) { console.error(e); }
  });

  window.addEventListener('navigate-edit', async (e) => {
    const currentRenderer = screenRenderers[router.currentTab];
    if (currentRenderer) pushScreen(currentRenderer);
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    try { await renderCreateActivity(container, e.detail.id); } catch(e) { console.error(e); }
  });

  window.addEventListener('navigate-detail', async (e) => {
    const currentRenderer = screenRenderers[router.currentTab];
    if (currentRenderer) pushScreen(currentRenderer);
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    try { await renderActivityDetail(container, e.detail.id); } catch(e) { console.error(e); }
  });

  window.addEventListener('navigate-picker', async (e) => {
    const params = e.detail;
    pushScreen(renderCreateActivity, params.editingId || null);
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    try { await renderLocationPicker(container, params); } catch(e) { console.error(e); }
  });

  window.addEventListener('navigate-back', () => {
    if (!popScreen()) {
      router.goBack();
    }
  });

  window.addEventListener('navigate-map', () => {
    router.navigate('map');
  });

  const savedProfile = await db.getSetting('current_profile');

  if (savedProfile) {
    setCurrentProfile(savedProfile);
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('tabbar').classList.remove('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');

    const badge = document.getElementById('profile-badge');
    badge.classList.remove('hidden');
    badge.style.background = PROFILES[savedProfile].color;
    document.getElementById('profile-badge-name').textContent = PROFILES[savedProfile].name;

    const container = document.getElementById('page-container');
    try { await renderHome(container); } catch(e) { console.error(e); }

    const token = await sync.getToken();
    if (token) {
      try { await sync.pull(); } catch(e) {}
    }
  } else {
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('tabbar').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    showAuthScreen();
  }

  if ('serviceWorker' in navigator) {
    try { await navigator.serviceWorker.register('./sw.js'); } catch (e) {}
  }
}
