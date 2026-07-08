// Logic verification for daily-routine.html
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/daily-routine.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// Advancing clock so the 120ms move cooldown never blocks the sim
let clock = 0;
Date.now = () => (clock += 200);

const stubCtx = new Proxy({}, {
  get: (t, k) => (typeof t[k] !== 'undefined' ? t[k] : () => stubCtx),
  set: () => true
});
const elements = {};
const elStub = (id) => ({
  id, textContent: '', innerHTML: '', volume: 0, muted: false, title: '',
  style: new Proxy({}, { get: () => '', set: () => true }),
  dataset: {},
  classList: {
    _set: new Set(),
    add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
    contains(c) { return this._set.has(c); }
  },
  play() { return Promise.resolve(); }, pause() {},
  addEventListener() {}, appendChild() {}, remove() {},
  getContext() { return stubCtx; },
  getBoundingClientRect() { return { left: 0, top: 0, width: 1600, height: 900 }; },
  onclick: null, width: 0, height: 0
});
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  createElement() { return elStub('anon'); },
  addEventListener() {}
};
const store = {};

function deepStub() {
  const f = function () {};
  return new Proxy(f, {
    get: (t, k) => (k === Symbol.toPrimitive ? () => 0 : deepStub()),
    apply: () => deepStub(),
    construct: () => deepStub(),
    set: () => true
  });
}

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout',
  src + '\n; return { game, save, init, gameLoop, movePlayer, checkNearStation, interact, scorePulseWeaver, mixParts, scoreChroma, completeProject, STATIONS, view: () => ({ W, H, TILE_SIZE, originX, originY, dust }) };'
)(
  doc,
  { innerWidth: 1600, innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: deepStub(), webkitAudioContext: undefined, speechSynthesis: undefined },
  { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  { now: () => clock },
  () => {},
  (fn) => { fn(); return 0; }
);

const { game, save, gameLoop, movePlayer, interact, scorePulseWeaver, mixParts, scoreChroma, completeProject, view } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

// init() already ran at script bottom. View sanity:
const v = view();
expect(v.W === 1600 && v.TILE_SIZE > 20, 'studio scales up to the window (tile ' + v.TILE_SIZE + 'px, was fixed 20)');
expect(v.originX > 0 && v.dust.length >= 8, 'room floats centered with dust in the air');

// gameLoop with no timestamp: no NaN poisoning (the wizard-masters lesson)
gameLoop();
gameLoop(16.7);
expect(v.dust.every(d => isFinite(d.x) && isFinite(d.y)), 'no-timestamp gameLoop keeps dust finite');

// Movement: floor is not walkable, rug is
const startX = game.player.x, startY = game.player.y;
movePlayer(0, -1); movePlayer(0, -1); movePlayer(0, -1); movePlayer(0, -1);
expect(game.player.y === 6, 'player walks up the rug and stops at its edge (y=' + game.player.y + ')');

// Walk to the Workstation and interact
game.player.x = 13; game.player.y = 14; // on the digital platform
api.checkNearStation();
expect(game.nearStation === 'digital', 'standing at the Workstation registers proximity');
interact();
expect(elements['minigame-overlay'].classList.contains('active'), 'interact opens the project selector');

// --- Pulse Weaver scoring ---
const empty = new Array(12).fill(0);
expect(scorePulseWeaver(empty) === 0, 'empty wheel scores 0');
const even = empty.slice(); [0, 3, 6, 9].forEach(i => even[i] = 1);
const clumped = empty.slice(); [0, 1, 2, 3].forEach(i => clumped[i] = 1);
expect(scorePulseWeaver(even) > scorePulseWeaver(clumped), 'even rhythm beats clumped (' +
  scorePulseWeaver(even) + ' vs ' + scorePulseWeaver(clumped) + ')');
const twoKinds = even.slice(); twoKinds[3] = 2; twoKinds[9] = 2;
expect(scorePulseWeaver(twoKinds) > scorePulseWeaver(even), 'layering two tone kinds scores higher');
const full = new Array(12).fill(1).map((x, i) => (i % 2 ? 2 : 1));
expect(scorePulseWeaver(full) === 100, 'a full layered wheel caps at 100');

// --- Chroma mixing ---
const orange = mixParts(['red', 'yellow']);
expect(orange[0] > 150 && orange[2] < 80, 'red + yellow makes an orange (' + orange.join(',') + ')');
const green = mixParts(['yellow', 'blue']);
expect(green[1] >= green[0] && green[1] > green[2], 'yellow + blue leans green (' + green.join(',') + ')');
expect(scoreChroma(orange, orange) === 100, 'matching the target exactly scores 100');
expect(scoreChroma(mixParts(['blue']), orange) < 60, 'a wrong color scores low');

// --- Persistence ---
const before = save.lifetime;
completeProject(80);
expect(save.lifetime === before + 1 && game.projectsCompleted === 1, 'completing a project counts today and lifetime');
expect(JSON.parse(store['daily-routine-save']).lifetime === before + 1, 'lifetime persists to storage');

console.log(fail === 0 ? '\nDAILY ROUTINE OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
