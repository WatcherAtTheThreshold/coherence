// Verification for coherence-3d.html — rules parity, level gen, raycast sanity
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/coherence-3d.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

function makeCtx() {
  const base = {
    createImageData(w, h) { return { data: new Uint8ClampedArray(w * h * 4) }; },
    createRadialGradient() { return { addColorStop() {} }; },
    createLinearGradient() { return { addColorStop() {} }; },
    putImageData() {}, drawImage() {}, fillRect() {}, clearRect() {},
    beginPath() {}, moveTo() {}, lineTo() {}, arc() {}, closePath() {},
    stroke() {}, fill() {}
  };
  return new Proxy(base, {
    get: (t, k) => (k in t ? t[k] : () => {}),
    set: () => true
  });
}
const elements = {};
const elStub = (id) => ({
  id, textContent: '', innerHTML: '', volume: 0, muted: false, currentTime: 0,
  style: new Proxy({}, { get: () => '', set: () => true }),
  className: '',
  classList: {
    _set: new Set(),
    add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
    contains(c) { return this._set.has(c); }
  },
  play() { return Promise.resolve(); }, pause() {},
  addEventListener() {}, focus() {},
  querySelectorAll() { return []; },
  getContext() { return makeCtx(); },
  width: 0, height: 0
});
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  createElement() { return elStub('anon'); },
  addEventListener() {},
  activeElement: null
};
const store = {};

const api = new Function('document', 'window', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout', 'clearTimeout',
  src + '\n; return { gameState, save, GRID, artifacts, ENDINGS, generateLevel, stepPlayer, turnPlayer, processTurn, acceptArtifact, declineArtifact, tradeArtifact, winGame, closeMessage, resetGame, startGame, render, loop, tileAt, snapCamera, zbufRef: () => zbuf, camRef: () => cam };'
)(
  doc,
  { innerWidth: 1280, innerHeight: 800, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined },
  { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  { now: () => 0 },
  () => {},
  (fn) => { fn(); return 0; }, // modals resolve instantly
  () => {}
);

const { gameState, save, GRID, generateLevel, stepPlayer, winGame, closeMessage, resetGame, startGame, render, loop, tileAt, snapCamera } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

// --- Level generation: structure + connectivity ---
let wallCount = 0, connected = 0, artifactSplit = 0;
for (let i = 0; i < 30; i++) {
  const g = generateLevel();
  let interiorWalls = 0, above = 0, below = 0, exits = 0, thresholds = 0;
  for (let y = 1; y < GRID - 1; y++) {
    for (let x = 1; x < GRID - 1; x++) {
      if (g[y][x] === '#') interiorWalls++;
      if (g[y][x] === '*') (y < 8 ? above++ : below++);
      if (g[y][x] === 'X') exits++;
      if (g[y][x] === '+') thresholds++;
    }
  }
  if (interiorWalls > 3) wallCount++;
  if (above === 1 && below === 3) artifactSplit++;
  if (exits === 1 && thresholds > 8) connected++; // structural sanity
  // flood fill check
  const reach = new Set(['1,1']);
  const q = [[1, 1]];
  while (q.length) {
    const [cx, cy] = q.pop();
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = cx + dx, ny = cy + dy, k = nx + ',' + ny;
      if (nx < 1 || ny < 1 || nx >= GRID - 1 || ny >= GRID - 1) continue;
      if (g[ny][nx] === '#' || reach.has(k)) continue;
      reach.add(k); q.push([nx, ny]);
    }
  }
  let allOk = true;
  for (let y = 1; y < GRID - 1; y++) for (let x = 1; x < GRID - 1; x++) {
    if (g[y][x] !== '#' && !reach.has(x + ',' + y)) allOk = false;
  }
  if (!allOk) { connected = -999; break; }
}
expect(connected > 0, 'every generated level is fully connected (30/30 flood fills)');
expect(wallCount >= 25, 'interior walls appear (corridors for first person): ' + wallCount + '/30');
expect(artifactSplit >= 28, 'artifact split holds: 1 above threshold, 3 below (' + artifactSplit + '/30)');

// --- Boot + raycast sanity ---
startGame();
expect(gameState.started && save.runs === 1, 'boot starts a run and counts it');
render(0);
const zbuf = api.zbufRef();
let zOk = true;
for (let i = 0; i < zbuf.length; i++) if (!isFinite(zbuf[i]) || zbuf[i] <= 0) zOk = false;
expect(zOk && zbuf.length === 320, 'raycaster fills a finite positive z-buffer across all 320 columns');
loop(); loop(16.7); // NaN guard path
const cam = api.camRef();
expect(isFinite(cam.x) && isFinite(cam.y) && isFinite(cam.ang), 'no-timestamp loop keeps the camera finite');

// --- Rules parity spot checks ---
// step cost
const cohBefore = gameState.coherence;
// find an open neighbor and face it
const dirsXY = [[0,-1],[1,0],[0,1],[-1,0]];
for (let d = 0; d < 4; d++) {
  const nx = gameState.playerPos.x + dirsXY[d][0], ny = gameState.playerPos.y + dirsXY[d][1];
  if (tileAt(nx, ny) === '.') { gameState.dir = d; break; }
}
stepPlayer(1);
expect(gameState.coherence === cohBefore - 1, 'a step costs exactly 1 coherence');

// wall bump costs nothing
const pos = { ...gameState.playerPos };
for (let d = 0; d < 4; d++) {
  if (tileAt(pos.x + dirsXY[d][0], pos.y + dirsXY[d][1]) === '#') { gameState.dir = d; break; }
}
const cohAtWall = gameState.coherence;
stepPlayer(1);
expect(gameState.playerPos.x === pos.x && gameState.playerPos.y === pos.y && gameState.coherence === cohAtWall,
  'bumping a wall moves nothing and costs nothing');

// --- BFS bot plays full games (economics should echo the 2D original) ---
function bfsPath(grid, from, to) {
  const key = (x, y) => x + ',' + y;
  const prev = new Map();
  const q = [[from.x, from.y]];
  prev.set(key(from.x, from.y), null);
  while (q.length) {
    const [cx, cy] = q.shift();
    if (cx === to.x && cy === to.y) break;
    for (const [dx, dy] of dirsXY) {
      const nx = cx + dx, ny = cy + dy;
      if (tileAt(nx, ny) === '#' || prev.has(key(nx, ny))) continue;
      prev.set(key(nx, ny), [cx, cy]);
      q.push([nx, ny]);
    }
  }
  if (!prev.has(key(to.x, to.y))) return null;
  const path = [];
  let cur = [to.x, to.y];
  while (cur) {
    path.unshift(cur);
    cur = prev.get(key(cur[0], cur[1]));
  }
  return path;
}

function nearestTile(ch, opts) {
  let best = null, bestD = 1e9;
  for (let y = 1; y < GRID - 1; y++) for (let x = 1; x < GRID - 1; x++) {
    if (gameState.grid[y][x] !== ch) continue;
    if (opts && opts.above && y >= gameState.thresholdRow) continue;
    const d = Math.abs(x - gameState.playerPos.x) + Math.abs(y - gameState.playerPos.y);
    if (d < bestD) { bestD = d; best = { x, y }; }
  }
  return best;
}

function playGame(artifactTarget) {
  resetGame();
  let steps = 0;
  while (!gameState.gameOver && steps < 900) {
    steps++;
    if (doc.getElementById('modal').classList.contains('active')) {
      const title = doc.getElementById('modal-title').textContent;
      if (title.indexOf('ARTIFACT:') === 0) {
        if (!gameState.carriedArtifact) api.acceptArtifact(0);
        else if (gameState.artifactsCollected < artifactTarget) api.tradeArtifact(0);
        else api.declineArtifact();
      } else if (title === 'THE WAY OUT') {
        if (gameState.artifactsCollected >= artifactTarget) winGame();
        else closeMessage();
      } else if (title === 'EXIT LOCKED') {
        closeMessage();
      } else {
        closeMessage();
      }
      continue;
    }
    const wantArtifact = gameState.artifactsCollected < artifactTarget;
    let target = null;
    if (wantArtifact) {
      target = (artifactTarget === 1 && nearestTile('*', { above: true })) || nearestTile('*');
    }
    if (!target) target = nearestTile('X');
    if (!target) break;
    const path = bfsPath(gameState.grid, gameState.playerPos, target);
    if (!path || path.length < 2) break;
    const [nx, ny] = path[1];
    const dx = nx - gameState.playerPos.x, dy = ny - gameState.playerPos.y;
    gameState.dir = dirsXY.findIndex(d => d[0] === dx && d[1] === dy);
    stepPlayer(1);
  }
  return { won: gameState.won, over: gameState.gameOver, collected: gameState.artifactsCollected, steps };
}

const RUNS = 50;
function trial(name, target) {
  let wins = 0, stuck = 0;
  for (let i = 0; i < RUNS; i++) {
    const r = playGame(target);
    if (!r.over) stuck++;
    if (r.won) wins++;
  }
  console.log(name.padEnd(24), 'won ' + wins + '/' + RUNS, stuck ? ' STUCK:' + stuck : '');
  return { wins, stuck };
}

const safe = trial('safe (1 artifact)', 1);
const greedy = trial('greedy (all 4)', 4);
expect(safe.stuck === 0 && greedy.stuck === 0, 'no bot ever hangs (games always end)');
expect(safe.wins >= RUNS * 0.6, 'safe play usually escapes — economics carried over');
expect(greedy.wins < safe.wins, 'greed is riskier than safety, same as the 2D original');
expect(greedy.wins > 0, 'full clear is possible');

// --- Ending + persistence ---
let winRun;
do { winRun = playGame(1); } while (!winRun.won);
expect(elements['modal-text'].innerHTML.includes('ARTIFACTS RECOVERED'), 'ending modal reports the tally');
expect(save.transmissions > 0 && JSON.parse(store['coherence-3d-save']).transmissions > 0,
  'transmissions persist to storage (' + save.transmissions + ')');

console.log(fail === 0 ? '\nCOHERENCE 3D OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
