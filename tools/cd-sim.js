// Logic verification for cold-drift.html — shoveling, storm arc, persistence
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/cold-drift.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const stubCtx = new Proxy({}, {
  get: (t, k) => (typeof t[k] !== 'undefined' ? t[k] : () => stubCtx),
  set: () => true
});
const elements = {};
const elStub = (id) => ({
  id, textContent: '', innerHTML: '', volume: 0, muted: false,
  style: new Proxy({}, { get: () => '', set: () => true }),
  classList: {
    _set: new Set(),
    add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
    contains(c) { return this._set.has(c); }
  },
  play() { return Promise.resolve(); }, pause() {},
  addEventListener() {}, appendChild() {},
  getContext() { return stubCtx; },
  width: 0, height: 0
});
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  createElement() { return elStub('anon'); },
  addEventListener() {},
  body: elStub('body')
};
const store = {};

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout',
  src + '\n; return { game, save, STAMINA, initGame, update, movePlayer, shovelSnow, checkEntities, updateStorm, newStorm, generateMap, gameLoop, view: () => ({ W, H, TILE_SIZE, originX, originY }) };'
)(
  doc,
  { innerWidth: 1600, innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined },
  { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  { now: () => simNow }, // controllable clock for the move cooldown
  () => {},
  (fn) => { fn(); return 0; }
);

let simNow = 0;
const { game, save, STAMINA, initGame, update, movePlayer, updateStorm, gameLoop, view } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

initGame();
const v = view();
expect(v.W === 1600 && v.TILE_SIZE > 20, 'yard scales up to the window (tile ' + v.TILE_SIZE + 'px, was fixed 20)');

// NaN guard on the loop (render included)
gameLoop();
gameLoop(16.7);
expect(isFinite(game.snowTimer) && isFinite(game.stamina), 'no-timestamp gameLoop keeps state finite');

// --- Shoveling: one step drains stamina by depth, snow gets pushed ---
const px = game.player.x, py = game.player.y;
// find a direction with snow
let dir = null;
for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const nx = px + dx, ny = py + dy;
  if (game.grid[ny] && game.grid[ny][nx] !== 0 && game.snow[ny][nx] > 0) { dir = [dx, dy]; break; }
}
expect(dir !== null, 'fresh yard has snow adjacent to the player');
const staminaBefore = game.stamina;
const clearedBefore = game.clearedCount;
simNow += 1000;
movePlayer(dir[0], dir[1]);
expect(game.clearedCount === clearedBefore + 1 && game.stamina < staminaBefore,
  'one step shovels one tile and costs stamina (' + staminaBefore.toFixed(0) + ' → ' + game.stamina.toFixed(0) + ')');
expect(save.cleared === 1, 'lifetime shovelfuls tally in the save');

// --- Stamina recharge while resting (dt-based) ---
const tired = game.stamina;
game.restTimer = 40; game.isMoving = false;
for (let i = 0; i < 60; i++) update(1);
expect(game.stamina > tired, 'resting recharges stamina');

// --- Storm arc: rescue everyone → break → new storm ---
game.snowInterval = 100;
for (let i = 0; i < 40; i++) update(1); // let the storm build a little
const intervalDuring = game.snowInterval;
game.animals.forEach(a => { a.revealed = true; }); // all neighbors safe
update(1);
expect(game.stormBreak === true, 'rescuing every neighbor breaks the storm');
expect(save.storms === 1, 'the storm is counted and persisted (' +
  JSON.parse(store['cold-drift-save']).storms + ' in storage)');
const snowBefore = JSON.stringify(game.snow);
for (let i = 0; i < 300; i++) update(1); // calm period, no snowfall
expect(JSON.stringify(game.snow) === snowBefore, 'no snow falls while the storm rests');
for (let i = 0; i < 400; i++) update(1); // calm expires → new storm
expect(game.stormBreak === false && game.animals.some(a => !a.revealed),
  'a fresh storm rolls in with new buried neighbors');
expect(game.snowInterval === 150, 'storm intensity resets for the new storm');

// --- Rescue persistence path ---
const rescuedBefore = save.rescued;
const target = game.animals.find(a => !a.revealed);
game.snow[target.y][target.x] = 0;
api.checkEntities(target.x, target.y);
expect(save.rescued === rescuedBefore + 1, 'a rescue persists to the lifetime tally');

console.log(fail === 0 ? '\nCOLD DRIFT OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
