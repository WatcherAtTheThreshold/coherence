// Logic verification for journey.html — deck phases, story flow, persistence
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/journey.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const stubCtx = new Proxy({}, {
  get: (t, k) => (typeof t[k] !== 'undefined' ? t[k] : () => stubCtx),
  set: () => true
});
const elements = {};
const made = [];
const elStub = (id) => {
  const el = {
    id, textContent: '', innerHTML: '', volume: 0, muted: false,
    dataset: {}, style: { setProperty() {} },
    classList: {
      _set: new Set(),
      add(...c) { c.forEach(x => this._set.add(x)); },
      remove(...c) { c.forEach(x => this._set.delete(x)); },
      contains(c) { return this._set.has(c); }
    },
    play() { return Promise.resolve(); }, pause() {},
    addEventListener(type, fn) { el._handlers = el._handlers || {}; el._handlers[type] = fn; },
    appendChild(child) { (el._children = el._children || []).push(child); },
    querySelector() { return null; },
    getContext() { return stubCtx; },
    scrollTop: 0, scrollHeight: 0, width: 0, height: 0
  };
  made.push(el);
  return el;
};
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  createElement() { return elStub('anon'); },
  querySelector(sel) { return elements[sel] || (elements[sel] = elStub(sel)); },
  querySelectorAll() { return []; },
  addEventListener() {}
};
const store = {};
function deepStub() {
  const f = function () {};
  return new Proxy(f, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : deepStub()),
    apply: () => deepStub(), construct: () => deepStub(), set: () => true
  });
}

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout', 'setInterval', 'clearInterval',
  src + '\n; return { game, save, CARDS, init, drawCards, selectCard, getStoryPhase, getAvailableRoles, endGame, newStory, setMuted, toggleTTS };'
)(
  doc,
  { innerWidth: 1600, innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: deepStub(), webkitAudioContext: undefined, speechSynthesis: undefined, SpeechSynthesisUtterance: deepStub() },
  { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  { now: () => 0 },
  () => {},           // rAF no-op (woods loop runs once)
  (fn) => 0,          // setTimeout: DO NOT auto-run — journey chains timeouts heavily
  () => 0, () => {}
);

const { game, save, CARDS, drawCards, selectCard, getStoryPhase, getAvailableRoles, endGame, toggleTTS } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

// --- Deck integrity ---
expect(CARDS.length === 42, 'deck holds 42 cards');
expect(CARDS.every(c => c.tone && c.theme && c.weight && c.beat),
  'every card carries tone/theme/weight/beat — the day-deck hooks exist');

// --- Phase gating ---
expect(getStoryPhase() === 'opening' && JSON.stringify(getAvailableRoles()) === JSON.stringify(['tone', 'place']),
  'opening deals only atmosphere (tone/place)');

// --- Play a full story: opening → middle → complication → closing ---
let phases = new Set();
let guard = 0;
while (game.story.length < 12 && guard++ < 40) {
  drawCards();
  if (game.currentCards.length < 3) break;
  phases.add(getStoryPhase());
  // pick a problem card if offered during complication, else first card
  let pick = 0;
  const problemIdx = game.currentCards.findIndex(c => c.role === 'problem');
  if (getStoryPhase() === 'complication' && problemIdx >= 0) pick = problemIdx;
  selectCard(pick);
}
expect(game.story.length === 12, 'a walk gathers 12 cards (' + game.story.length + ')');
expect(phases.has('opening') && phases.has('middle') && phases.has('complication') && phases.has('closing'),
  'the walk passes through all four phases');
expect(game.story.slice(0, 1).every(c => ['tone', 'place'].includes(c.role)),
  'the walk opens with atmosphere');
const usedIds = game.story.map(c => c.id);
expect(new Set(usedIds).size === 12, 'no card repeats within one walk');

// coherence tracker saw the story
const trackedTones = Object.values(game.coherence.tones).reduce((a, b) => a + b, 0);
expect(trackedTones === 12, 'the internal coherence tracker witnessed every card');

// --- Completion persists ---
endGame();
expect(save.walks === 1 && save.cards === 12, 'the walk is remembered (' + save.walks + ' walk, ' + save.cards + ' cards)');
expect(JSON.parse(store['journey-save']).walks === 1, 'memory persists to storage');

// --- Voice + mute persistence ---
toggleTTS();
expect(JSON.parse(store['journey-save']).voice === false, 'voice toggle persists');
api.setMuted(true);
expect(JSON.parse(store['journey-save']).muted === true, 'mute persists');

console.log(fail === 0 ? '\nJOURNEY OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
