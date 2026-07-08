// Tactics verification for wizard-masters.html
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/wizard-masters.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const stubCtx = new Proxy({}, {
  get: (t, k) => (typeof t[k] !== 'undefined' ? t[k] : () => stubCtx),
  set: () => true
});
const elements = {};
const elStub = (id) => ({
  id, textContent: '', className: '', volume: 0, muted: false,
  classList: { add() {}, remove() {}, contains() { return false; } },
  play() { return Promise.resolve(); }, pause() {},
  addEventListener() {},
  getContext() { return stubCtx; },
  getBoundingClientRect() { return { left: 0, top: 0, width: 1600, height: 900 }; },
  width: 600, height: 600
});
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub(id)); },
  addEventListener() {}
};
const store = {};

// Deep callable proxy: any property access or call returns another stub
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
  src + '\n; return { game, save, initGame, resetGame, update, gameLoop, moveWizard, enemyTurn, getAdvantage, startDrag, doDrag, endDrag, getWizardAt, checkVictory, switchTurn, createWizard, view: () => ({ W, H, originX, originY, CELL_SIZE, BOARD_OFFSET_X }) };'
)(
  doc,
  { innerWidth: 1600, innerHeight: 900, matchMedia: () => ({ matches: false }), addEventListener() {}, AudioContext: deepStub(), webkitAudioContext: undefined },
  { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } },
  { now: () => 0 },
  () => {},
  (fn) => { fn(); return 0; } // enemy "thinking" resolves instantly in the sim
);

const { game, save, initGame, update, gameLoop, moveWizard, enemyTurn, startDrag, doDrag, endDrag, view, createWizard } = api;

let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

initGame();
const v = view();

// --- Regression: full loop (update + render) with and without timestamps
// must never poison wizard state with NaN (the invisible-wizards bug) ---
gameLoop();            // direct call, no timestamp — the killer case
gameLoop(16.7);
gameLoop(33.4);
const poisoned = [...game.playerWizards, ...game.enemyWizards].filter(w =>
  !isFinite(w.animX) || !isFinite(w.animY) || !isFinite(w.idlePhase) || !isFinite(w.idleOffset));
expect(poisoned.length === 0, 'gameLoop with/without timestamp keeps all wizard state finite (' +
  (game.playerWizards.length + game.enemyWizards.length) + ' wizards)');

// --- Board grows past the old 500px cap ---
expect(v.CELL_SIZE * 11 > 550, 'board grows on a large window (' + (v.CELL_SIZE * 11) + 'px vs old 500 cap)');
expect(v.originX > 0 && v.originY > 0, 'board floats centered in the arena');

// --- Full player round trip through screen-space input ---
const wiz = game.playerWizards.find(w => w.col === 1) || game.playerWizards[0];
const sx = v.originX + v.BOARD_OFFSET_X + (wiz.col + 0.5) * v.CELL_SIZE;
const sy = v.originY + (wiz.row + 0.5) * v.CELL_SIZE;
startDrag({ clientX: sx, clientY: sy });
expect(game.dragging === wiz, 'screen-space drag picks up the right wizard');
doDrag({ clientX: sx + v.CELL_SIZE, clientY: sy });
endDrag();
expect(wiz.isMoving, 'drop on an adjacent cell starts the move');
let guard = 0;
while ((game.animatingWizard || game.currentTurn !== 'player') && guard++ < 2000) update(1);
expect(game.currentTurn === 'player' && !game.gameOver, 'move animates out, enemy replies, turn returns');

// --- Capture semantics on a crafted board ---
game.playerWizards.length = 0;
game.enemyWizards.length = 0;
game.playerCaptured.length = 0;
game.enemyCaptured.length = 0;
game.animatingWizard = null;
game.currentTurn = 'player';
game.gameOver = false;

const fire = createWizard(5, 5, 'player', 'fire');
const earthDef = createWizard(6, 5, 'enemy', 'earth');   // fire beats earth
game.playerWizards.push(fire);
game.enemyWizards.push(createWizard(10, 0, 'enemy', 'water')); // bystander so game continues
game.enemyWizards.push(earthDef);
moveWizard(fire, 6, 5);
guard = 0;
while (game.animatingWizard && guard++ < 2000) update(1);
expect(game.enemyCaptured.includes(earthDef), 'advantaged attack captures');

// Disadvantaged attack: water defender deflects fire
game.currentTurn = 'player';
const waterDef = game.enemyWizards.find(w => w.element === 'water');
waterDef.col = 7; waterDef.row = 5;
moveWizard(fire, 7, 5);
guard = 0;
while (game.animatingWizard && guard++ < 2000) update(1);
expect(!game.enemyCaptured.includes(waterDef) && game.enemyWizards.includes(waterDef),
  'disadvantaged attack lets the defender escape');

// --- AI prefers the advantaged capture ---
game.playerWizards.length = 0;
game.enemyWizards.length = 0;
game.currentTurn = 'enemy';
game.gameOver = false;
const brain = createWizard(5, 5, 'enemy', 'fire');
game.enemyWizards.push(brain);
const goodTarget = createWizard(4, 5, 'player', 'earth'); // fire beats earth
const badTarget = createWizard(6, 5, 'player', 'water');  // water beats fire
game.playerWizards.push(goodTarget, badTarget);
game.playerWizards.push(createWizard(0, 0, 'player', 'air')); // keep game alive
enemyTurn();
guard = 0;
while (game.animatingWizard && guard++ < 2000) update(1);
expect(game.playerCaptured.includes(goodTarget) && !game.playerCaptured.includes(badTarget),
  'AI takes the advantaged capture, not the losing one');

// --- Victory persists ---
game.playerWizards.length = 0;
game.enemyWizards.length = 0;
game.currentTurn = 'player';
game.gameOver = false;
const champ = createWizard(5, 5, 'player', 'fire');
const lastEnemy = createWizard(6, 5, 'enemy', 'earth');
game.playerWizards.push(champ);
game.enemyWizards.push(lastEnemy);
moveWizard(champ, 6, 5);
guard = 0;
while (game.animatingWizard && guard++ < 2000) update(1);
expect(game.gameOver && game.winner === 'player', 'last capture wins the game');
expect(save.wins === 1 && save.bestStanding === 1, 'victory recorded (' + save.wins + ' win, best ' + save.bestStanding + ')');
expect(JSON.parse(store['wizard-masters-save']).wins === 1, 'save persists to storage');

console.log(fail === 0 ? '\nWIZARD MASTERS OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
