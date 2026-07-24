import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, CATEGORIES, STATUSES, getCategoryById, getStatusById } from '../components.js';

export async function renderStats(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Statistiques');

  const activities = await db.getActivitiesByProfile(profile);
  const total = activities.length;

  const byStatus = {};
  STATUSES.forEach(s => { byStatus[s.id] = 0; });
  activities.forEach(a => {
    if (byStatus[a.status] !== undefined) byStatus[a.status]++;
  });

  const byCategory = {};
  CATEGORIES.forEach(c => { byCategory[c.id] = 0; });
  activities.forEach(a => {
    if (byCategory[a.category] !== undefined) byCategory[a.category]++;
    else byCategory['other']++;
  });
  const maxCat = Math.max(...Object.values(byCategory), 1);

  const doneCount = byStatus['done'] || 0;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  container.innerHTML = `
    <div class="page">
      <h2 class="section-title animate-in">Resume</h2>
      <div class="stats-grid animate-in stagger-1">
        <div class="stat-card glass-card">
          <div class="stat-value">${total}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">${percent}%</div>
          <div class="stat-label">Realisees</div>
        </div>
      </div>

      <div class="glass-card animate-in stagger-2" style="padding:16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span style="font-size:14px;font-weight:600;">Progression</span>
          <span style="font-size:14px;color:var(--text-secondary);">${doneCount}/${total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>
      </div>

      <h2 class="section-title animate-in stagger-3">Par statut</h2>
      <div class="bar-chart animate-in stagger-3" style="margin-bottom:24px;">
        ${STATUSES.map(s => {
          const count = byStatus[s.id] || 0;
          const width = total > 0 ? (count / total) * 100 : 0;
          return `
            <div class="bar-row">
              <div class="bar-label">${s.icon} ${s.label}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%;background:${s.color};">
                  ${count > 0 ? `<span class="bar-value">${count}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <h2 class="section-title animate-in stagger-4">Par categorie</h2>
      <div class="bar-chart animate-in stagger-5">
        ${CATEGORIES.map(c => {
          const count = byCategory[c.id] || 0;
          const width = maxCat > 0 ? (count / maxCat) * 100 : 0;
          return `
            <div class="bar-row">
              <div class="bar-label">${c.icon} ${c.label}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width:${width}%">
                  ${count > 0 ? `<span class="bar-value">${count}</span>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
