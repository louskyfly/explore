import { bilbao } from '../data/bilbao.js';
import { zaragoza } from '../data/zaragoza.js';
import { db } from '../db.js';
import { updateHeader } from '../components.js';

const cities = [bilbao, zaragoza];

export async function renderHome(container) {
  updateHeader('PhotoMap');
  const allProgress = await db.getAllProgress();
  const allPhotos = await db.getAllPhotos();
  const teams = await db.getAllTeams();

  const totalSteps = cities.reduce((sum, c) => sum + c.routes.reduce((s, r) => s + r.steps.length, 0), 0);
  const completedSteps = allProgress.filter(p => p.completed).length;
  const completionPercent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;

  container.innerHTML = `
    <div class="page">
      <div class="home-hero animate-in">
        <h2>Bienvenue ! 🧭</h2>
        <p>Explorez les plus belles villes d'Espagne</p>
        <div class="hero-stats">
          <div class="hero-stat">
            <div class="hero-stat-value">${cities.length}</div>
            <div class="hero-stat-label">Villes</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">${cities.reduce((s, c) => s + c.routes.length, 0)}</div>
            <div class="hero-stat-label">Parcours</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">${allPhotos.length}</div>
            <div class="hero-stat-label">Photos</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value">${completionPercent}%</div>
            <div class="hero-stat-label">Progression</div>
          </div>
        </div>
      </div>

      <div class="section-title animate-in stagger-1">Actions rapides</div>
      <div class="quick-actions animate-in stagger-2">
        <button class="quick-action" data-action="map">
          <div class="quick-action-icon" style="background:rgba(23,59,122,0.15)">🗺️</div>
          <span class="quick-action-label">Carte</span>
        </button>
        <button class="quick-action" data-action="rally">
          <div class="quick-action-icon" style="background:rgba(236,64,122,0.15)">📸</div>
          <span class="quick-action-label">Rallye</span>
        </button>
        <button class="quick-action" data-action="teams">
          <div class="quick-action-icon" style="background:rgba(100,210,255,0.15)">👥</div>
          <span class="quick-action-label">Teams</span>
        </button>
        <button class="quick-action" data-action="gallery">
          <div class="quick-action-icon" style="background:rgba(48,209,88,0.15)">🖼️</div>
          <span class="quick-action-label">Galerie</span>
        </button>
      </div>

      <div class="section-title animate-in stagger-3">Villes</div>
      ${cities.map((city, i) => {
        const cityProgress = allProgress.filter(p => p.city === city.id);
        const completed = cityProgress.filter(p => p.completed).length;
        const total = city.routes.reduce((s, r) => s + r.steps.length, 0);
        const pct = total ? Math.round((completed / total) * 100) : 0;
        return `
          <div class="city-card glass-card animate-in stagger-${i + 4}" data-city="${city.id}">
            <div class="city-card-bg" style="background:${city.gradient}"></div>
            <div class="city-card-overlay"></div>
            <div class="city-card-content">
              <div class="city-card-name">${city.flag} ${city.name}</div>
              <div class="city-card-country">${city.country}</div>
              <div class="city-card-stats">
                <span class="city-card-stat">${city.routes.length} parcours</span>
                <span class="city-card-stat">${city.pois.length} lieux</span>
                <span class="city-card-stat">${pct}% exploré</span>
              </div>
              <div style="margin-top:8px">${createProgressBar(pct)}</div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      document.querySelector(`[data-tab="${action}"]`)?.click();
    });
  });

  container.querySelectorAll('.city-card').forEach(card => {
    card.addEventListener('click', () => {
      const cityId = card.dataset.city;
      window.dispatchEvent(new CustomEvent('selectCity', { detail: cityId }));
      document.querySelector('[data-tab="map"]')?.click();
    });
  });
}

function createProgressBar(pct) {
  return `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
}

export { cities };
