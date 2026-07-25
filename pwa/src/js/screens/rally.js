import { bilbao } from '../data/bilbao.js';
import { zaragoza } from '../data/zaragoza.js';
import { db, genId } from '../db.js';
import { updateHeader, showToast, showModal, createRingProgress } from '../components.js';
import { analysis } from '../utils/analysis.js';

const cities = [bilbao, zaragoza];
let currentRoute = null;
let currentStep = null;

export async function renderRally(container) {
  updateHeader('Rallye Photo');
  const allProgress = await db.getAllProgress();

  container.innerHTML = `
    <div class="page">
      <div class="rally-header animate-in">
        <div class="rally-header-icon">📸</div>
        <h2>Rallye Découverte</h2>
        <p>Relevez les défis photo et explorez les villes</p>
      </div>

      ${cities.map(city => `
        <div class="section-title animate-in stagger-1">${city.flag} ${city.name}</div>
        ${city.routes.map((route, i) => {
          const completed = allProgress.filter(p => p.routeId === route.id && p.completed).length;
          const total = route.steps.length;
          const pct = total ? Math.round((completed / total) * 100) : 0;
          return `
            <div class="route-card glass-card animate-in stagger-${i + 2}" data-route="${route.id}" data-city="${city.id}">
              <div class="route-card-inner">
                <div class="route-icon" style="background:${route.color}20">${route.emoji}</div>
                <div class="route-info">
                  <h3>${route.name}</h3>
                  <p>${route.description}</p>
                  <div class="route-meta">
                    <span>⏱ ${route.duration}</span>
                    <span>📏 ${route.distance}</span>
                    <span>💪 ${route.difficulty}</span>
                  </div>
                </div>
                ${createRingProgress(pct)}
              </div>
            </div>
          `;
        }).join('')}
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.route-card').forEach(card => {
    card.addEventListener('click', () => {
      const routeId = card.dataset.route;
      const cityId = card.dataset.city;
      const city = cities.find(c => c.id === cityId);
      const route = city?.routes.find(r => r.id === routeId);
      if (route) showRouteDetail(route, city);
    });
  });
}

async function showRouteDetail(route, city) {
  const container = document.getElementById('page-container');
  const allProgress = await db.getAllProgress();
  const allChallenges = await db.getAllChallenges();
  const allPhotos = await db.getAllPhotos();

  updateHeader(route.name);

  const totalPoints = route.steps.reduce((sum, s) => sum + (s.challenges?.reduce((cs, ch) => cs + ch.points, 0) || 0), 0);
  const earnedPoints = route.steps.reduce((sum, s) => {
    const stepChallenges = allChallenges.filter(ch => ch.routeId === route.id && ch.stepId === s.id && ch.completed);
    return sum + stepChallenges.reduce((cs, ch) => cs + (ch.earnedPoints || 0), 0);
  }, 0);

  container.innerHTML = `
    <div class="page">
      <div class="route-detail-hero">
        <div class="route-detail-hero-bg" style="background:${route.color}"></div>
        <div class="route-detail-hero-content">
          <h2>${route.emoji} ${route.name}</h2>
          <p>${route.description}</p>
          <div style="display:flex;gap:12px;margin-top:8px">
            <span style="font-size:12px;opacity:0.8">⏱ ${route.duration}</span>
            <span style="font-size:12px;opacity:0.8">📏 ${route.distance}</span>
            <span style="font-size:12px;opacity:0.8">🏆 ${earnedPoints}/${totalPoints} pts</span>
          </div>
        </div>
      </div>

      <div style="margin-bottom:20px">
        <button class="btn btn-primary btn-full" id="btn-start-route">
          🗺️ Ouvrir sur la carte
        </button>
      </div>

      <div class="section-title">Étapes</div>
      ${route.steps.map((step, i) => {
        const isCompleted = allProgress.some(p => p.stepId === step.id && p.completed);
        const cat = city.categories[step.category];
        const stepChallenges = step.challenges || [];
        const completedChallenges = allChallenges.filter(ch => ch.routeId === route.id && ch.stepId === step.id && ch.completed);
        return `
          <div class="step-card glass-card animate-in stagger-${i + 1}" data-step="${step.id}">
            <div class="step-number ${isCompleted ? 'completed' : ''}">${isCompleted ? '✓' : i + 1}</div>
            <div class="step-content">
              <h4>${step.name}</h4>
              <p>${step.description}</p>
              <div class="step-category" style="background:${cat?.color || '#173B7A'}20;color:${cat?.color || '#173B7A'}">${cat?.icon || ''} ${cat?.label || step.category}</div>
              ${stepChallenges.length ? `
                <div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)">
                  🏆 ${completedChallenges.length}/${stepChallenges.length} défis (${stepChallenges.reduce((s, ch) => s + ch.points, 0)} pts)
                </div>
              ` : ''}
            </div>
            <div class="step-check ${isCompleted ? 'checked' : ''}"></div>
          </div>
        `;
      }).join('')}

      <div class="section-title" style="margin-top:24px">🏆 Défis Photo</div>
      ${route.steps.flatMap(step => (step.challenges || []).map(ch => ({ ...ch, stepName: step.name, stepId: step.id }))).map(challenge => {
        const isCompleted = allChallenges.some(ch => ch.challengeId === challenge.id && ch.completed);
        const typeClass = challenge.type === 'photo' ? 'challenge-type-photo' : challenge.type === 'color' ? 'challenge-type-color' : 'challenge-type-find';
        const typeLabel = challenge.type === 'photo' ? '📸 Photo' : challenge.type === 'color' ? '🎨 Couleur' : '🔍 Trouver';
        return `
          <div class="challenge-card glass-card animate-in" data-challenge="${challenge.id}" data-route="${route.id}">
            <div class="challenge-type-badge ${typeClass}">${typeLabel}</div>
            <h3>${challenge.title}</h3>
            <p>${challenge.description}</p>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-tertiary)">📍 ${challenge.stepName}</span>
              <span style="font-size:14px;font-weight:700;color:var(--accent)">+${challenge.points} pts</span>
            </div>
            ${isCompleted ? '<div style="margin-top:8px;font-size:12px;color:var(--success);font-weight:600">✅ Défi relevé !</div>' : ''}
            ${!isCompleted ? `
              <div class="challenge-actions" style="margin-top:12px">
                <button class="btn btn-primary btn-sm btn-challenge-capture" data-challenge-id="${challenge.id}" data-route-id="${route.id}" data-step-id="${challenge.stepId}" data-type="${challenge.type}" style="flex:1">
                  📸 Relever le défi
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;

  document.getElementById('btn-start-route')?.addEventListener('click', () => {
    document.querySelector('[data-tab="map"]')?.click();
  });

  container.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('click', async () => {
      const stepId = card.dataset.step;
      const step = route.steps.find(s => s.id === stepId);
      if (step) {
        showStepDetail(step, route, city);
      }
    });
  });

  container.querySelectorAll('.btn-challenge-capture').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const challengeId = btn.dataset.challengeId;
      const routeId = btn.dataset.routeId;
      const stepId = btn.dataset.stepId;
      const type = btn.dataset.type;
      const challenge = route.steps.flatMap(s => s.challenges || []).find(ch => ch.id === challengeId);
      if (challenge) startChallenge(challenge, route, stepId);
    });
  });
}

function showStepDetail(step, route, city) {
  const cat = city.categories[step.category];
  const content = `
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:40px;margin-bottom:8px">${step.challenges?.length ? '🎯' : '📍'}</div>
      <div style="font-size:12px;background:${cat?.color || '#173B7A'}20;color:${cat?.color || '#173B7A'};padding:4px 12px;border-radius:8px;display:inline-block;font-weight:600">${cat?.icon || ''} ${cat?.label || step.category}</div>
    </div>
    <p style="text-align:center;color:var(--text-secondary);line-height:1.5;margin-bottom:16px">${step.description}</p>
    <div style="font-size:12px;color:var(--text-tertiary);text-align:center">
      📍 ${step.lat.toFixed(4)}, ${step.lng.toFixed(4)}
    </div>
    ${step.challenges?.length ? `
      <div style="margin-top:16px">
        <button class="btn btn-primary btn-full" id="modal-go-map">
          🗺️ Aller sur la carte
        </button>
      </div>
    ` : ''}
  `;

  showModal(step.name, content, [
    { id: 'close', label: 'Fermer', class: 'btn-secondary' }
  ]);

  document.getElementById('modal-go-map')?.addEventListener('click', () => {
    document.querySelector('[data-tab="map"]')?.click();
  });
}

function startChallenge(challenge, route, stepId) {
  const content = `
    <div class="camera-view" id="camera-container">
      <video id="camera-video" autoplay playsinline></video>
      <canvas id="camera-canvas"></canvas>
    </div>
    <div class="camera-controls">
      <button class="btn btn-secondary" id="btn-switch-camera">🔄</button>
      <button class="camera-btn" id="btn-capture"></button>
      <button class="btn btn-secondary" id="btn-upload">📁</button>
    </div>
    <input type="file" id="file-input" accept="image/*" style="display:none">
    <div id="photo-result"></div>
    <div id="challenge-score"></div>
  `;

  showModal(`Défi: ${challenge.title}`, content, []);
  initCamera(challenge, route, stepId);
}

async function initCamera(challenge, route, stepId) {
  const video = document.getElementById('camera-video');
  const canvas = document.getElementById('camera-canvas');
  const fileInput = document.getElementById('file-input');
  const resultDiv = document.getElementById('photo-result');
  const scoreDiv = document.getElementById('challenge-score');

  let stream = null;
  let facingMode = 'environment';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    video.srcObject = stream;
  } catch (err) {
    console.log('Camera not available, using file upload');
  }

  document.getElementById('btn-switch-camera')?.addEventListener('click', async () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      video.srcObject = stream;
    } catch (err) {}
  });

  document.getElementById('btn-upload')?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => processPhoto(ev.target.result, challenge, route, stepId, resultDiv, scoreDiv);
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-capture')?.addEventListener('click', () => {
    if (video.srcObject) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      processPhoto(canvas.toDataURL('image/jpeg', 0.9), challenge, route, stepId, resultDiv, scoreDiv);
    }
  });
}

async function processPhoto(photoData, challenge, route, stepId, resultDiv, scoreDiv) {
  analysis.init();
  resultDiv.innerHTML = `<div class="photo-result"><img src="${photoData}" alt="Photo prise"></div>`;
  scoreDiv.innerHTML = '<div style="text-align:center;padding:20px"><div class="splash-loader-bar" style="width:100px;margin:0 auto"></div><p style="margin-top:8px;color:var(--text-secondary);font-size:13px">Analyse en cours...</p></div>';

  try {
    let result;
    if (challenge.type === 'photo') {
      result = await analysis.comparePhotos(photoData, createReferenceGradient());
    } else if (challenge.type === 'color') {
      const colors = ['rouge', 'bleu', 'vert', 'jaune', 'orange', 'violet'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      result = await analysis.detectColorInPhoto(photoData, randomColor);
    } else {
      result = await analysis.detectObjectPresence(photoData, 'statue');
    }

    const points = Math.round(challenge.points * result.score / 100);
    const grade = result.score >= 80 ? '🌟 Excellent !' : result.score >= 60 ? '👍 Bien !' : result.score >= 40 ? '😅 Pas mal...' : '🤔 À retenter !';

    scoreDiv.innerHTML = `
      <div class="photo-score">
        <div class="photo-score-value">${result.score}%</div>
        <div class="photo-score-label">${grade}</div>
        <div style="margin-top:12px;font-size:14px;font-weight:600;color:var(--accent)">+${points} points</div>
        ${result.colorSimilarity !== undefined ? `
          <div style="margin-top:8px;font-size:12px;color:var(--text-tertiary)">
            🎨 Similarité colorimétrique: ${result.colorSimilarity}%<br>
            📐 Similarité structurelle: ${result.edgeSimilarity}%
          </div>
        ` : ''}
      </div>
      <div style="padding:0 20px 20px;display:flex;gap:8px">
        <button class="btn btn-secondary" style="flex:1" id="btn-retake">🔄 Recommencer</button>
        <button class="btn btn-primary" style="flex:1" id="btn-save-challenge">✓ Valider</button>
      </div>
    `;

    document.getElementById('btn-retake')?.addEventListener('click', () => {
      resultDiv.innerHTML = '';
      scoreDiv.innerHTML = '';
      startChallenge(challenge, route, stepId);
    });

    document.getElementById('btn-save-challenge')?.addEventListener('click', async () => {
      const poi = route.steps.find(s => s.id === stepId);
      const photo = {
        id: genId(),
        routeId: route.id,
        stepId,
        challengeId: challenge.id,
        poiId: poi?.poiId || '',
        poiName: poi?.name || '',
        data: photoData,
        score: result.score,
        points,
        timestamp: Date.now()
      };
      await db.addPhoto(photo);

      await db.saveChallenge({
        id: genId(),
        challengeId: challenge.id,
        routeId: route.id,
        stepId,
        completed: true,
        score: result.score,
        earnedPoints: points,
        timestamp: Date.now()
      });

      await db.addHistory({
        id: genId(),
        type: 'challenge_completed',
        title: `Défi "${challenge.title}" relevé`,
        detail: `Score: ${result.score}% - ${points} points`,
        timestamp: Date.now()
      });

      showToast(`Défi réussi ! +${points} points`, 'success');
      document.querySelector('.modal-close')?.click();
    });

  } catch (err) {
    console.error('Analysis error:', err);
    scoreDiv.innerHTML = `
      <div style="text-align:center;padding:20px">
        <p style="color:var(--danger)">Erreur d'analyse</p>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:4px">${err.message}</p>
      </div>
    `;
  }
}

function createReferenceGradient() {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 300, 200);
  grad.addColorStop(0, '#173B7A');
  grad.addColorStop(0.5, '#2952a3');
  grad.addColorStop(1, '#64D2FF');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 300, 200);
  return canvas.toDataURL();
}
