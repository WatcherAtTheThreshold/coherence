# Coherence Collection - Technical Patterns & Decisions

> **Review Date:** January 2026
> **Games Reviewed:** Coherence, Continuous State, Soft Drift, Wizard Masters

---

## Collection Overview

- **Theme:** "Four meditations on presence, patience, and the quiet act of tending"
- **Shared Philosophy:** Non-violent, turn-based or real-time experiences focused on observation and intervention rather than combat
- **Core Design Pillars:**
  - Minimal UI - world is always visible
  - Irreversible decisions
  - Ambient audio-driven atmosphere
  - Single-session experiences

### Individual Games

| Game | Genre | Core Mechanic | Lines |
|------|-------|---------------|-------|
| Coherence | Roguelike/Puzzle | Navigate decaying space, collect artifacts, escape | ~1400 |
| Continuous State | Physics Sandbox | Drag-and-settle tile simulation | ~1250 |
| Soft Drift | Shop Management | Fulfill color-coded orders by dragging cubes | ~1365 |
| Wizard Masters | Tactics/Chess | Elemental rock-paper-scissors on 11x11 board | ~1600 |

---

## Architecture Patterns

### Module/File Structure
```
index.html            - Hub/menu page linking all games
coherence.html        (~1400 lines) - Main roguelike game
continuous-state.html (~1250 lines) - Physics tile simulation
soft-drift.html       (~1365 lines) - Shopkeeping game
wizard-masters.html   (~1600 lines) - Tactical wizard combat
music/                - MP3 audio assets per game
docs/                 - Development notes and planning
```

### Single-File Architecture
All games follow the same pattern: **everything in one HTML file**.

**Structure within each file:**
1. `<style>` block - Complete CSS including animations, responsive design
2. `<body>` - Minimal HTML structure, often just containers
3. `<script>` block - All game logic, state management, rendering

**Rationale:** Maximum portability, no build process, can be hosted anywhere.

### Separation of Concerns (within each file)

| Section | Responsibility |
|---------|----------------|
| CSS Variables (`:root`) | Color theming, design tokens |
| Audio System | Web Audio API for procedural SFX, HTML5 Audio for music |
| Game State Object | Central state (grid, entities, flags) |
| Input Handlers | Mouse/touch drag, keyboard controls |
| Game Loop | Update physics/logic + render |
| Render Functions | Draw board, entities, UI |

### State Management Pattern
- **Pattern used:** Single global state object per game
- **How state flows:** Direct mutation of state object → render reads state → DOM updates
- **Key pattern:**
```javascript
const game = {
    grid: [],
    player: null,
    entities: [],
    currentTurn: 'player',
    gameOver: false,
    particles: []
};
```

All games use a single `game` or `state` object that holds all mutable state. No framework, no immutability - direct property access and mutation.

---

## Design

### Core Game Systems

**Coherence (Roguelike)**
```javascript
// Turn resolution sequence
function processTurn() {
    gameState.turnCounter++;
    gameState.coherence -= cohCost;  // Movement cost

    const currentTile = gameState.grid[playerPos.y][playerPos.x];

    // Tile interactions (artifact, anchor, exit, threshold)
    if (currentTile === 'X') { /* exit logic */ }
    if (currentTile === 'O') { /* anchor restoration */ }
    if (currentTile === '*') { handleArtifactPickup(); return; }
    if (currentTile === '+') { /* threshold crossing */ }

    checkDistortionDrain();
    if (gameState.belowThreshold) spreadDistortions();
    if (gameState.coherence <= 0) loseGame();
}
```

**Continuous State (Physics)**
```javascript
// Sleep optimization for settled tiles
if (tile.sleeping) {
    // Only wake if nearby tile is moving
    let shouldWake = false;
    state.tiles.forEach(other => {
        if (tilesNearby(tile, other, 5)) {
            if (Math.abs(other.vy) > sleepThreshold) shouldWake = true;
        }
    });
    if (!shouldWake) return; // Skip physics for this tile
}
```

**Wizard Masters (Tactics)**
```javascript
// Elemental advantage system
const ELEMENTS = {
    fire:     { beats: ['earth', 'air'] },
    water:    { beats: ['fire', 'electric'] },
    earth:    { beats: ['water', 'electric'] },
    air:      { beats: ['water', 'earth'] },
    electric: { beats: ['air', 'cosmic'] },
    cosmic:   { beats: ['fire', 'cosmic'] }
};

function getAdvantage(attacker, defender) {
    if (ELEMENTS[attacker].beats.includes(defender)) return 'advantage';
    if (ELEMENTS[defender].beats.includes(attacker)) return 'disadvantage';
    return 'neutral';
}
```

### Key Design Decisions

1. **Canvas vs DOM Rendering**
   - Coherence: CSS Grid with DOM elements (each cell is a div)
   - Others: Canvas 2D rendering with procedural drawing
   - *Rationale:* Coherence has fewer moving parts; canvas better for animations/particles

2. **Audio Init Overlay**
   - All games have a "click to start" overlay
   - *Rationale:* Modern browsers block autoplay; ensures audio context starts from user gesture

3. **No Dependencies**
   - Zero npm packages, no build step
   - *Rationale:* Longevity, simplicity, instant deployment

### Data-Driven Elements

**Wizard Masters - Character Appearance**
```javascript
const characterSprites = {
    bodies: [
        { skin: '#e8c4a0', hair: '#4a3020', shirt: '#607090' },
        { skin: '#c49070', hair: '#2a2020', shirt: '#906050' },
        // ... variety
    ]
};
```

**Coherence - Artifact Definitions**
```javascript
const artifacts = [
    {
        name: "RESONANCE INVERTER",
        description: "Distortions become Anchors...",
        cohBonus: 6,
        effect: "invert"
    },
    // ... each artifact is data, effect is a string key
];
```

### UI/Game Phase Management

**Modal System (Coherence)**
```javascript
function showMessage(title, message, isGameEnd) {
    document.getElementById('modal').classList.add('active');
    // ... populate content
    if (isGameEnd) {
        buttons.innerHTML = '<button onclick="location.reload()">RESET</button>';
    } else {
        buttons.innerHTML = '<button onclick="closeMessage()">CONTINUE</button>';
    }
}
```

**Day/Night Cycle (Soft Drift)**
```javascript
game.timeOfDay = elapsed / game.dayDuration; // 0-1 range
if (game.timeOfDay >= 1 && !game.transitioning) {
    startNightTransition();
}
```

---

## Sound

### Audio Architecture

**Music System:**
- HTML5 `<audio>` elements with `.mp3` sources
- Multiple tracks per game (e.g., `coherence.mp3` + `coherence-threshold.mp3`)
- Crossfade between tracks based on game state

**SFX System:**
- Web Audio API for procedural sounds
- Oscillator + GainNode patterns
- No sound file dependencies for effects

```javascript
function playSound(type) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    switch(type) {
        case 'move':
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
            // ...
    }
}
```

**Transitions:**
```javascript
// Continuous State - crossfade based on coherence
function updateMusic(coherence) {
    coherentVolume = 0.1 + (coherence / 100) * 0.4;
    chaoticVolume = 0.4 - (coherence / 100) * 0.35;
    // Smooth fade step called each frame
}
```

### Audio Files
```
music/
├── coherence.mp3           - Main ambient track
├── coherence-threshold.mp3 - Tense track after threshold
├── ambient.mp3             - Continuous State calm
├── ambient2.mp3            - Continuous State chaotic
├── soft-drift.mp3          - Shopkeeping ambient
└── wizard-masters.mp3      - Tactics theme
```

---

## Browser Compatibility

- **Target browsers:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Module loading:** Inline `<script>` tags, no ES6 modules
- **Responsive approach:**
  - CSS `clamp()` for fluid typography
  - Media queries for mobile adjustments
  - Canvas size based on viewport calculations
- **Mobile considerations:**
  - Touch event handlers alongside mouse
  - Audio init overlay for autoplay restrictions
  - Mobile control buttons for Coherence

---

## What Works Well

1. **Single-file portability** - Can drop any game on any web server instantly
2. **Audio init pattern** - Consistent user gesture to start, no broken audio
3. **Central state object** - Easy to debug, serialize, understand
4. **Procedural SFX** - No additional file dependencies, instant feedback
5. **CSS variables for theming** - Consistent color language across each game
6. **Canvas scaling math** - All games calculate cell/tile size from viewport
7. **Sleep system (Continuous State)** - Prevents CPU waste on stable tiles
8. **Data-driven content** - Artifacts, elements, colors defined as objects

## What We'd Do Differently

1. **Extract shared utilities** - Audio init, input handling, modal system are nearly identical
2. **Use ES6 modules** - Would allow sharing code between games without copy/paste
3. **Separate CSS files** - Styles are substantial; separate files aid maintainability
4. **TypeScript** - State objects would benefit from type definitions
5. **State immutability** - Direct mutation works but makes undo/replay harder
6. **Sound pooling** - Continuous State disabled sounds due to crackling; proper pooling would help

---

## Key Implementation Details

### Movement/Input System
- **Approach:** Direct DOM event listeners with position calculation
- **Why this way:** No framework overhead, immediate response
- **Gotchas:** Must handle both mouse and touch; prevent default to avoid scrolling

```javascript
function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}
```

### Particle System (Wizard Masters)
- **Approach:** Array of particle objects with position, velocity, life
- **Why this way:** Simple, no allocation pooling needed at this scale
- **Gotchas:** Must splice from array in reverse to avoid index issues

```javascript
function updateParticles() {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) game.particles.splice(i, 1);
    }
}
```

### Distortion Spread (Coherence)
- **Approach:** "Coral Growth" algorithm - only spread to cells with <2 distortion neighbors
- **Why this way:** Preserves navigable paths, prevents total board coverage
- **Gotchas:** Must collect candidates first, then mutate; artifact effects modify spread rate

### AI Move Selection (Wizard Masters)
- **Approach:** Score-based evaluation of all valid moves
- **Why this way:** Simple, deterministic, easy to tune
- **Formula:** `score = (isCapture ? 100 : 0) + forwardProgress * 5 + random`

---

## Reusable Code Patterns

### Audio Init Pattern
```javascript
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    music.play().then(() => {
        document.getElementById('audio-init').classList.add('hidden');
    }).catch(err => {
        // Still hide overlay even if audio fails
        document.getElementById('audio-init').classList.add('hidden');
    });
}
```

### Drag System Pattern
```javascript
function setupDrag() {
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', doDrag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        startDrag(touchToMouse(e.touches[0]));
    });
    // ... touchmove, touchend
}
```

### Color Interpolation
```javascript
function lerpColor(color1, color2, t) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    // ... parse color2
    const r = Math.round(r1 + (r2 - r1) * t);
    // ... g, b
    return `#${r.toString(16).padStart(2,'0')}...`;
}
```

### CSS Animation Keyframes
```css
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

---

## Performance Considerations

### What Mattered
- **Continuous State sleep system** - Without it, 50+ tiles constantly running physics
- **Particle count limits** - Wizard Masters caps active particles to prevent memory growth
- **Canvas vs DOM** - Wizard Masters moved to canvas for smoother animation; DOM would struggle with 100+ entities

### What Didn't Matter
- **State immutability** - Direct mutation is fine at this scale
- **Object pooling** - Not enough allocations to warrant
- **Web Workers** - No heavy computation requiring thread offload
- **Virtual DOM** - Would add overhead without benefit at this scale

---

## Development Workflow Notes

### Build Process
```bash
# No build required - just serve the files
python -m http.server 8000
# or
npx serve .
```

### File Organization
```
coherence/
├── index.html           # Hub page
├── coherence.html       # Game 1
├── continuous-state.html
├── soft-drift.html
├── wizard-masters.html
├── music/               # Audio assets
│   └── *.mp3
├── docs/                # Planning documents
│   └── *.md
└── README.md
```

### Debugging Tips
- Open console, access `game` or `state` object directly
- `game.coherence = 100` to test end states
- `game.playerWizards.forEach(w => console.log(w.element))` to inspect entities
- Add `debugger;` in game loop to step through frames

---

## Quick Reference: Extending the Games

### Adding New Artifacts (Coherence)
1. Add entry to `artifacts` array with name, description, cohBonus, effect
2. Handle effect string in `processTurn()` and relevant check functions
3. Test artifact interactions with threshold and other artifacts

### Adding New Elements (Wizard Masters)
1. Add to `ELEMENTS` object with color, glow, beats array
2. Update `setupWizards()` to include in element pools
3. Add element-specific aura in `drawElementAura()`

### Adding New Tile Types (Continuous State)
1. Add CSS class for visual style (`.tile.newtype`)
2. Add to `tileTypes` object with weight
3. Include in `createInitialTiles()` arrangements

### Adding New Cube Colors (Soft Drift)
1. Add hex color to `cubeColors` array
2. Colors are automatically used by shelf generation and order system

---

## Cross-Game Patterns Summary

| Pattern | Coherence | Continuous State | Soft Drift | Wizard Masters |
|---------|-----------|------------------|------------|----------------|
| Rendering | CSS Grid/DOM | DOM tiles | Canvas 2D | Canvas 2D |
| State | `gameState{}` | `state{}` | `game{}` | `game{}` |
| Audio | Web Audio + MP3 | Web Audio + MP3 | Web Audio + MP3 | Web Audio + MP3 |
| Input | Keyboard + Touch | Drag | Drag | Drag |
| Turn Model | Turn-based | Real-time | Real-time | Turn-based |

---

## Reference: Previous Reviews

| Game | Genre | Key Patterns | Link |
|------|-------|--------------|------|
| Coherence Collection | Various | Single-file, Web Audio, Canvas/DOM hybrid | (this document) |

---

*Generated from codebase analysis, January 2026*
