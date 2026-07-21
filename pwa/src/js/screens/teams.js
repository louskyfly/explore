import { db, genId } from '../db.js';
import { updateHeader, showToast, showModal } from '../components.js';
import { checkAchievements } from './achievements.js';

export async function renderTeams(container) {
  updateHeader('Amis & Équipes');
  const teams = await db.getAllTeams();
  const allProgress = await db.getAllProgress();
  const friends = (await db.getSetting('friends')) || [];
  const username = await db.getSetting('username') || 'Invité';

  const sortedTeams = teams.sort((a, b) => {
    const scoreA = allProgress.filter(p => p.teamId === a.id).reduce((s, p) => s + (p.points || 0), 0);
    const scoreB = allProgress.filter(p => p.teamId === b.id).reduce((s, p) => s + (p.points || 0), 0);
    return scoreB - scoreA;
  });

  container.innerHTML = `
    <div class="page">
      <div style="text-align:center;margin-bottom:20px" class="animate-in">
        <div style="font-size:48px;margin-bottom:8px">👥</div>
        <h2 style="font-size:22px;font-weight:700">Amis & Équipes</h2>
        <p style="font-size:14px;color:var(--text-secondary);margin-top:4px">Ajoutez des amis et créez des équipes</p>
      </div>

      <div class="section-title animate-in stagger-1">💠 Mes Amis</div>
      <div style="display:flex;gap:8px;margin-bottom:12px" class="animate-in stagger-1">
        <button class="btn btn-primary" style="flex:1" id="btn-add-friend">➕ Ajouter un ami</button>
      </div>
      ${friends.length ? `
        <div class="friends-list animate-in stagger-2">
          ${friends.map((f, i) => `
            <div class="friend-card glass-card animate-in stagger-${Math.min(i + 1, 6)}" data-friend-index="${i}">
              <div class="friend-avatar" style="background:${f.color || '#173B7A'}">${f.nickname[0]?.toUpperCase() || '?'}</div>
              <div class="friend-info">
                <h4>${f.nickname}</h4>
                <p style="font-size:12px;color:var(--text-tertiary)">${f.addedAt ? 'Ajouté ' + new Date(f.addedAt).toLocaleDateString('fr-FR') : ''}</p>
              </div>
              <button class="btn btn-sm btn-danger" data-remove-friend="${i}" style="padding:6px 10px;font-size:11px">✕</button>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="glass-card animate-in stagger-2" style="padding:16px;text-align:center;color:var(--text-secondary)">
          <p style="font-size:13px">Aucun ami ajouté</p>
          <p style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Ajoutez des amis par leur pseudo</p>
        </div>
      `}

      <div class="section-title animate-in" style="margin-top:24px">👥 Équipes</div>
      <div style="display:flex;gap:8px;margin-bottom:12px" class="animate-in">
        <button class="btn btn-primary" style="flex:1" id="btn-create-team">➕ Créer</button>
        <button class="btn btn-secondary" style="flex:1" id="btn-join-team">🔗 Rejoindre</button>
      </div>

      ${sortedTeams.length ? `
        <div class="section-title animate-in">🏆 Classement</div>
        ${sortedTeams.map((team, i) => {
          const teamScore = allProgress.filter(p => p.teamId === team.id).reduce((s, p) => s + (p.points || 0), 0);
          const members = team.members || [];
          const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
          return `
            <div class="rank-row glass-card animate-in stagger-${Math.min(i + 3, 6)}" data-team="${team.id}">
              <div class="rank-position ${rankClass}">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</div>
              <div class="team-avatar" style="background:${team.color || '#173B7A'}">${team.emoji || '👥'}</div>
              <div class="rank-info">
                <h4>${team.name}</h4>
                <p>${members.length} membre${members.length > 1 ? 's' : ''}</p>
              </div>
              <div class="rank-score">${teamScore}</div>
            </div>
          `;
        }).join('')}
      ` : `
        <div class="empty-state animate-in stagger-3">
          <div class="empty-state-icon">👥</div>
          <h3>Aucune équipe</h3>
          <p>Créez une équipe ou rejoignez-en une !</p>
        </div>
      `}

      <div class="section-title animate-in" style="margin-top:20px">📋 Mes équipes</div>
      ${teams.length ? teams.map((team, i) => `
        <div class="team-card glass-card animate-in stagger-${Math.min(i + 1, 6)}" data-team="${team.id}">
          <div class="team-card-header">
            <div class="team-avatar" style="background:${team.color || '#173B7A'}">${team.emoji || '👥'}</div>
            <div class="team-card-info">
              <h3>${team.name}</h3>
              <p>Code: <strong>${team.code}</strong></p>
            </div>
          </div>
          <div class="team-members">
            ${(team.members || []).map(m => `
              <div class="team-member-avatar" style="background:${team.color || '#173B7A'}">${m[0]?.toUpperCase() || '?'}</div>
            `).join('')}
          </div>
        </div>
      `).join('') : `
        <div class="glass-card animate-in stagger-1" style="padding:16px;text-align:center;color:var(--text-secondary)">
          <p style="font-size:13px">Pas encore d'équipe</p>
        </div>
      `}
    </div>
  `;

  document.getElementById('btn-add-friend')?.addEventListener('click', showAddFriendModal);
  document.getElementById('btn-create-team')?.addEventListener('click', () => showCreateTeamModal(friends));
  document.getElementById('btn-join-team')?.addEventListener('click', showJoinTeamModal);

  container.querySelectorAll('[data-remove-friend]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.removeFriend);
      const updatedFriends = [...friends];
      updatedFriends.splice(idx, 1);
      await db.setSetting('friends', updatedFriends);
      showToast('Ami retiré', 'info');
      renderTeams(container);
    });
  });

  container.querySelectorAll('.team-card, .rank-row').forEach(card => {
    card.addEventListener('click', () => {
      const teamId = card.dataset.team;
      const team = teams.find(t => t.id === teamId);
      if (team) showTeamDetail(team);
    });
  });
}

function showAddFriendModal() {
  const colors = ['#173B7A', '#EF5350', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#26C6DA', '#5C6BC0'];

  const content = `
    <div class="input-group">
      <label class="input-label">Pseudo de l'ami</label>
      <input class="input" id="friend-nickname-input" placeholder="Ex: Lucas" maxlength="20">
    </div>
    <div class="input-group">
      <label class="input-label">Couleur</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap" id="friend-color-picker">
        ${colors.map((c, i) => `
          <button class="btn btn-sm" style="width:36px;height:36px;border-radius:10px;background:${c};border:3px solid ${i === 0 ? '#fff' : 'transparent'}" data-color="${c}"></button>
        `).join('')}
      </div>
    </div>
  `;

  showModal('Ajouter un ami', content, [
    { id: 'cancel', label: 'Annuler', class: 'btn-secondary' },
    { id: 'add', label: 'Ajouter', class: 'btn-primary' }
  ]);

  let selectedColor = colors[0];

  document.querySelectorAll('#friend-color-picker button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.dataset.color;
      document.querySelectorAll('#friend-color-picker button').forEach(b => b.style.borderColor = b.dataset.color === selectedColor ? '#fff' : 'transparent');
    });
  });

  document.querySelector('[data-action="add"]')?.addEventListener('click', async () => {
    const nickname = document.getElementById('friend-nickname-input')?.value?.trim();
    if (!nickname) {
      showToast('Entrez un pseudo', 'error');
      return;
    }
    const friends = (await db.getSetting('friends')) || [];
    if (friends.some(f => f.nickname.toLowerCase() === nickname.toLowerCase())) {
      showToast('Cet ami est déjà dans votre liste', 'error');
      return;
    }
    friends.push({ nickname, color: selectedColor, addedAt: Date.now() });
    await db.setSetting('friends', friends);
    showToast(`✅ ${nickname} ajouté en ami !`, 'success');
    checkAchievements();
    renderTeams(document.getElementById('page-container'));
  });
}

function showCreateTeamModal(friends = []) {
  const colors = ['#173B7A', '#EF5350', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#26C6DA', '#5C6BC0'];
  const emojis = ['👥', '🚀', '⚡', '🔥', '🌟', '🎯', '🏆', '💪', '🎮', '🦁'];

  const content = `
    <div class="input-group">
      <label class="input-label">Nom de l'équipe</label>
      <input class="input" id="team-name-input" placeholder="Les Explorateurs" maxlength="24">
    </div>
    <div class="input-group">
      <label class="input-label">Votre pseudo</label>
      <input class="input" id="team-pseudo-input" placeholder="Votre nom" maxlength="20">
    </div>
    <div class="input-group">
      <label class="input-label">Couleur</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap" id="color-picker">
        ${colors.map((c, i) => `
          <button class="btn btn-sm" style="width:40px;height:40px;border-radius:12px;background:${c};border:3px solid ${i === 0 ? '#fff' : 'transparent'}" data-color="${c}"></button>
        `).join('')}
      </div>
    </div>
    <div class="input-group">
      <label class="input-label">Emblème</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap" id="emoji-picker">
        ${emojis.map((e, i) => `
          <button class="btn btn-sm" style="width:40px;height:40px;border-radius:12px;font-size:20px;background:var(--input-bg);border:3px solid ${i === 0 ? 'var(--accent)' : 'transparent'}" data-emoji="${e}">${e}</button>
        `).join('')}
      </div>
    </div>
    ${friends.length ? `
      <div class="input-group">
        <label class="input-label">Inviter des amis (optionnel)</label>
        <div style="display:flex;flex-wrap:wrap;gap:6px" id="invite-friends-list">
          ${friends.map((f, i) => `
            <label class="friend-invite-chip" style="display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:10px;background:var(--input-bg);border:1px solid var(--border);cursor:pointer;font-size:13px">
              <input type="checkbox" value="${f.nickname}" class="invite-check" style="accent-color:var(--accent)">
              ${f.nickname}
            </label>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  showModal('Créer une équipe', content, [
    { id: 'cancel', label: 'Annuler', class: 'btn-secondary' },
    { id: 'create', label: 'Créer', class: 'btn-primary' }
  ]);

  let selectedColor = colors[0];
  let selectedEmoji = emojis[0];

  document.querySelectorAll('#color-picker button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.dataset.color;
      document.querySelectorAll('#color-picker button').forEach(b => b.style.borderColor = b.dataset.color === selectedColor ? '#fff' : 'transparent');
    });
  });

  document.querySelectorAll('#emoji-picker button').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedEmoji = btn.dataset.emoji;
      document.querySelectorAll('#emoji-picker button').forEach(b => b.style.borderColor = b.dataset.emoji === selectedEmoji ? 'var(--accent)' : 'transparent');
    });
  });

  document.querySelector('[data-action="create"]')?.addEventListener('click', async (e) => {
    const name = document.getElementById('team-name-input')?.value?.trim();
    const pseudo = document.getElementById('team-pseudo-input')?.value?.trim();
    if (!name || !pseudo) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const invited = [...document.querySelectorAll('.invite-check:checked')].map(cb => cb.value);
    const members = [pseudo, ...invited];

    const team = {
      id: genId(),
      name,
      code,
      color: selectedColor,
      emoji: selectedEmoji,
      members,
      createdBy: pseudo,
      createdAt: Date.now()
    };
    await db.saveTeam(team);
    await db.setSetting('currentTeam', team.id);
    await db.setSetting('username', pseudo);
    showToast(`Équipe "${name}" créée ! Code: ${code}`, 'success');
    checkAchievements();
    renderTeams(document.getElementById('page-container'));
  });
}

function showJoinTeamModal() {
  const content = `
    <div class="input-group">
      <label class="input-label">Code de l'équipe</label>
      <input class="input" id="join-code-input" placeholder="ABC123" maxlength="6" style="text-transform:uppercase;text-align:center;font-size:24px;letter-spacing:4px">
    </div>
    <div class="input-group">
      <label class="input-label">Votre pseudo</label>
      <input class="input" id="join-pseudo-input" placeholder="Votre nom" maxlength="20">
    </div>
  `;

  showModal('Rejoindre une équipe', content, [
    { id: 'cancel', label: 'Annuler', class: 'btn-secondary' },
    { id: 'join', label: 'Rejoindre', class: 'btn-primary' }
  ]);

  document.querySelector('[data-action="join"]')?.addEventListener('click', async () => {
    const code = document.getElementById('join-code-input')?.value?.trim().toUpperCase();
    const pseudo = document.getElementById('join-pseudo-input')?.value?.trim();
    if (!code || !pseudo) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    const teams = await db.getAllTeams();
    const team = teams.find(t => t.code === code);
    if (!team) {
      showToast('Code d\'équipe invalide', 'error');
      return;
    }
    if (team.members.includes(pseudo)) {
      showToast('Ce pseudo est déjà utilisé', 'error');
      return;
    }
    team.members.push(pseudo);
    await db.saveTeam(team);
    await db.setSetting('currentTeam', team.id);
    await db.setSetting('username', pseudo);
    showToast(`Bienvenue dans "${team.name}" !`, 'success');
    checkAchievements();
    renderTeams(document.getElementById('page-container'));
  });
}

function showTeamDetail(team) {
  const content = `
    <div style="text-align:center;margin-bottom:16px">
      <div class="team-avatar" style="background:${team.color || '#173B7A'};width:64px;height:64px;font-size:32px;margin:0 auto 8px">${team.emoji || '👥'}</div>
      <h3 style="font-size:18px;font-weight:700">${team.name}</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-top:4px">Code: <strong>${team.code}</strong></p>
      <p style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Partagez ce code pour inviter</p>
    </div>
    <div class="section-title" style="font-size:14px">Membres</div>
    ${(team.members || []).map(m => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div class="team-member-avatar" style="margin-left:0;background:${team.color || '#173B7A'}">${m[0]?.toUpperCase()}</div>
        <span style="font-weight:500">${m}</span>
        ${m === team.createdBy ? '<span style="font-size:11px;background:var(--badge-bg);color:var(--accent);padding:2px 8px;border-radius:6px;margin-left:auto">Chef</span>' : ''}
      </div>
    `).join('')}
    <div style="margin-top:16px">
      <button class="btn btn-secondary btn-full" id="btn-copy-code">📋 Copier le code</button>
    </div>
  `;

  showModal(team.name, content, [
    { id: 'close', label: 'Fermer', class: 'btn-secondary' }
  ]);

  document.getElementById('btn-copy-code')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(team.code).then(() => {
      showToast('Code copié !', 'success');
    }).catch(() => {
      showToast(`Code: ${team.code}`, 'info');
    });
  });
}
