# Non-Violent Roguelike — Project Notes (Prototype v0.1)

## Core Concept
A **non-violent, one-run, roguelike-inspired game** focused on tension, restraint, and irreversible decisions rather than combat.

The game is:
- Turn-based
- Browser-based
- Abstract (no characters, no violence)
- Systems-driven
- About managing **internal stability** rather than defeating enemies

Failure is not death by damage, but **dissolution / loss of coherence**.

---

## Design Pillars

- **No combat** — tension comes from environment and consequence
- **One run only** — no saves, no reloads
- **Irreversible decisions** — choices permanently change the state
- **Minimal UI** — the world is always visible
- **Symbolic abstraction** — meaning emerges through interaction

---

## Prototype Scope

### Single-Screen Terrarium

- One fixed grid
- No scrolling
- No procedural generation (for prototype)
- Entire game plays out on one screen

Purpose:
- Test core tension loop
- Validate non-violent pressure
- Avoid scope creep

---

## Grid

- Size: **13 × 13**
- Fully visible at all times
- Surrounded by impassable boundary

### Base Grid

```
#############
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#...........#
#############
```

---

## Symbols & Tiles

| Symbol | Name        | Description |
|------|-------------|-------------|
| `@`  | Self        | Player avatar |
| `.`  | Ground      | Neutral space |
| `#`  | Boundary    | Impassable wall |
| `~`  | Distortion  | Creates ambient pressure |
| `O`  | Anchor      | Stabilizing refuge |
| `+`  | Threshold   | Irreversible trigger |
| `*`  | Artifact    | Carryable rule-changer |
| `X`  | Exit        | Run completion |

Small symbol set by design — clarity over variety.

---

## Initial Layout (Hand-Placed)

```
#############
#@....~....X#
#.....~.....#
#...........#
#....+......#
#...........#
#.....O.....#
#...........#
#......*....#
#...........#
#.....~.....#
#...........#
#############
```

### Spatial Intent
- Exit is visible from the start
- Distortions create pressure, not blockage
- Anchor invites pause and planning
- Artifact is optional and tempting
- Threshold forces a mid-game commitment

---

## Player Rules

### Movement
- 4-directional only (up, down, left, right)
- 1 tile per turn
- No diagonal movement

### Actions (Prototype)
- Move
- Wait (optional, TBD)
- Use carried item (if any)

Each action advances the world by one turn.

---

## Core Stat

### Coherence
- Represents stability, grounding, integrity
- Starts at a fixed value (e.g. 10)
- Decreases due to environmental pressure
- Reaching 0 ends the run

This replaces HP entirely.

---

## Interaction Model

### Hybrid System (Chosen)

- **Contact-based** for actions and triggers
- **Field-based** for ambient pressure

#### Contact-Based
- Anchor (`O`) — only works when standing on it
- Threshold (`+`) — triggers only when crossed
- Artifact (`*`) — picked up by stepping on it

#### Field-Based
- Distortion (`~`) affects nearby tiles

---

## Distortion (`~`) — Draft Rule

- Radius: 1 tile (adjacent spaces)
- While adjacent: Coherence -1 per turn
- While standing on it: Coherence -2 per turn

Creates a gradient of discomfort rather than instant failure.

---

## Inventory

- Maximum: **1–3 items** (prototype likely 1)
- Items do not increase stats
- Items **change rules or perception**

Example Artifact Effects (conceptual):
- Ignore distortion pressure, but anchors stop working
- Reveal hidden states, but increase coherence drain
- Restore coherence once, then permanently alter terrain

Inventory defines *who you become*, not how strong you are.

---

## Exit & Failure

### Exit (`X`)
- Reachable at any time
- Completing the run does not imply mastery
- Outcome depends on state at exit

### Failure
- Coherence reaches 0
- Run ends immediately
- Framed as dissolution or loss of signal, not death

---

## UI (Minimal)

Single status line at bottom:

```
COH: 7   STATE: stable   CARRY: none
```

No menus unless explicitly opened.

---

## What This Prototype Tests

- Can non-violent pressure sustain tension?
- Is one irreversible decision enough to carry meaning?
- Does the grid invite contemplation rather than optimization?

If this works → expand
If this fails → stop early

---

## Next Possible Steps

Choose one:
1. Lock exact coherence math
2. Define threshold behavior
3. Finalize one artifact rule
4. Translate grid into JS data structures
5. Simulate a full turn step-by-step

The goal is **depth through restraint**, not feature growth.

