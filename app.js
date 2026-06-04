const SAVE_KEY = 'blackwood-manor-progress-v5';

const state = {
  caseData: null,
  sceneIndex: 0,
  clues: new Set(),
  asked: new Set(),
  inspected: new Set(),
  phase: 'scene'
};

const $ = (sel) => document.querySelector(sel);
const imageAssets = {
  'manor-placeholder': './assets/images/manor-exterior.png',
  'table-placeholder': './assets/images/dining-room.png',
  'murder-placeholder': './assets/images/scene-murder.png',
  'inspector-placeholder': './assets/images/scene-inspector.png',
  'locked-medical-vial': './assets/images/locked-medical-vial.png',
  'medical-bag': './assets/images/locked-medical-vial.png',
  'clue-flooded-road': './assets/images/clues/clue-flooded-road.png',
  'clue-tonic-bottle': './assets/images/clues/clue-tonic-bottle.png',
  'clue-blackout': './assets/images/clues/clue-blackout.png',
  'clue-west-wing-sale': './assets/images/clues/clue-west-wing-sale.png',
  'clue-victor-debt': './assets/images/clues/clue-victor-debt.png',
  'clue-bottle-switch': './assets/images/clues/clue-bottle-switch.png',
  'clue-old-letters': './assets/images/clues/clue-old-letters.png',
  'clue-midnight-note': './assets/images/clues/clue-midnight-note.png',
  'clue-medical-bag': './assets/images/clues/clue-medical-bag.png',
  'clue-sideboard': './assets/images/clues/clue-sideboard.png',
  'char-margaret': './assets/images/char-margaret.png',
  'char-clara': './assets/images/char-clara.png',
  'char-victor': './assets/images/char-victor.png',
  'char-dr-ward': './assets/images/char-dr-ward.png',
  'char-thomas': './assets/images/char-thomas.png',
  'char-evelyn': './assets/images/char-evelyn.png'
};
const imageIcons = {
  'manor-placeholder': '🏛️🌧️',
  'table-placeholder': '🍷🕯️',
  'murder-placeholder': '⚰️⚡',
  'inspector-placeholder': '🕵️‍♂️📓',
  'locked-medical-vial': '🧪',
  'medical-bag': '🧪',
  'char-margaret': '👵',
  'char-clara': '👩',
  'char-victor': '🤵',
  'char-dr-ward': '👩‍⚕️',
  'char-thomas': '🧓',
  'char-evelyn': '💃'
};

function setImage(key, alt) {
  const card = $('#imageCard');
  const src = imageAssets[key];
  if (src) {
    card.innerHTML = `<img src="${src}" alt="${alt || ''}" loading="eager">`;
  } else {
    card.textContent = imageIcons[key] || '🕯️';
  }
}

async function init() {
  const res = await fetch('case-blackwood-manor.json');
  state.caseData = await res.json();
  loadState();
  $('#subtitle').textContent = state.caseData.setting;
  $('#newGameBtn').addEventListener('click', restart);
  $('#notebookBtn').addEventListener('click', showNotebook);
  $('#suspectList').addEventListener('click', event => {
    const btn = event.target.closest('[data-character-id]');
    if (btn) renderQuestioning(btn.dataset.characterId);
  });
  $('#closeNotebook').addEventListener('click', () => $('#notebookDialog').close());
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  renderAll();
}

function saveState() {
  if (!state.caseData) return;
  const data = {
    sceneIndex: state.sceneIndex,
    clues: [...state.clues],
    asked: [...state.asked],
    inspected: [...state.inspected],
    phase: state.phase
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.sceneIndex = Math.max(0, Math.min(Number(data.sceneIndex || 0), state.caseData.scenes.length - 1));
    state.clues = new Set(Array.isArray(data.clues) ? data.clues : []);
    state.asked = new Set(Array.isArray(data.asked) ? data.asked : []);
    state.inspected = new Set(Array.isArray(data.inspected) ? data.inspected : []);
    state.phase = data.phase || 'scene';
  } catch {
    localStorage.removeItem(SAVE_KEY);
  }
}

function restart() {
  state.sceneIndex = 0;
  state.clues = new Set();
  state.asked = new Set();
  state.inspected = new Set();
  state.phase = 'scene';
  localStorage.removeItem(SAVE_KEY);
  renderAll();
}

function renderAll() {
  saveState();
  renderProgress();
  renderSuspects();
  renderStage();
  updateClueCount();
}

function clueById(id) {
  return state.caseData.clues.find(c => c.id === id);
}
function charById(id) {
  return state.caseData.characters.find(c => c.id === id);
}
function imageKeyForCharacter(id) {
  return {
    'margaret-blackwood': 'char-margaret',
    'clara-blackwood': 'char-clara',
    'victor-hale': 'char-victor',
    'dr-elise-ward': 'char-dr-ward',
    'thomas-reed': 'char-thomas',
    'evelyn-cross': 'char-evelyn'
  }[id];
}
function addClue(id, silent = false) {
  if (!id) return false;
  const clue = clueById(id);
  if (!clue) return false;
  const wasNew = !state.clues.has(id);
  state.clues.add(id);
  updateClueCount();
  if (wasNew && !silent) showClueToast(clue);
  return wasNew;
}
function updateClueCount() {
  $('#clueCount').textContent = state.clues.size;
}
function showClueToast(clue) {
  let toast = $('#clueToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'clueToast';
    toast.className = 'clue-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<strong>New clue:</strong> ${clue.title}`;
  toast.classList.add('show');
  clearTimeout(showClueToast.timer);
  showClueToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function cluePills(ids = []) {
  return ids.map(id => clueById(id)).filter(Boolean).map(c => `<span class="clue-pill">${c.title}</span>`).join('');
}
function clueProgressText() {
  return `${state.clues.size}/${state.caseData.clues.length} clues found`;
}

function renderProgress() {
  const list = $('#sceneList');
  list.innerHTML = '';
  state.caseData.scenes.forEach((scene, idx) => {
    const li = document.createElement('li');
    li.textContent = scene.title;
    if (idx === state.sceneIndex && state.phase === 'scene') li.classList.add('active');
    list.appendChild(li);
  });
  const extra = [
    ['Question suspects', 'question'],
    ['Inspect locations', 'inspect'],
    ['Make accusation', 'accuse'],
    ['Reveal solution', 'result']
  ];
  extra.forEach(([label, phase]) => {
    const li = document.createElement('li');
    li.textContent = label;
    if (state.phase === phase) li.classList.add('active');
    list.appendChild(li);
  });
}

function renderSuspects() {
  const wrap = $('#suspectList');
  wrap.innerHTML = '';
  state.caseData.characters.forEach(ch => {
    const card = document.createElement('article');
    card.className = 'suspect-card';
    card.setAttribute('onclick', `renderQuestioning('${ch.id}')`);
    const askedCount = ch.questions.filter(q => state.asked.has(`${ch.id}:${q.q}`)).length;
    const imgKey = imageKeyForCharacter(ch.id);
    const imgSrc = imageAssets[imgKey];
    const imgHtml = imgSrc ? `<img src="${imgSrc}" alt="${ch.name}" class="suspect-portrait" loading="lazy">` : '';
    card.innerHTML = `${imgHtml}<span class="tag">${ch.role}</span><h3>${ch.name}</h3><p>${ch.bio}</p><p><small>${ch.seat}</small></p><p><small>Asked: ${askedCount}/${ch.questions.length}</small></p>`;
    const btn = document.createElement('button');
    btn.className = 'small secondary question-suspect';
    btn.type = 'button';
    btn.dataset.characterId = ch.id;
    btn.setAttribute('onclick', `renderQuestioning('${ch.id}')`);
    btn.textContent = 'Question';
    card.appendChild(btn);
    wrap.appendChild(card);
  });
}

function renderStage() {
  if (state.phase === 'question') return;
  if (state.phase === 'inspect') return renderLocations();
  if (state.phase === 'accuse') return renderAccusation();
  if (state.phase === 'result') return;

  const scene = state.caseData.scenes[state.sceneIndex];
  setImage(scene.image, scene.title);
  $('#modeLabel').textContent = 'Scene';
  $('#stageTitle').textContent = scene.title;
  if (scene.clues) scene.clues.forEach(id => addClue(id, true));
  $('#stageBody').innerHTML = `<p>${scene.body}</p>${scene.clues ? `<div class="clue-strip"><strong>Noted:</strong> ${cluePills(scene.clues)}</div>` : ''}`;
  const actions = $('#stageActions');
  actions.innerHTML = '';

  if (state.sceneIndex < state.caseData.scenes.length - 1) {
    if (state.sceneIndex === 0) {
      const cinema = document.createElement('button');
      cinema.className = 'secondary';
      cinema.textContent = 'Play cinematic intro';
      cinema.addEventListener('click', showCinematicIntro);
      actions.appendChild(cinema);
    }
    const next = document.createElement('button');
    next.textContent = 'Continue';
    next.addEventListener('click', () => { state.sceneIndex++; renderAll(); });
    actions.appendChild(next);
  } else {
    const q = document.createElement('button');
    q.textContent = 'Question the suspects';
    q.addEventListener('click', () => renderQuestioning(state.caseData.characters[0].id));
    actions.appendChild(q);
    const inspect = document.createElement('button');
    inspect.className = 'secondary';
    inspect.textContent = 'Inspect locations';
    inspect.addEventListener('click', () => { state.phase = 'inspect'; renderAll(); });
    actions.appendChild(inspect);
    const accuse = document.createElement('button');
    accuse.className = 'secondary';
    accuse.textContent = 'Make accusation';
    accuse.addEventListener('click', () => { state.phase = 'accuse'; renderAll(); });
    actions.appendChild(accuse);
  }
}

function renderQuestioning(characterId) {
  state.phase = 'question';
  renderProgress();
  const ch = charById(characterId);
  setImage('table-placeholder', 'Guests around the Blackwood Manor dining table');
  $('#modeLabel').textContent = 'Questioning';
  $('#stageTitle').textContent = ch.name;
  $('#stageBody').innerHTML = `<p>${ch.bio}</p><p><strong>Seat:</strong> ${ch.seat}</p>`;
  const actions = $('#stageActions');
  actions.innerHTML = '';

  ch.questions.forEach(item => {
    const key = `${ch.id}:${item.q}`;
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = state.asked.has(key) ? `✓ ${item.q}` : item.q;
    btn.addEventListener('click', () => {
      if (state.asked.has(key)) return;
      state.asked.add(key);
      const isNew = item.clue ? addClue(item.clue) : false;
      saveState();
      const ans = document.createElement('div');
      ans.className = 'question-answer';
      ans.innerHTML = `<strong>${ch.name}:</strong> ${item.a}` + (item.clue ? `<p>${isNew ? 'New clue added' : 'Clue already noted'}: ${clueById(item.clue).title}</p>` : '');
      $('#stageBody').appendChild(ans);
      renderSuspects();
      btn.textContent = `✓ ${item.q}`;
      btn.disabled = true;
    });
    if (state.asked.has(key)) btn.disabled = true;
    actions.appendChild(btn);
  });

  const inspect = document.createElement('button');
  inspect.textContent = 'Inspect locations';
  inspect.addEventListener('click', () => { state.phase = 'inspect'; renderAll(); });
  actions.appendChild(inspect);

  const accuse = document.createElement('button');
  accuse.className = 'secondary';
  accuse.textContent = 'Make accusation';
  accuse.addEventListener('click', () => { state.phase = 'accuse'; renderAll(); });
  actions.appendChild(accuse);
}

function renderLocations() {
  setImage('medical-bag', 'Locked medical vial clue');
  $('#modeLabel').textContent = 'Inspection';
  $('#stageTitle').textContent = 'Search the manor';
  $('#stageBody').innerHTML = '<p>Choose a location to inspect. Some locations reveal decisive evidence.</p>';
  const actions = $('#stageActions');
  actions.innerHTML = '';
  state.caseData.locations.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = state.inspected.has(loc.id) ? `✓ ${loc.name}` : loc.name;
    btn.addEventListener('click', () => {
      state.inspected.add(loc.id);
      if (state.inspected.has(`${loc.id}:shown`)) return;
      const newFound = loc.clues.map(id => ({ id, isNew: addClue(id) }));
      state.inspected.add(`${loc.id}:shown`);
      saveState();
      if (loc.image) setImage(loc.image, loc.name);
      const box = document.createElement('div');
      box.className = 'question-answer';
      const found = newFound.length ? newFound.map(item => `${item.isNew ? 'New' : 'Known'}: ${clueById(item.id).title}`).join('<br>') : 'No new clue';
      box.innerHTML = `<strong>${loc.name}</strong><p>${loc.description}</p><p>${found}</p>`;
      $('#stageBody').appendChild(box);
      btn.textContent = `✓ ${loc.name}`;
      btn.disabled = true;
    });
    if (state.inspected.has(`${loc.id}:shown`)) btn.disabled = true;
    actions.appendChild(btn);
  });
  const q = document.createElement('button');
  q.className = 'secondary';
  q.textContent = 'Return to suspects';
  q.addEventListener('click', () => renderQuestioning(state.caseData.characters[0].id));
  actions.appendChild(q);
  const accuse = document.createElement('button');
  accuse.textContent = 'Make accusation';
  accuse.addEventListener('click', () => { state.phase = 'accuse'; renderAll(); });
  actions.appendChild(accuse);
}

function optionLabel(value) {
  const ch = charById(value);
  if (ch) return ch.name;
  const clue = clueById(value);
  if (clue) return clue.title;
  return value.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

function renderAccusation() {
  setImage('locked-medical-vial', 'Decisive medical vial evidence');
  $('#modeLabel').textContent = 'Final accusation';
  $('#stageTitle').textContent = 'Name the killer';
  $('#stageBody').innerHTML = `<p>Inspector Graves closes his notebook. The storm has not stopped. Choose carefully: killer, motive, method, and evidence.</p>`;
  const actions = $('#stageActions');
  actions.innerHTML = '';
  const readyHint = document.createElement('div');
  readyHint.className = 'question-answer';
  readyHint.innerHTML = `<strong>${clueProgressText()}.</strong><p>You can review the notebook before revealing your accusation. Best test path: find the medical vial and midnight meeting note before accusing.</p>`;
  actions.appendChild(readyHint);
  const form = document.createElement('div');
  form.className = 'accuse-grid';
  for (const [key, opts] of Object.entries(state.caseData.accusationOptions)) {
    const label = document.createElement('label');
    label.textContent = key.toUpperCase();
    const select = document.createElement('select');
    select.id = `accuse-${key}`;
    opts.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = optionLabel(o);
      select.appendChild(opt);
    });
    label.appendChild(select);
    form.appendChild(label);
  }
  actions.appendChild(form);
  const submit = document.createElement('button');
  submit.textContent = 'Reveal solution';
  submit.addEventListener('click', scoreAccusation);
  actions.appendChild(submit);
  const notebook = document.createElement('button');
  notebook.className = 'secondary';
  notebook.textContent = 'Review notebook first';
  notebook.addEventListener('click', showNotebook);
  actions.appendChild(notebook);
}

function scoreAccusation() {
  const sol = state.caseData.solution;
  const picks = {
    killer: $('#accuse-killer').value,
    motive: $('#accuse-motive').value,
    method: $('#accuse-method').value,
    evidence: $('#accuse-evidence').value
  };
  const checks = Object.keys(sol).map(k => picks[k] === sol[k]);
  const score = checks.filter(Boolean).length;
  state.phase = 'result';
  renderProgress();
  setImage(score === 4 ? 'manor-placeholder' : 'table-placeholder', 'Blackwood Manor reveal');
  $('#modeLabel').textContent = 'Reveal';
  $('#stageTitle').textContent = score === 4 ? 'Case solved' : 'The truth emerges';
  $('#stageBody').innerHTML = `
    <p class="${score === 4 ? 'result-pass' : 'result-fail'}"><strong>Score: ${score}/4</strong></p>
    <p>The killer was <strong>Dr. Elise Ward</strong>. Edmund had discovered her illegal clinic trials and intended to expose her at midnight. She used his trusted digestive tonic, then switched the bottle during the blackout.</p>
    <p>The fair trail: Thomas saw the bottle switch, Evelyn noticed Ward's bag clasp, the study note proves blackmail, and the locked vial links Ward's medical bag to the tonic glass.</p>
  `;
  const actions = $('#stageActions');
  actions.innerHTML = '';
  const again = document.createElement('button');
  again.textContent = 'Play again';
  again.addEventListener('click', restart);
  actions.appendChild(again);
}

function showNotebook() {
  const body = $('#notebookBody');
  const clues = [...state.clues].map(clueById).filter(Boolean);
  const remaining = state.caseData.clues.length - clues.length;
  const cards = clues.map(c => {
    const src = imageAssets[c.image];
    const img = src ? `<img src="${src}" alt="${c.title}" class="clue-image" loading="lazy">` : '';
    return `<article class="clue-card">${img}<h3>${c.title}</h3><p>${c.text}</p></article>`;
  }).join('');
  body.innerHTML = `<p><strong>${clueProgressText()}</strong>${remaining ? ` — ${remaining} still hidden.` : ' — all clues found.'}</p>` + (clues.length ? `<div class="clue-grid">${cards}</div>` : '<p>No clues collected yet.</p>');
  $('#notebookDialog').showModal();
}

function showCinematicIntro() {
  const body = $('#notebookBody');
  body.innerHTML = `<video class="cinematic-video" controls autoplay src="assets/video/blackwood-intro.mp4"></video><p><strong>Prototype cinematic:</strong> ComfyUI images + generated dialogue track.</p>`;
  $('#notebookDialog').showModal();
}

init().catch(err => {
  $('#stageTitle').textContent = 'Failed to load case';
  $('#stageBody').textContent = String(err);
});
