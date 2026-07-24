import { db } from '../db.js';
import { getCurrentProfile } from './profileSelect.js';
import { updateHeader, STATUSES, getTagColor } from '../components.js';

export async function renderStats(container) {
  const profile = getCurrentProfile();
  if (!profile) return;

  updateHeader('Statistiques');

  const activities = await db.getActivities(profile);

  const statusCounts = STATUSES.map(s => ({
    ...s,
    count: activities.filter(a => a.status === s.id).length
  }));

  const tagCounts = {};
  activities.forEach(a => {
    (a.tags || []).forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const tagStats = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  const total = activities.length;
  const maxStatus = Math.max(...statusCounts.map(s => s.count), 1);
  const maxTag = Math.max(...tagStats.map(t => t.count), 1);

  const donePercent = total > 0 ? Math.round((statusCounts.find(s => s.id === 'done').count / total) * 100) : 0;

  container.innerHTML = `
    <div class="page">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">${total}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${donePercent}%</span>
          <span class="stat-label">Realise</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${tagStats.length}</span>
          <span class="stat-label">Tags</span>
        </div>
      </div>

      <div class="chart-container">
        <h3 class="chart-title">Par statut</h3>
        <div class="chart-bars">
          ${statusCounts.map(s => `
            <div class="chart-bar-row">
              <span class="chart-label">${s.icon} ${s.label}</span>
              <div class="chart-bar-track">
                <div class="chart-bar" style="width:${s.count ? (s.count / maxStatus * 100) : 0}%;background:${s.color}"></div>
              </div>
              <span class="chart-value">${s.count}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${tagStats.length > 0 ? `
        <div class="chart-container">
          <h3 class="chart-title">Par tag</h3>
          <div class="chart-bars">
            ${tagStats.map(t => `
              <div class="chart-bar-row">
                <span class="chart-label">
                  <span class="tag-dot" style="background:${getTagColor(t.tag)}"></span>
                  ${t.tag}
                </span>
                <div class="chart-bar-track">
                  <div class="chart-bar" style="width:${t.count / maxTag * 100}%;background:${getTagColor(t.tag)}"></div>
                </div>
                <span class="chart-value">${t.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div class="chart-container">
        <h3 class="chart-title">Recence</h3>
        <div class="chart-bars">
          ${getRecentStats(activities).map(d => `
            <div class="chart-bar-row">
              <span class="chart-label">${d.label}</span>
              <div class="chart-bar-track">
                <div class="chart-bar" style="width:${d.count ? (d.count / d.max * 100) : 0}%;background:var(--accent)"></div>
              </div>
              <span class="chart-value">${d.count}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getRecentStats(activities) {
  const now = Date.now();
  const day = 86400000;
  const labels = ["Aujourd'hui", '7 jours', '30 jours', 'Tout'];
  const periods = [day, 7 * day, 30 * day, Infinity];
  const counts = periods.map(p => activities.filter(a => now - a.createdAt < p).length);
  const max = Math.max(...counts, 1);
  return labels.map((label, i) => ({ label, count: counts[i], max }));
}
