# COHERENCE

> A non-violent roguelike about knowing when to stop.

![Signal Decay Protocol](https://img.shields.io/badge/status-prototype-green) ![Version](https://img.shields.io/badge/version-0.2-blue)

---

## What Is This?

**COHERENCE** is a single-run, browser-based game about the tension between quality and sustainability. You're navigating a destabilizing space, collecting artifacts to complete your transmission, while managing your internal stability.

The question isn't "can you win?" - it's "how much can you achieve before you collapse?"

### Core Tension

- You need **1 artifact minimum** to unlock the exit
- You can push for **2-3 artifacts** for higher quality work
- But every move, every decision drains your coherence
- Cross the threshold and distortions begin to spread
- Leave too early: functional but basic
- Push too hard: complete but dissolved

**The game mirrors creative burnout:** going for 70% vs. 100%, shipping vs. perfecting, knowing when good enough is good enough.

---

## How to Play

### Controls
- **Arrow Keys** or **WASD** - Move in four directions
- **Mobile** - Touch the directional buttons
- **Enter** - Confirm modal choices

### Objective
1. Navigate the 13×13 grid
2. Collect at least **1 artifact** (`*`) to unlock the exit
3. Reach the exit (`X`) before coherence reaches 0
4. Decide: settle for minimum viable, or push for quality?

### The Rules

**COHERENCE** - Your stability. Starts at 20.
- Movement: -1 per turn
- Standing on distortion (`~`): -2 per turn
- Adjacent to distortion: -1 per turn
- Artifacts: +6 when collected
- Anchor (`O`): +10 one-time restoration

**THE THRESHOLD** (`+`) - Point of no return
- Crossing triggers escalating pressure
- Distortions begin spreading every 3 turns
- The deeper you go, the harder it gets to leave

**ARTIFACTS** (`*`) - Rule-changing items
Each artifact transforms how you interact with the world:
- **Resonance Inverter** - Distortions heal, anchors harm
- **Clarity Lens** - See patterns, but drain +1 per turn
- **Severance** - Immune to distortions, but anchors fail

You can carry multiple artifacts, but each changes your identity permanently.

---

## Current State

### Implemented ✅
- Complete core loop (movement, coherence, win/loss)
- Distortion field mechanics (adjacency + standing)
- Threshold crossing with music transition
- Artifact system with three distinct effects
- Single anchor restoration point
- Exit unlocking requirement
- Mobile touch controls
- Audio system with threshold music shift
- Scanline CRT aesthetic with glitch effects
- Modal system for artifact choices

### In Progress 🚧
- Three-tier ending system based on artifacts collected
- Balanced distortion spread rate
- Multiple hand-crafted map variants

### Planned 📋
- 3 unique map layouts ("Tight Deadline", "Scope Sprawl", "Gauntlet")
- Enhanced win screen with quality/coherence breakdown
- Audio polish (distortion spread cues, low-coherence effects)
- Mobile UX testing and refinement

---

## Technical Details

### Stack
- Pure HTML5 + CSS + Vanilla JavaScript
- Canvas-free rendering (CSS Grid for game board)
- No build process, no dependencies
- Single-file architecture for portability

### Structure
```
index.html          # Complete game in ~900 lines
music/              # Audio assets
  ├── coherence.mp3
  └── coherence-threshold.mp3
```

### Key Systems

**Game State**
```javascript
{
  grid: Array<Array<string>>,    // 13×13 tile map
  playerPos: {x, y},
  coherence: number,
  belowThreshold: boolean,
  carriedArtifacts: Array,
  hasArtifact: boolean,          // Exit unlock flag
  turnCounter: number
}
```

**Turn Resolution**
1. Player input → position update
2. Tile interaction (artifact/anchor/threshold/exit)
3. Distortion drain calculation
4. Post-threshold spreading (every 3 turns)
5. Coherence check → win/loss
6. Render update

---

## Design Philosophy

### Pillars
1. **No combat** - Pressure comes from environment and consequence
2. **One run only** - No saves, no meta-progression
3. **Irreversible decisions** - Choices permanently alter state
4. **Minimal UI** - The world is always visible
5. **Symbolic abstraction** - Meaning emerges through play

### Intentional Constraints
- Single screen (no scrolling)
- Small symbol set (8 tile types)
- Fixed grid size (13×13)
- Turn-based with immediate feedback

These aren't limitations - they're **focus**. Every mechanic serves the core question: "When is good enough actually good enough?"

---

## Why "Coherence"?

The word carries multiple meanings:
- **Physics** - Phase alignment of waves
- **Psychology** - Internal consistency, sense of self
- **Writing** - Clarity and connectedness
- **Signal Processing** - Integrity of transmission

All of these collapse when pushed too hard. The game is about recognizing that threshold before you cross it.

---

## Development Notes

### Balancing for the Core Loop
The math must support this experience:
- **1 artifact run** should feel safe but basic (12-15 coherence remaining)
- **2 artifact run** should feel tense but achievable (6-11 coherence)
- **3 artifact run** should feel like "oh god why did I do this" (1-5 coherence)

If the numbers don't create this gradient, the metaphor breaks.

### On Scope Creep
This project is itself a meditation on restraint. Features must justify their existence against the core tension. When in doubt: **cut, don't add**.

The prototype deliberately:
- Uses hand-placed grids (not procedural generation)
- Limits inventory to artifacts (no equipment/stats bloat)
- Focuses on one decision (cross threshold?) not many

If a feature doesn't make "knowing when to stop" more interesting, it doesn't belong.

---

## Credits

**Design & Development** - Jessop  
**Concept** - Exploring creative burnout through systems  
**Inspiration** - Every project that demanded too much  

**Fonts**
- [Orbitron](https://fonts.google.com/specimen/Orbitron) by Matt McInerney
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) by IBM

---

## License

This project is a personal exploration. Code is provided as-is for learning purposes.

---

## Final Thought

> "Depth through restraint."

If you find yourself playing this and thinking "just one more artifact," ask yourself: is that the game talking, or something else?

Sometimes the real win is walking away intact.

---

**STATUS: TRANSMISSION IN PROGRESS**  
**COHERENCE: STABLE**  
**NEXT: DEPLOY**
