// Balance simulation for ember.html — stubs the DOM, drives update() with bot players.
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/ember.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// --- Minimal DOM/browser stubs ---
const elStub = () => ({
  textContent: '', innerHTML: '',
  classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  addEventListener() {},
  getContext() { return new Proxy({}, { get: () => () => ({ addColorStop() {} }) }); },
  style: {}
});
const elements = {};
global.document = {
  getElementById(id) { return elements[id] || (elements[id] = elStub()); },
  addEventListener() {},
  hidden: false
};
global.window = {
  innerWidth: 1200, innerHeight: 800,
  matchMedia: () => ({ matches: false }),
  addEventListener() {},
  devicePixelRatio: 1
};
global.localStorage = { getItem: () => null, setItem() {} };
global.performance = { now: () => 0 };
global.requestAnimationFrame = () => {}; // stop the boot loop
global.setTimeout = (fn, ms) => 0;       // captions — never fire
global.clearTimeout = () => {};

// Evaluate the game script in this scope, then export internals
const exported = new Function(
  'window', 'document', 'localStorage', 'performance', 'requestAnimationFrame', 'setTimeout', 'clearTimeout',
  src + '\n; return { state, resetNight, update, feedLog, breathe, save, NIGHT_LENGTH };'
)(window, document, localStorage, performance, requestAnimationFrame, setTimeout, clearTimeout);

const { state, resetNight, update, feedLog, breathe, NIGHT_LENGTH } = exported;

function runNight(bot) {
  resetNight();
  const dt = 0.1;
  let steps = 0;
  while (state.phase === 'playing' && steps < (NIGHT_LENGTH + 60) / dt) {
    bot();
    update(dt);
    steps++;
  }
  // resolve ending phases
  let guard = 0;
  while (state.phase !== 'ended' && guard++ < 200) update(dt);
  return { survived: state.warmth > 0 && state.t >= NIGHT_LENGTH - 1, warmed: state.warmed, woodLeft: state.wood, tDied: state.t };
}

function trial(name, bot, runs) {
  let surv = 0, warmedTotal = 0, minW = Infinity, maxW = -Infinity, diedAt = [];
  for (let i = 0; i < runs; i++) {
    const r = runNight(bot);
    if (r.survived) surv++;
    else diedAt.push(Math.round(r.tDied));
    warmedTotal += r.warmed;
    minW = Math.min(minW, r.warmed);
    maxW = Math.max(maxW, r.warmed);
  }
  console.log(
    name.padEnd(28),
    'survived ' + surv + '/' + runs,
    ' warmed avg ' + (warmedTotal / runs).toFixed(1) + ' (min ' + minW + ', max ' + maxW + ')',
    diedAt.length ? ' died at t≈' + Math.round(diedAt.reduce((a, b) => a + b, 0) / diedAt.length) + 's' : ''
  );
  return { surv, avgWarmed: warmedTotal / runs };
}

const RUNS = 60;

// Bot 1: bright keeper — holds the fire high to attract wanderers
const bright = trial('bright keeper (w>60)', () => {
  if (state.warmth < 60 && state.wood > 0) feedLog();
  if (state.breathCd <= 0 && state.warmth < 75) breathe();
}, RUNS);

// Bot 2: cautious — minimal fuel, just survive
const cautious = trial('cautious (feed at w<22)', () => {
  if (state.warmth < 22 && state.wood > 0) feedLog();
}, RUNS);

// Bot 3: breath spammer — never feeds, taps constantly (exploit check)
const spammer = trial('breath spammer (no logs)', () => {
  if (state.breathCd <= 0) breathe();
}, RUNS);

// Bot 4: does nothing at all
const idle = trial('idle (no input)', () => {}, RUNS);

// Bot 5: dump all wood at start then idle
let dumped = false;
const dumper = trial('dump-all-then-idle', () => {
  if (state.t < 2 && state.wood > 0) feedLog();
}, RUNS);

// --- Assertions on the design goals ---
let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

expect(bright.surv >= RUNS * 0.75, 'bright keeper survives most nights (skilled bright play is viable)');
expect(bright.avgWarmed >= 3, 'bright keeper warms several souls (risk pays off)');
expect(cautious.surv >= RUNS * 0.8, 'cautious play survives (quiet night is a valid path)');
expect(cautious.avgWarmed < bright.avgWarmed - 1.5, 'cautious warms clearly fewer souls than bright (real tradeoff)');
expect(spammer.surv === 0, 'breath spam alone cannot survive the night (no exploit)');
expect(idle.surv === 0, 'doing nothing loses');
expect(dumper.surv === 0, 'dumping all wood at the start loses (pacing matters)');

console.log(fail === 0 ? '\nBALANCE OK' : '\n' + fail + ' BALANCE CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
