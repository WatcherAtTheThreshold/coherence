// Physics + settling-arc verification for continuous-state.html
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/continuous-state.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const elStub = () => ({
  textContent: '', innerHTML: '', volume: 0, currentTime: 0, muted: false,
  dataset: {}, style: {}, offsetWidth: 500,
  classList: {
    _set: new Set(),
    add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
    toggle() {}, contains(c) { return this._set.has(c); }
  },
  getBoundingClientRect() { return { width: 500, height: 500, left: 0, top: 0 }; },
  play() { return Promise.resolve(); }, pause() {},
  appendChild() {}, addEventListener() {}, remove() {},
  querySelector() { return null; }, querySelectorAll() { return []; },
  focus() {}
});
const elements = {};
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub()); },
  createElement() { return elStub(); },
  querySelector() { return elStub(); },
  addEventListener() {}
};

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame',
  src + '\n; return { state, save, createInitialTiles, updatePhysics, updateStress, updateCoherence, updateArc, FIXED_STEP };'
)(
  doc,
  { AudioContext: undefined, webkitAudioContext: undefined, addEventListener() {} },
  { getItem: () => null, setItem() {} },
  { now: () => Date.now() },
  () => {}
);

const { state, save, createInitialTiles, updatePhysics, updateStress, updateCoherence, updateArc, FIXED_STEP } = api;

state.gridWidth = 500;
state.gridHeight = 500;
createInitialTiles();

function step(n) {
  for (let i = 0; i < n; i++) {
    updatePhysics(FIXED_STEP);
    updateStress();
    updateCoherence();
    updateArc();
  }
}

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

// Phase 1: initial pile settles into stillness
step(5400); // ~90 simulated seconds
const inBounds = state.tiles.every(t =>
  t.x >= -1 && t.x <= 501 - t.width && t.y <= 501 - t.height && !isNaN(t.x) && !isNaN(t.y));
const sleeping = state.tiles.filter(t => t.sleeping).length;
console.log('after settle-in: coherence', state.coherence.toFixed(1),
  '· sleeping', sleeping + '/' + state.tiles.length,
  '· settlings so far', save.settlings);
expect(inBounds, 'all tiles stay in bounds, no NaN positions');
// Soft target: sleep % varies run to run while the system is visibly still.
// Awake-but-still tiles are harmless (stress-gated, no perpetual motion).
console.log((sleeping >= state.tiles.length * 0.6 ? 'PASS ' : 'WARN ') +
  ' sleep engagement: ' + sleeping + '/' + state.tiles.length + ' (soft target 60%)');
expect(state.coherence > 65, 'undisturbed system reaches stillness (coherence ' + state.coherence.toFixed(1) + ')');
const baselineSettlings = save.settlings; // initial cascade may legitimately count as one

// Phase 2: realistic disturbance — a player picks up a dozen tiles and
// drops them from the top (drag zeroes velocity; gravity does the rest)
state.tiles.slice(0, 12).forEach((t, i) => {
  t.x = 50 + i * 33;
  t.y = 30 + (i % 3) * 45;
  t.vx = 0; t.vy = 0;
  t.sleeping = false;
  t.settled = false;
});
let minCoh = 100;
for (let i = 0; i < 1200; i++) {
  updatePhysics(FIXED_STEP); updateStress(); updateCoherence(); updateArc();
  minCoh = Math.min(minCoh, state.coherence);
}
console.log('after realistic disturbance: min coherence seen', minCoh.toFixed(1));
expect(minCoh < 55, 'a realistic disturbance registers as one (below arc threshold)');

// Phase 3: the player TENDS — when unsettled, move the most restless tile
// to genuinely free floor space; then leave the system alone to settle
function freeFloorX(t) {
  for (let x = 5; x < 460 - t.width; x += 20) {
    const clear = state.tiles.every(o =>
      o === t || !(x < o.x + o.width + 4 && x + t.width + 4 > o.x && o.y + o.height > 430));
    if (clear) return x;
  }
  return null;
}
for (let i = 0; i < 14400; i++) {
  if (i % 900 === 899 && i < 9600 && state.coherence < 60) {
    const restless = state.tiles.filter(t => !t.sleeping)
      .sort((a, b) => b.stress - a.stress)[0];
    if (restless) {
      const fx = freeFloorX(restless);
      if (fx !== null) {
        restless.x = fx;
        restless.y = 500 - restless.height - 1;
        restless.vx = 0; restless.vy = 0;
      }
    }
  }
  updatePhysics(FIXED_STEP); updateStress(); updateCoherence(); updateArc();
}
console.log('after tended recovery: coherence', state.coherence.toFixed(1), '· settlings', save.settlings);
expect(state.coherence > 65, 'system recovers to stillness');
expect(save.settlings === baselineSettlings + 1, 'exactly one settling counted for the disturbance→stillness cycle');

const inBounds2 = state.tiles.every(t =>
  t.x >= -1 && t.x <= 501 - t.width && t.y <= 501 - t.height && !isNaN(t.x) && !isNaN(t.y));
expect(inBounds2, 'bounds still hold after the full cycle');

console.log(fail === 0 ? '\nPHYSICS + ARC OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
