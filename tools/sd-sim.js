// Logic verification for soft-drift.html — orders, streaks, day cycle, view math
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/soft-drift.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const stubCtx = new Proxy({}, {
  get: (t, k) => {
    if (k === 'canvas') return undefined;
    return typeof t[k] !== 'undefined' ? t[k] : () => stubCtx;
  },
  set: () => true
});
const elStub = (id) => ({
  id, textContent: '', volume: 0, muted: false,
  classList: { add() {}, remove() {}, contains() { return false; } },
  play() { return Promise.resolve(); }, pause() {},
  addEventListener() {},
  getContext() { return stubCtx; },
  getBoundingClientRect() { return { left: 0, top: 0, width: 1600, height: 900 }; },
  width: 600, height: 500
});
const elements = {};
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  addEventListener() {}
};
const store = {};
const fakeLS = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; }
};

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout', 'setInterval',
  src + '\n; return { game, save, update, spawnCustomer, createCharacter, createShelfCubes, spawnAnimals, endDrag, getCanvasPos, resize, worldLeft, worldRight, viewInfo: () => ({ W, H, viewScale, viewX, viewY }) };'
)(
  doc,
  { innerWidth: 1600, innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined },
  fakeLS,
  { now: () => 0 },
  () => {},          // rAF: we drive update() manually
  () => 0,           // setTimeout: recorded nowhere — spawn chain driven manually
  () => 0            // setInterval
);

const { game, save, update, spawnCustomer, createCharacter, createShelfCubes, endDrag, getCanvasPos, worldLeft, worldRight, viewInfo } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

// --- View math on a wide screen ---
const v = viewInfo();
expect(v.W === 1600 && v.viewScale > 1, 'view scales up on a large window (scale ' + v.viewScale.toFixed(2) + ')');
expect(worldLeft() < -50 && worldRight() > 650, 'wide screen exposes world beyond the 600px stage (' +
  Math.round(worldLeft()) + '..' + Math.round(worldRight()) + ')');
const probe = getCanvasPos({ clientX: v.viewX + 300 * v.viewScale, clientY: v.viewY + 250 * v.viewScale });
expect(Math.abs(probe.x - 300) < 0.01 && Math.abs(probe.y - 250) < 0.01, 'screen→world input mapping is exact');

// --- Customer lifecycle ---
game.player = createCharacter(true);
createShelfCubes();
game.running = true;
spawnCustomer();
expect(game.customers.length === 1, 'customer spawns with the shelf stocked');
const c = game.customers[0];
expect(c.order.length >= 1, 'customer has an order');
expect(Math.abs(c.x) > 700 || c.x > 900, 'customer enters from beyond the visible edge');

// Walk them in + wait: satisfaction decays at the tuned thresholds
for (let i = 0; i < 6 * 60; i++) update(16.67); // ~6s
expect(c.satisfactionLevel === 2, 'after ~6s wait: 2 hearts (was ' + c.satisfactionLevel + ')');
for (let i = 0; i < 7 * 60; i++) update(16.67); // ~13s total
expect(c.satisfactionLevel === 1, 'after ~13s wait: 1 heart');

// Deliver their full order via simulated drags
let delivered = 0;
while (c.order.length > 0 && delivered < 5) {
  const color = c.order[0];
  let cube = game.cubes.find(k => k.color === color && k.onShelf);
  if (!cube) { // recolor one (sim shortcut for shelf randomness)
    cube = game.cubes.find(k => k.onShelf);
    cube.color = color;
  }
  game.dragging = cube;
  cube.onShelf = false;
  cube.x = c.x - cube.size / 2;
  cube.y = c.y - 40;
  endDrag();
  delivered++;
}
expect(c.order.length === 0 && c.satisfied && c.leaving, 'full order delivered → satisfied and leaving');
expect(game.streak === 1 && game.servedToday === 1 && save.totalServed === 1, 'streak/served tallies update');
expect(save.bestStreak === 1 && JSON.parse(store['soft-drift-save']).totalServed === 1, 'save persists to storage');

// They walk out to the actual screen edge and despawn
for (let i = 0; i < 3000 && game.customers.length > 0; i++) update(16.67);
expect(game.customers.length === 0, 'satisfied customer walks off-screen and despawns');

// --- Abandonment resets the streak ---
spawnCustomer();
const c2 = game.customers[0];
for (let i = 0; i < 21 * 60 && !c2.leaving; i++) update(16.67); // >20s
expect(c2.leaving && !c2.satisfied, 'ignored customer gives up after ~20s');
expect(game.streak === 0, 'abandonment resets the streak');

// --- Day rollover (pause-safe clock) ---
const dayBefore = game.day;
game.dayElapsed = game.dayDuration; // simulate the day running out
update(16.67);
expect(game.transitioning, 'day end starts the night transition');
for (let i = 0; i < 300 && game.day === dayBefore; i++) update(16.67);
expect(game.day === dayBefore + 1 && save.daysTended === 1, 'new day counted and persisted');
expect(game.servedToday === 0 && game.dayElapsed === 0, 'daily tallies reset');

console.log(fail === 0 ? '\nSOFT DRIFT LOGIC OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
