// Loop verification for coherence.html — stubs DOM, drives movePlayer with bots.
const fs = require('fs');
const html = fs.readFileSync('d:/GitHub/coherence/coherence.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

const elStub = () => ({
  textContent: '', innerHTML: '', volume: 0, currentTime: 0,
  dataset: {}, style: {},
  offsetWidth: 30, offsetHeight: 30, offsetLeft: 0, offsetTop: 0,
  classList: {
    _set: new Set(),
    add(c) { this._set.add(c); }, remove(c) { this._set.delete(c); },
    toggle() {}, contains(c) { return this._set.has(c); }
  },
  play() { return Promise.resolve(); }, pause() {},
  focus() {}, appendChild() {}, addEventListener() {},
  remove() {}, querySelectorAll() { return []; }
});
// Timers fire immediately so delayed modals resolve within the sim
global.setTimeout = (fn) => { fn(); return 0; };
const elements = {};
const doc = {
  getElementById(id) { return elements[id] || (elements[id] = elStub()); },
  createElement() { return elStub(); },
  addEventListener() {}
};

const api = new Function('document', 'window',
  src + '\n; return { gameState, movePlayer, acceptArtifact, tradeArtifact, declineArtifact, winGame, stayLonger, resetGame, initGame, ENDINGS };'
)(doc, { AudioContext: undefined, webkitAudioContext: undefined, addEventListener() {} });

const { gameState, movePlayer, acceptArtifact, tradeArtifact, declineArtifact, winGame, stayLonger, resetGame } = api;

const modal = doc.getElementById('modal');
const modalTitle = doc.getElementById('modal-title');
const modalText = doc.getElementById('modal-text');

function modalActive() { return modal.classList.contains('active'); }

// Bot plays one full game. artifactTarget = how many artifacts to collect before transmitting.
function playGame(artifactTarget) {
  resetGame();
  let moves = 0;
  while (!gameState.gameOver && moves < 3000) {
    moves++;
    if (modalActive()) {
      const title = modalTitle.textContent;
      if (title.startsWith('ARTIFACT')) {
        if (!gameState.carriedArtifact) acceptArtifact(Math.floor(Math.random() * 6));
        else if (gameState.artifactsCollected < artifactTarget) tradeArtifact(Math.floor(Math.random() * 6));
        else declineArtifact();
      } else if (title === 'THE WAY OUT') {
        if (gameState.artifactsCollected >= artifactTarget) { winGame(); }
        else stayLonger();
      } else if (title === 'EXIT LOCKED') {
        modal.classList.remove('active');
      } else {
        modal.classList.remove('active');
      }
      continue;
    }
    // Seek behavior: find nearest wanted tile ('*' if below target, else 'X').
    // A 1-artifact "safe" player stays above the threshold if possible.
    let target;
    if (gameState.artifactsCollected < artifactTarget) {
      target = (artifactTarget === 1 && nearestAbove('*')) || nearest('*') || nearest('X');
    } else {
      target = nearest('X');
    }
    const step = stepToward(target);
    movePlayer(step.dx, step.dy);
  }
  return {
    won: gameState.won,
    over: gameState.gameOver,
    collected: gameState.artifactsCollected,
    coherence: gameState.coherence,
    endText: modalText.innerHTML,
    endTitle: modalTitle.textContent,
    moves
  };
}

function nearestAbove(tile) {
  let best = null, bestD = Infinity;
  for (let y = 0; y < gameState.thresholdRow; y++) {
    for (let x = 0; x < gameState.grid[y].length; x++) {
      if (gameState.grid[y][x] === tile) {
        const d = Math.abs(x - gameState.playerPos.x) + Math.abs(y - gameState.playerPos.y);
        if (d < bestD) { bestD = d; best = { x, y }; }
      }
    }
  }
  return best;
}

function nearest(tile) {
  let best = null, bestD = Infinity;
  for (let y = 0; y < gameState.grid.length; y++) {
    for (let x = 0; x < gameState.grid[y].length; x++) {
      if (gameState.grid[y][x] === tile) {
        const d = Math.abs(x - gameState.playerPos.x) + Math.abs(y - gameState.playerPos.y);
        if (d < bestD) { bestD = d; best = { x, y }; }
      }
    }
  }
  return best;
}

function stepToward(target) {
  if (!target) return { dx: [1, -1, 0, 0][Math.floor(Math.random() * 4)], dy: [0, 0, 1, -1][Math.floor(Math.random() * 4)] };
  const dx = Math.sign(target.x - gameState.playerPos.x);
  const dy = Math.sign(target.y - gameState.playerPos.y);
  // random tie-break, avoid walls implicitly (movePlayer no-ops into walls, so jitter)
  if (dx !== 0 && dy !== 0) return Math.random() < 0.5 ? { dx, dy: 0 } : { dx: 0, dy };
  if (dx === 0 && dy === 0) return { dx: 1, dy: 0 };
  if (Math.random() < 0.05) return { dx: [1, -1, 0, 0][Math.floor(Math.random() * 4)], dy: [0, 0, 1, -1][Math.floor(Math.random() * 4)] };
  return { dx, dy };
}

// --- Trials ---
const RUNS = 80;
let fail = 0;
function expect(cond, msg) { console.log((cond ? 'PASS  ' : 'FAIL  ') + msg); if (!cond) fail++; }

function trial(name, target) {
  let wins = 0, cohSum = 0, collectedSum = 0, tierSeen = new Set(), stuck = 0;
  let sampleEnd = '';
  for (let i = 0; i < RUNS; i++) {
    const r = playGame(target);
    if (!r.over) stuck++;
    if (r.won) {
      wins++;
      cohSum += Math.max(0, r.coherence);
      collectedSum += r.collected;
      tierSeen.add(Math.min(4, r.collected));
      if (!sampleEnd) sampleEnd = r.endText.slice(0, 60);
    }
  }
  console.log(name.padEnd(26),
    'won ' + wins + '/' + RUNS,
    wins ? ' avg coh ' + (cohSum / wins).toFixed(1) + '  avg artifacts ' + (collectedSum / wins).toFixed(1) : '',
    stuck ? ' STUCK:' + stuck : '');
  return { wins, avgCoh: wins ? cohSum / wins : 0, avgCollected: wins ? collectedSum / wins : 0, stuck };
}

const safe = trial('safe (1 artifact, leave)', 1);
const balanced = trial('balanced (2 artifacts)', 2);
const greedy = trial('greedy (all 4)', 4);

expect(safe.stuck === 0 && balanced.stuck === 0 && greedy.stuck === 0, 'no bot ever gets stuck (games always end)');
expect(safe.wins >= RUNS * 0.85, 'safe play nearly always escapes (knowing when to stop is reliable)');
expect(safe.avgCoh >= 6, 'safe survivors land in medium/high ending bands, not "running on fumes"');
expect(greedy.wins < safe.wins * 0.75, 'greed is clearly riskier than safety');
expect(greedy.wins > 0, 'but full clear is possible');

// Ending text correctness: play one deliberate 1-artifact game and check the modal
let r1;
do { r1 = playGame(1); } while (!r1.won);
expect(r1.endText.includes('ARTIFACTS RECOVERED: ' + r1.collected), 'win modal reports artifact count');
expect(r1.endText.includes('COHERENCE REMAINING'), 'win modal reports coherence');
expect(/knew when to stop|Good enough|need time to recover/.test(r1.endText) || r1.collected > 1,
  'tier-1 ending uses tier-1 text');

// Restart integrity: after reset, state is clean
resetGame();
expect(gameState.coherence === 30 && gameState.artifactsCollected === 0 && !gameState.gameOver && gameState.playerPos.x === 1,
  'resetGame restores a clean run without reload');

console.log(fail === 0 ? '\nLOOP OK' : '\n' + fail + ' CHECK(S) FAILED');
process.exit(fail === 0 ? 0 : 1);
