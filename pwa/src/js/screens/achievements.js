import { db, genId } from '../db.js';
import { updateHeader, showToast } from '../components.js';
import { cities } from './home.js';

const ACHIEVEMENTS = [
  { id: 'ach_first_step', name: 'Premier Pas', description: 'Complétez votre première étape', icon: '👣', category: 'Exploration', check: async (allProgress) => allProgress.filter(p => p.completed).length >= 1 },
  { id: 'ach_10_steps', name: 'Explorateur', description: 'Complétez 10 étapes', icon: '🧭', category: 'Exploration', check: async (allProgress) => allProgress.filter(p => p.completed).length >= 10 },
  { id: 'ach_20_steps', name: 'Grand Explorateur', description: 'Complétez 20 étapes', icon: '🗺️', category: 'Exploration', check: async (allProgress) => allProgress.filter(p => p.completed).length >= 20 },
  { id: 'ach_500_points', name: '500 Points', description: 'Accumulez 500 points', icon: '⭐', category: 'Points', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).reduce((s, c) => s + (c.earnedPoints || 0), 0) >= 500 },
  { id: 'ach_1000_points', name: '1000 Points', description: 'Accumulez 1000 points', icon: '🌟', category: 'Points', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).reduce((s, c) => s + (c.earnedPoints || 0), 0) >= 1000 },
  { id: 'ach_2000_points', name: 'Légende', description: 'Accumulez 2000 points', icon: '👑', category: 'Points', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).reduce((s, c) => s + (c.earnedPoints || 0), 0) >= 2000 },
  { id: 'ach_first_photo', name: 'Premier Clic', description: 'Prenez votre première photo', icon: '📸', category: 'Photos', check: async (_, __, allPhotos) => allPhotos.length >= 1 },
  { id: 'ach_5_photos', name: 'Apprenti Photographe', description: 'Accumulez 5 photos', icon: '📷', category: 'Photos', check: async (_, __, allPhotos) => allPhotos.length >= 5 },
  { id: 'ach_10_photos', name: 'Photographe', description: 'Accumulez 10 photos', icon: '📸', category: 'Photos', check: async (_, __, allPhotos) => allPhotos.length >= 10 },
  { id: 'ach_20_photos', name: 'Collectionneur', description: 'Accumulez 20 photos', icon: '🎨', category: 'Photos', check: async (_, __, allPhotos) => allPhotos.length >= 20 },
  { id: 'ach_50_photos', name: 'Maître Photographe', description: 'Accumulez 50 photos', icon: '🏆', category: 'Photos', check: async (_, __, allPhotos) => allPhotos.length >= 50 },
  { id: 'ach_perfect_score', name: 'Score Parfait', description: 'Obtenez 100% à un défi', icon: '💯', category: 'Qualité', check: async (_, __, allPhotos) => allPhotos.some(p => p.score === 100) },
  { id: 'ach_high_score', name: 'Score Élevé', description: 'Obtenez un score moyen >70%', icon: '📈', category: 'Qualité', check: async (_, __, allPhotos) => {
    const scored = allPhotos.filter(p => p.score !== undefined);
    if (scored.length < 5) return false;
    const avg = scored.reduce((s, p) => s + p.score, 0) / scored.length;
    return avg >= 70;
  }},
  { id: 'ach_first_route', name: 'Premier Parcours', description: 'Terminez un parcours complet', icon: '🏁', category: 'Parcours', check: async (allProgress) => {
    for (const city of cities) {
      for (const route of city.routes) {
        const stepsCompleted = route.steps.filter(s => allProgress.some(p => p.stepId === s.id && p.completed)).length;
        if (stepsCompleted === route.steps.length) return true;
      }
    }
    return false;
  }},
  { id: 'ach_bilbao_complete', name: 'Explorateur de Bilbao', description: 'Explorez tous les lieux de Bilbao', icon: '🏙️', category: 'Villes', check: async (allProgress) => {
    const steps = cities.find(c => c.id === 'bilbao')?.routes.flatMap(r => r.steps) || [];
    return steps.length > 0 && steps.filter(s => allProgress.some(p => p.stepId === s.id && p.completed)).length >= steps.length;
  }},
  { id: 'ach_zaragoza_complete', name: 'Explorateur de Saragosse', description: 'Explorez tous les lieux de Saragosse', icon: '🏰', category: 'Villes', check: async (allProgress) => {
    const steps = cities.find(c => c.id === 'zaragoza')?.routes.flatMap(r => r.steps) || [];
    return steps.length > 0 && steps.filter(s => allProgress.some(p => p.stepId === s.id && p.completed)).length >= steps.length;
  }},
  { id: 'ach_all_categories', name: 'Curieux', description: 'Découvrez toutes les catégories', icon: '🔍', category: 'Exploration', check: async (allProgress) => {
    const allSteps = cities.flatMap(c => c.routes.flatMap(r => r.steps));
    const completedSteps = allSteps.filter(s => allProgress.some(p => p.stepId === s.id && p.completed));
    const categories = new Set(completedSteps.map(s => s.category));
    return categories.size >= 8;
  }},
  { id: 'ach_team_player', name: 'Esprit d\'équipe', description: 'Rejoignez une équipe', icon: '🤝', category: 'Social', check: async () => {
    const teamId = await db.getSetting('currentTeam');
    return !!teamId;
  }},
  { id: 'ach_challenges_5', name: 'Défi Relevé', description: 'Complétez 5 défis photo', icon: '🎯', category: 'Défis', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).length >= 5 },
  { id: 'ach_challenges_15', name: 'Maître du Défi', description: 'Complétez 15 défis photo', icon: '🏅', category: 'Défis', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).length >= 15 },
  { id: 'ach_challenges_30', name: 'Champion des Défis', description: 'Complétez 30 défis photo', icon: '🥇', category: 'Défis', check: async (_, allChallenges) => allChallenges.filter(c => c.completed).length >= 30 },
  { id: 'ach_first_friend', name: 'Premier Ami', description: 'Ajoutez un ami', icon: '👬', category: 'Social', check: async () => {
    const friends = await db.getSetting('friends');
    return friends && friends.length >= 1;
  }},
  { id: 'ach_5_friends', name: 'Populaire', description: 'Ajoutez 5 amis', icon: '🎉', category: 'Social', check: async () => {
    const friends = await db.getSetting('friends');
    return friends && friends.length >= 5;
  }},
  { id: 'ach_near_poi', name: 'Explorateur Proche', description: 'Passez à moins de 500m d\'un lieu', icon: '📍', category: 'Géoloc', check: async () => {
    const nearPoi = await db.getSetting('near_poi_visited');
    return !!nearPoi;
  }},
  { id: 'ach_night_photo', name: 'Photographe de Nuit', description: 'Prenez une photo après 20h', icon: '🌙', category: 'Photos', check: async (_, __, allPhotos) => {
    return allPhotos.some(p => {
      const h = new Date(p.timestamp).getHours();
      return h >= 20 || h < 6;
    });
  }},
  { id: 'ach_early_bird', name: 'Lève-tôt', description: 'Prenez une photo avant 8h', icon: '🌅', category: 'Photos', check: async (_, __, allPhotos) => {
    return allPhotos.some(p => {
      const h = new Date(p.timestamp).getHours();
      return h >= 5 && h < 8;
    });
  }},
  { id: 'ach_color_hunter', name: 'Chasseur de Couleurs', description: 'Complétez 3 défis de type couleur', icon: '🎨', category: 'Défis', check: async (_, allChallenges) => {
    return allChallenges.filter(c => c.completed && c.challengeType === 'color').length >= 3;
  }},
  { id: 'ach_photo_master', name: 'Maître Photo', description: 'Complétez 5 défis de type photo', icon: '📷', category: 'Défis', check: async (_, allChallenges) => {
    return allChallenges.filter(c => c.completed && c.challengeType === 'photo').length >= 5;
  }},
  { id: 'ach_finder', name: 'Trouveur', description: 'Complétez 5 défis de type recherche', icon: '🔍', category: 'Défis', check: async (_, allChallenges) => {
    return allChallenges.filter(c => c.completed && c.challengeType === 'find').length >= 5;
  }},
  { id: 'ach_marathon', name: 'Marathon', description: 'Prenez 5 photos en une session', icon: '🏃', category: 'Photos', check: async (_, __, allPhotos) => {
    if (allPhotos.length < 5) return false;
    const sorted = [...allPhotos].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 4; i < sorted.length; i++) {
      if (sorted[i].timestamp - sorted[i - 4].timestamp < 3600000) return true;
    }
    return false;
  }},
  { id: 'ach_explorer_badge', name: 'Badge Explorateur', description: 'Débloquez 10 succès', icon: '🎖️', category: 'Meta', check: async () => {
    const all = await db.getAllAchievements();
    return all.length >= 10;
  }},
  { id: 'ach_completionist', name: 'Complétionniste', description: 'Débloquez 20 succès', icon: '💎', category: 'Meta', check: async () => {
    const all = await db.getAllAchievements();
    return all.length >= 20;
  }}
];

export async function renderAchievements(container) {
  updateHeader('Succès');
  const allProgress = await db.getAllProgress();
  const allChallenges = await db.getAllChallenges();
  const allPhotos = await db.getAllPhotos();
  const existingAchievements = await db.getAllAchievements();
  const existingIds = new Set(existingAchievements.map(a => a.id));

  let unlockedCount = 0;
  const achievementCards = [];

  for (const ach of ACHIEVEMENTS) {
    const isUnlocked = existingIds.has(ach.id);
    if (isUnlocked) unlockedCount++;
    achievementCards.push({ ...ach, unlocked: isUnlocked });
  }

  const categories = [...new Set(ACHIEVEMENTS.map(a => a.category))];

  container.innerHTML = `
    <div class="page">
      <div style="text-align:center;margin-bottom:24px" class="animate-in">
        <div style="font-size:48px;margin-bottom:8px">🏆</div>
        <h2 style="font-size:22px;font-weight:700">Succès</h2>
        <p style="font-size:14px;color:var(--text-secondary);margin-top:4px">${unlockedCount}/${ACHIEVEMENTS.length} débloqués</p>
        <div style="margin-top:12px">${createProgressBar(Math.round((unlockedCount / ACHIEVEMENTS.length) * 100))}</div>
      </div>

      ${categories.map(cat => {
        const catAchs = achievementCards.filter(a => a.category === cat);
        const catUnlocked = catAchs.filter(a => a.unlocked).length;
        return `
          <div class="section-title animate-in" style="margin-top:16px">${cat} <span style="font-size:12px;color:var(--text-tertiary);font-weight:400">${catUnlocked}/${catAchs.length}</span></div>
          ${catAchs.map((ach, i) => `
            <div class="achievement-card glass-card animate-in stagger-${Math.min(i + 1, 6)} ${ach.unlocked ? '' : 'locked'}">
              <div class="achievement-icon ${ach.unlocked ? '' : 'locked'}" style="background:${ach.unlocked ? 'rgba(48,209,88,0.15)' : 'var(--input-bg)'}">${ach.icon}</div>
              <div class="achievement-info">
                <h4>${ach.name}</h4>
                <p>${ach.description}</p>
                ${ach.unlocked ? '<span style="font-size:11px;color:var(--success);font-weight:600">✅ Débloqué</span>' : '<span style="font-size:11px;color:var(--text-tertiary)">🔒 Verrouillé</span>'}
              </div>
            </div>
          `).join('')}
        `;
      }).join('')}
    </div>
  `;
}

export async function checkAchievements() {
  const allProgress = await db.getAllProgress();
  const allChallenges = await db.getAllChallenges();
  const allPhotos = await db.getAllPhotos();
  const existing = await db.getAllAchievements();
  const existingIds = new Set(existing.map(a => a.id));

  for (const ach of ACHIEVEMENTS) {
    if (existingIds.has(ach.id)) continue;
    try {
      const unlocked = await ach.check(allProgress, allChallenges, allPhotos);
      if (unlocked) {
        const achievement = {
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          category: ach.category,
          unlockedAt: Date.now()
        };
        await db.saveAchievement(achievement);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🏆 Nouveau succès !', {
            body: `${ach.icon} ${ach.name}: ${ach.description}`,
            icon: '/icons/icon-192.png'
          });
        }

        showToast(`🏆 Succès débloqué: ${ach.name}`, 'success', 4000);
      }
    } catch (e) {}
  }
}

function createProgressBar(pct) {
  return `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;
}
