# Coherence — Claude Code Guide

## What This Is

A collection of 6+ browser-based games themed around presence, patience, and tending. The flagship game (Coherence) is a turn-based roguelike about navigating a destabilizing grid — a meditation on creative burnout and knowing when to stop. Each game is a single self-contained HTML file. No build step, hosted on GitHub Pages.

---

## Tech Stack

- Vanilla HTML5/CSS3/JavaScript — no frameworks, no build step
- Single-file architecture: each game is one complete HTML file (1200–2100 lines)
- Web Audio API for procedural sound effects (oscillator-based tones)
- HTML5 `<audio>` for background music with track switching
- CSS Grid for Coherence game board; Canvas 2D in some other games
- CSS custom properties for theming
- GitHub Pages hosting

---

## File Structure

```
coherence/
  index.html              — hub/menu page (card-flip UI linking to all games)
  coherence.html          — flagship roguelike (16x16 grid, coherence drain) (1484 lines)
  journey.html            — card-building storyteller (2094 lines)
  wizard-masters.html     — tactical elemental combat on 11x11 board (1620 lines)
  soft-drift.html         — shop management / order fulfillment (1365 lines)
  continuous-state.html   — physics tile sandbox with settlement mechanics (1336 lines)
  cold-drift.html         — winter-themed variant (1692 lines)
  daily-routine.html      — daily routine game (1223 lines)
  coherence-review.md     — technical architecture review across all games (494 lines)
  docs/
    coh-3-maps.md         — 3 hand-crafted map designs (planned)
    coh-phase-3.md        — development milestones
    game-guide.md         — in-game documentation
    journey-dev-plan.md   — Journey feature planning
    daily-routine-dev-plan.md — Daily Routine feature planning
    [16+ more dev/design docs]
  music/                  — MP3 audio assets (~38MB)
    coherence.mp3, coherence-threshold.mp3
    ambient.mp3, ambient2.mp3
    soft-drift.mp3, wizard-masters.mp3
    daily-routine.mp3, jaunt.mp3, stroll.mp3, stroll2.mp3
```

---

## Architecture (Per-Game Pattern)

### Single-File Design
Each game is one HTML file containing all markup, CSS, and JavaScript. No code reuse between games — trade-off is portability and simplicity over DRY.

### State Management
Central state object (typically `gameState` or `state`), mutated directly:
```
gameState {
  grid: [][]          — 2D tile array
  playerPos: {x, y}
  coherence: 20       — drains per move
  belowThreshold      — triggers distortion spreading
  carriedArtifact     — current artifact (if any)
  turnCounter
}
```

### Game Loop (Coherence)
```
Input (arrow/WASD/d-pad) → movePlayer(dx, dy) → processTurn() → renderGrid() → updateStatus()
```

Turn resolution sequence:
1. Move player (cost: 1 coherence)
2. Check current tile (artifact/anchor/exit/threshold)
3. Calculate distortion drain (standing on = -2, adjacent = -1)
4. Spread distortions (every 3 turns after threshold, "Coral Growth" algorithm)
5. Check win/loss conditions
6. Render + update status

### Audio Pattern (All Games)
- **SFX**: Web Audio API oscillators (sine/sawtooth/square/triangle) — no audio file dependencies
- **Music**: HTML5 `<audio>` with track switching on state changes (e.g., crossing threshold swaps tracks)
- **Init overlay**: requires user gesture before audio plays (browser autoplay policy)

---

## Coherence Game — Key Mechanics

### Core Loop
- 16x16 grid, player starts with coherence = 20
- Must collect ≥1 artifact and reach exit to win
- Pushing for more artifacts = higher quality but greater collapse risk
- Coherence ≤ 0 = game over

### Artifacts (6 total, data-driven)
Each has a name, effect string, and coherence bonus. Effects modify game behavior:
- **Resonance Inverter**: inverts distortion/anchor behaviors
- **Clarity Lens**: reveals more of the grid
- **Severance**: cuts distortion connections
- Effect strings map to behavior checks in `processTurn()`

### Distortion Spread ("Coral Growth" Algorithm)
- Activates after player crosses threshold
- Spreads to cells with <2 distortion neighbors (preserves playable paths)
- Rate modified by certain artifacts
- Triggers every 3 turns

### Threshold Crossing
- Irreversible state change at grid midpoint
- Music switches to tension track
- Distortion spreading begins

---

## Other Games (Brief)

| Game | Type | Key Mechanic |
|------|------|-------------|
| **Journey** | Card-building storyteller | Deck construction + narrative |
| **Wizard Masters** | Tactical combat | Elemental rock-paper-scissors on 11x11 board |
| **Soft Drift** | Shop management | Color-coded order fulfillment |
| **Continuous State** | Physics sandbox | Tile-based settlement with sleep/wake cycles |
| **Cold Drift** | Winter variant | Exploration/survival theme |
| **Daily Routine** | Routine game | Daily task structure |

---

## Coding Conventions

- Single-file HTML with `<style>` and `<script>` blocks
- CSS custom properties in `:root` for theming (e.g., `--earth-deep`, `--signal-green`, `--distortion`, `--anchor`)
- Kebab-case CSS classes: `.card-flip`, `.modal-content`, `.control-btn`
- State indicator classes: `.coh-high`, `.state-stable`, `.state-critical`
- Descriptive JS function names: `processTurn`, `handleArtifactPickup`, `spreadDistortions`
- CSS animations for visual feedback: `playerPulse`, `distortionFlicker`, `artifactSparkle`, `exitPulse`
- Responsive with media query at 820px adding mobile d-pad controls

---

## Key Constraints

- Each game is a monolithic single HTML file — all changes to a game happen in one file
- No shared JavaScript between games — patterns are duplicated, not imported
- Music files are large (~38MB total) — avoid adding more without checking repo size
- Coherence board is 16x16 = 256 DOM cells — keep per-cell render logic lightweight
- Distortion spread algorithm ("Coral Growth") is tuned to preserve playable paths — changes to spread logic must maintain the <2 neighbor constraint
- Artifact effects are string-based — adding new artifacts requires both the data definition and effect checks in `processTurn()`
- Audio init requires user gesture — never remove the init overlay pattern
