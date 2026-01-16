# Non-Violent Roguelike — Design Document v0.2

## Core Concept

A **non-violent, single-run, browser-based roguelike** about knowing when to stop.

You are exploring a space that slowly destabilizes you. Rewards exist deeper in, but the longer you stay, the harder it becomes to leave. The core tension: **Do I keep digging for more, or get out with what I have before I lose coherence entirely?**

---

## Thematic Core

The game mirrors the experience of project creep, obsessive work, or any pursuit where "just one more thing" can tip you from productive into dissolution.

- Going deeper offers rewards but increases pressure
- The exit is always visible, always accessible
- Failure comes from not knowing when to stop
- Success isn't about getting everything—it's about leaving intact

---

## Design Pillars

1. **No combat** — pressure comes from environment and time
2. **One run only** — no saves, no retries
3. **Irreversible decisions** — crossing the threshold changes everything
4. **Minimal UI** — one status line, one grid, always visible
5. **Symbolic abstraction** — meaning emerges through play

---

## Grid & Layout

### Size: 13×13
- Fully visible at all times
- No scrolling, no procedural generation (prototype)
- Entire run plays out on one screen

### Proposed Layout

```
#############
#@.........X#  ← Safe zone (above threshold)
#...........#
#.....~.....#
#..*........#
#....+++++++#  ← THE THRESHOLD (row of +)
#....*......#  ← Deep zone (below threshold)
#.....O.....#
#..~........#
#......*....#
#....*......#
#.....~.....#
#############
```

**Spatial Philosophy:**
- Exit (X) is in the safe zone, always reachable
- Threshold divides the grid horizontally
- Most artifacts (*) are below the threshold
- Anchor (O) is deep but valuable
- Distortions (~) create navigational puzzles

---

## Core Mechanics

### Coherence
- **What it is:** Your stability, integrity, grounding
- **Starting value:** 20
- **Drain rate:** -1 per move (basic movement cost)
- **Win condition:** Reach exit with Coherence > 0
- **Lose condition:** Coherence reaches 0 (dissolution)

No HP. No damage. Just the slow erosion of self.

---

## Movement

- **4-directional only:** Up, Down, Left, Right
- **1 tile per turn**
- **Cost:** 1 Coherence per move
- No diagonals, no waiting (each action advances state)

---

## Tiles & Interactions

### Ground (`.`)
- Neutral space
- Only costs the base movement (1 Coh)

### Boundary (`#`)
- Impassable walls
- Define the edges

### Self (`@`)
- Player position
- Starts top-left

### Exit (`X`)
- Win condition
- Positioned in safe zone (above threshold)
- Can be reached at any time
- Run ends immediately on entry

### Distortion (`~`)
- **Adjacent (cardinal directions only):** -1 Coh per turn
- **Standing on it:** -2 Coh per turn
- Creates zones of pressure, not hard blocks
- **After threshold is crossed:** spreads over time

### Anchor (`O`)
- **Effect:** +10 Coherence when stepped on
- **Single use:** disappears after activation
- Positioned in the deep zone (risk/reward)

### Artifact (`*`)
- **Pick-up interaction:** Step on tile, get prompt
- **Prompt format:**
  ```
  ARTIFACT: [Name]
  Effect: [Rule change description]
  Immediate: +6 Coherence
  
  Accept? [Y/N]
  ```
- **If accepted:** Gain Coh, rule change takes effect permanently
- **If declined:** Artifact remains (can return later)
- **Carry limit:** 1-3 items (prototype: 1)

**Example Artifact Effects:**
- "Resonance Inverter" — Distortions become Anchors, Anchors become Distortions
- "Clarity Lens" — See distortion spread pattern, but drain +1 per turn
- "Severance" — Immune to distortion adjacency, but Anchor no longer works

Artifacts change *who you are*, not just your stats.

### Threshold (`+`)
- **Visual:** Horizontal line of `+` symbols
- **One-way trigger:** Once crossed downward, the game changes
- **Cannot cross back up** (optional rule — test both ways)

**When threshold is crossed:**
1. All distortions begin **spreading**
2. Every 3 turns, each `~` spawns an adjacent `~` (cardinal directions)
3. The pressure escalates — stay too long and the grid fills
4. Creates urgency: "Get what you need and get out"

---

## Turn Resolution

Each turn processes in this order:

1. **Player input** (move direction)
2. **Position update** (move @ to new tile)
3. **Tile interaction** (artifact pickup, anchor use, threshold crossing, exit)
4. **Adjacency check** (distortion drain if adjacent)
5. **Post-threshold spread** (if threshold crossed, increment counter, spawn new distortions on schedule)
6. **Coherence check** (if ≤ 0, game over)
7. **UI update** (display new state)

---

## UI (Minimal)

Single status line at bottom:

```
COH: 14   STATE: searching   CARRY: none
```

Or if carrying artifact:

```
COH: 12   STATE: altered   CARRY: Resonance Inverter
```

**STATE values:**
- `stable` — above threshold, no immediate pressure
- `searching` — below threshold, clock is ticking
- `altered` — carrying artifact with active effect
- `critical` — Coherence < 5

No health bars. No minimap. Just the grid and the numbers.

---

## Win/Loss Conditions

### Win
- Reach the exit (`X`) with Coherence > 0
- **Outcome flavored by state:**
  - High Coherence (15+): "You emerged whole"
  - Medium Coherence (8-14): "You made it out, barely"
  - Low Coherence (1-7): "You escaped with fragments"

### Loss
- Coherence reaches 0
- Message: "Signal lost" or "Dissolution" (not "death")
- No continue, no retry

---

## What This Tests

The core questions:
1. Does the threshold create meaningful "point of no return" tension?
2. Can distortion spreading make "time pressure" feel organic, not arbitrary?
3. Do artifacts feel like identity shifts, not just buffs?
4. Is knowing when to leave emotionally satisfying?

If yes → this is the game
If no → iterate on these specific systems

---

## Implementation Path

### Phase 1: Core Loop (Paper → Code)
**Goal:** Get the basic movement and coherence drain working

**Steps:**
1. **Set up project structure**
   - HTML canvas or div-based grid
   - JavaScript for game state
   - CSS for minimal styling

2. **Render the grid**
   - 13×13 array
   - Map symbols to visual representation
   - Display player position

3. **Implement movement**
   - Arrow key input
   - Update @ position
   - Prevent wall collision
   - Cost: -1 Coh per move

4. **Basic UI**
   - Status line showing Coherence
   - Update each turn

5. **Win/Loss states**
   - Exit tile ends run (win)
   - Coherence ≤ 0 ends run (loss)

**Playtest checkpoint:** Can you move around and reach the exit? Does the 20 Coh → 1 per move math feel right?

---

### Phase 2: Pressure Systems
**Goal:** Add distortions and make the space dangerous

**Steps:**
1. **Distortion adjacency**
   - Check cardinal neighbors each turn
   - Apply -1 Coh if adjacent to `~`
   - Apply -2 Coh if standing on `~`

2. **Anchor mechanic**
   - Detect when @ lands on `O`
   - Add +10 Coh
   - Remove `O` from grid (single use)

3. **State tracking**
   - Add `STATE` to UI (stable/searching/etc)

**Playtest checkpoint:** Does navigating around distortions create interesting routing decisions? Is the anchor positioned well?

---

### Phase 3: The Threshold
**Goal:** Make crossing the threshold irreversible and consequential

**Steps:**
1. **Detect threshold crossing**
   - Track if player has crossed below threshold line
   - Set flag: `belowThreshold = true`

2. **Distortion spreading system**
   - After crossing: start turn counter
   - Every 3 turns: for each `~`, spawn adjacent `~` (pick random cardinal direction, check if valid)

3. **Visual feedback**
   - Change STATE to "searching" when below threshold
   - Optionally: change grid color/aesthetic below line

**Playtest checkpoint:** Does crossing feel significant? Does the spreading create urgency without being unfair?

---

### Phase 4: Artifacts
**Goal:** Add identity-changing items with Coh rewards

**Steps:**
1. **Artifact data structure**
   ```javascript
   artifacts = [
     {
       name: "Resonance Inverter",
       description: "Distortions become Anchors. Anchors become Distortions.",
       cohBonus: 6,
       effect: "invert"
     },
     // ... more artifacts
   ]
   ```

2. **Pickup prompt**
   - On stepping on `*`, pause game
   - Display artifact info
   - Wait for Y/N input

3. **Effect implementation**
   - If accepted: apply Coh bonus, set `carriedArtifact`
   - Modify game logic based on artifact effect
   - Example: "invert" → swap distortion and anchor behaviors

4. **UI update**
   - Show carried artifact in status line
   - Update STATE to "altered"

**Playtest checkpoint:** Do artifacts feel like meaningful transformations? Is the +6 Coh enough to make them tempting?

---

### Phase 5: Polish & Balance
**Goal:** Tune numbers and refine feel

**Adjustments to test:**
- Starting Coherence (is 20 right?)
- Artifact Coh bonus (6? 8? 10?)
- Distortion spread rate (every 3 turns? 5 turns?)
- Anchor value (+10? +8? +12?)
- Threshold placement (row 5? row 6?)

**Juice to add:**
- Screen shake on Coherence loss
- Fade-in effect on distortion spawn
- Subtle sound effects (optional)
- State-based color palette shifts

---

## Technical Notes

### Recommended Stack
- **Rendering:** HTML5 Canvas or CSS Grid
- **State management:** Plain JavaScript object
- **Input:** Keyboard event listeners

### State Structure (Example)
```javascript
gameState = {
  grid: [[...], [...], ...],  // 13x13 array
  playerPos: {x: 1, y: 1},
  coherence: 20,
  belowThreshold: false,
  turnCounter: 0,
  carriedArtifact: null,
  gameOver: false,
  won: false
}
```

### Grid Representation
- Use 2D array: `grid[y][x]`
- Each cell is a string: `.`, `#`, `~`, `O`, `+`, `*`, `X`
- Player position tracked separately (@ overlays grid)

---

## Critical Design Constraints

**Do NOT add these (yet):**
- Multiple rooms/levels
- Procedural generation
- Save system
- Upgrades or meta-progression
- Enemy AI or combat

**The prototype tests one thing:** Can a single screen with irreversible decisions create tension through non-violent pressure?

---

## Success Criteria

The game works if:
1. Players feel torn about crossing the threshold
2. The spreading distortions create palpable urgency
3. Artifacts feel like identity choices, not just stat boosts
4. Knowing when to leave feels like skill, not luck
5. Losing feels like "I pushed too far" not "the game screwed me"

If any of these fail → diagnose and iterate

---

## Next Immediate Action

**Do another paper playtest** with these new rules:
- 20 starting Coh
- Cardinal-only distortion adjacency
- Distortions spread after crossing threshold
- Simulate 2-3 full runs on paper

Then: build Phase 1 (movement + coherence drain)

---

## Philosophy

> "Depth through restraint"

Every feature must justify its existence. If something doesn't serve the core tension (knowing when to stop), cut it.

The game is a meditation on restraint, on the wisdom of leaving with enough rather than risking everything for more.

Let the symbols be abstract. Let the meaning emerge.

---

*End of Document*
