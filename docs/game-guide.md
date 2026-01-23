# Coherence Hub - Game Guide

*Four meditations on presence, patience, and the quiet act of tending*

---

## Overview

The Coherence hub contains four browser-based HTML5 games that share a unified aesthetic and philosophy. Each game explores themes of presence, patience, and gentle interaction with systems.

**Shared Features:**
- Ambient procedural audio and music
- Earthy, muted color palettes
- IBM Plex Mono + Cormorant Garamond typography
- Mobile-responsive design with touch support
- No time pressure or fail states (except Coherence)

---

## Coherence

*Signal Decay Protocol*

### Concept
Navigate a dissolving digital space. Collect artifacts to unlock the exit and escape before your coherence collapses entirely.

### Controls
- **Arrow Keys / WASD**: Move in four directions
- **Mobile**: On-screen directional buttons
- **Enter/Space**: Confirm dialog choices

### Rules

**Objective**: Find an artifact, then reach the exit before your coherence reaches zero.

**The Grid (16x16)**:
| Tile | Appearance | Effect |
|------|------------|--------|
| Player | Green, pulsing | Your position |
| Ground | Dark, subtle | Safe to walk |
| Boundary | Dark blue | Impassable walls |
| Threshold | Orange line | Crossing triggers distortion spreading |
| Distortion | Pink, flickering | Damages coherence (-2 when standing, -1 when adjacent) |
| Anchor | Cyan, glowing | Restores +10 coherence (one-time use) |
| Artifact | Gold, sparkling | Collectible items with unique effects |
| Exit | Bright green | Win condition (requires artifact) |

**Coherence System**:
- Starts at 20
- Each move costs 1 coherence
- Adjacent to distortion: -1 per turn
- Standing on distortion: -2 per turn
- Reaches 0 = Game Over

**Threshold Mechanics**:
- The orange threshold line divides the grid
- Crossing it activates distortion spreading
- Distortions grow every 3 turns using "coral growth" rules
- More artifacts are located below the threshold

### Artifacts

Each artifact provides an immediate coherence bonus plus a persistent effect:

| Artifact | Bonus | Effect |
|----------|-------|--------|
| Resonance Inverter | +6 | Distortions heal you, anchors hurt you |
| Clarity Lens | +6 | +1 drain per turn (trade-off for the bonus) |
| Severance | +6 | Immune to distortion damage, anchors disabled |
| Temporal Echo | +8 | Every 5th move is free |
| Void Compass | +5 | Reduced drain, slower distortion spread |
| Harmonic Beacon | +4 | Anchors restore +15, but distortions spread faster |

**Artifact Rules**:
- You can only carry one artifact
- Finding a second artifact lets you trade or decline
- You must collect at least one artifact to unlock the exit

### Strategy Tips
- Plan your route before crossing the threshold
- Use anchors strategically - they're one-time use
- Artifacts below the threshold are riskier but more rewarding
- Watch the distortion spread patterns - they leave navigable paths

---

## Continuous State

*Observe, Intervene, Wait*

### Concept
Tend a system of settling tiles. Watch stress accumulate and release. Find stillness through gentle intervention.

### Controls
- **Click & Drag**: Move tiles
- **Touch & Drag**: Mobile tile movement
- **Rest Button**: Enter peaceful listening mode

### Rules

**The System**:
- ~50 tiles of varying types arranged in a precarious structure
- Tiles have physics: gravity, friction, collision
- Tiles settle naturally over time
- Intervention costs a small amount of coherence

**Tile Types**:
| Type | Weight | Appearance |
|------|--------|------------|
| Stone | 3 | Dark grey, heavy |
| Soil | 2 | Brown/clay, medium |
| Moss | 1 | Green, light |
| Water | 1 | Blue, light |

**Stress System**:
- Tiles gain stress when unsupported or bearing weight
- Stress levels: Normal → Strained → Stressed → Cracked
- Cracked tiles may suddenly shift or fall
- Stress naturally decays over time

**Coherence States**:
| State | Coherence | Meaning |
|-------|-----------|---------|
| Stillness | 65-100 | System at rest, minimal movement |
| Settling | 35-65 | Some movement, finding balance |
| Turbulence | 0-35 | Active collapse or reorganization |

**Music System**:
- Two ambient tracks crossfade based on coherence
- High coherence = calm ambient
- Low coherence = tense ambient

### How to Play
1. Observe the initial arrangement
2. Watch for stressed tiles (shaking, color change)
3. Gently drag tiles to relieve stress or support others
4. Wait for the system to settle
5. Repeat as desired - there is no win condition

### Rest Mode
- Click "rest" to stop physics and listen to music
- Tracks play sequentially in a peaceful loop
- Click "wake" to return to the simulation
- This is not a failure state - just contemplation

---

## Soft Drift

*Tend the Stall*

### Concept
Run a quiet market stall. Fulfill simple orders. Watch days pass. Small satisfactions in small exchanges.

### Controls
- **Click & Drag**: Pick up and deliver cubes
- **Touch & Drag**: Mobile cube handling

### Rules

**The Stall**:
- You manage a shelf with 8 colored cubes
- Customers arrive from both sides with orders
- Orders consist of 1-2 cubes of specific colors
- Drag matching cubes to customers to fulfill orders

**Cube Colors**:
- Warm red-orange
- Sage green
- Soft blue
- Golden yellow
- Dusty rose
- Muted purple
- Earthy brown
- Soft teal

**Customer Patience System**:
| Wait Time | Hearts | Sound | Meaning |
|-----------|--------|-------|---------|
| 0-5 seconds | 3 hearts | Bright chime | Immediate service |
| 5-12 seconds | 2 hearts | Pleasant tone | Waited a bit |
| 12-20 seconds | 1 heart | Single soft tone | Waited long |
| 20+ seconds | 0 hearts | - | Customer leaves |

**Scoring**:
- Streak counter tracks consecutive satisfied customers
- Streak resets if a customer leaves unsatisfied
- Streak resets at the end of each day
- Best streak is tracked (potential for localStorage persistence)

**Day Cycle**:
- Each day lasts 90 seconds
- Sky colors shift from dawn to dusk
- Night transition fades out and starts a new day
- Customers and cubes refresh each day

### Ambient Elements
- Birds, cats, and butterflies drift in the background
- Sky color transitions through time of day
- Ambient animals are purely decorative

### Easter Egg
- 5% chance for a wizard customer (crossover from Wizard Masters)
- Wizards wear pointy hats and robes with elemental gems
- They function the same as regular customers

---

## Wizard Masters

*Elemental Tactics*

### Concept
Command elemental wizards on a tactical board. Move, capture, outlast. Simple rules, quiet strategy.

### Controls
- **Click & Drag**: Move your wizards
- **Click Wizard**: Trigger emote animation
- **Touch & Drag**: Mobile wizard movement
- **New Game Button**: Reset the board

### Rules

**The Board**:
- 11x11 grid (responsive to screen size, scales up on larger displays)
- Player wizards start on the left (columns 0-1)
- Enemy wizards start on the right (columns 9-10)
- Each side has ~14 wizards
- Defeated wizards walk off the board to their respective sides

**Movement**:
- Wizards move like chess kings: one square in any direction
- Cannot move onto friendly wizards
- Moving onto enemy wizards initiates capture

**Elements**:
| Element | Color | Beats |
|---------|-------|-------|
| Fire | Red-orange | Earth, Air |
| Water | Blue | Fire, Electric |
| Earth | Green | Water, Electric |
| Air | Silver-grey | Water, Earth |
| Electric | Yellow | Air, Cosmic |
| Cosmic | Purple | Fire, Cosmic |

**Elemental Advantage System**:
- **Advantage** (green highlight): Capture succeeds normally
- **Neutral** (yellow highlight): Capture succeeds normally
- **Disadvantage** (red highlight): Defender escapes to adjacent square

**Capture Mechanics**:
- Attacker always moves to the target square
- Defender is captured (advantage/neutral) or escapes (disadvantage)
- Captured wizards appear in the "fallen" area
- Capture creates particle effects and scorch marks

**Victory Condition**:
- Capture all enemy wizards = Victory
- Lose all your wizards = Defeat

### AI Behavior
The enemy AI:
- Prioritizes captures over regular moves
- Prefers advancing toward the player side
- Adds slight randomness to prevent predictability

### Visual Features
- **Emotes**: Click any wizard to trigger a bounce animation with sparkles
- **Scorch Marks**: Captures leave fading elemental marks on the board
- **Particles**: Capture explosions and deflection effects
- **Wizard Variety**: Random skin tones, robe colors, and hat styles
- **Idle Breathing**: Wizards gently bob when at rest
- **Selection Pulse**: Selected wizard glows with a pulsing ring
- **Element-Specific Auras**:
  - Fire: Flickering heat shimmer
  - Air: Orbiting wind arcs
  - Earth: Weighted glow at feet
  - Electric: Jittery static with occasional sparks
  - Water: Gentle ripple rings
  - Cosmic: Twinkling star particles
- **Ambient Dust**: Floating motes drift across the board
- **Turn Indicator**: Board edge glows in your team color

### Strategy Tips
- Check elemental matchups before attacking (watch the highlight colors)
- Green = safe attack, Yellow = neutral, Red = they might escape
- Position wizards to cover each other
- The AI tends to advance - use this to set traps
- Cosmic vs Cosmic is always neutral (self-referential)

---

## Shared Philosophy

These games share a design philosophy:

1. **Presence over Progress**: No leaderboards, no unlocks, no pressure
2. **Tending over Winning**: The act of engaging is the reward
3. **Ambient Atmosphere**: Music and visuals create calm spaces
4. **Gentle Mechanics**: Actions have consequences but rarely punishments
5. **Quiet Completion**: Endings are transitions, not triumphs

---

## Technical Notes

**Browser Support**:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Web Audio API required for sound effects
- Touch support for mobile devices

**Audio**:
- Click "Begin" or "Start" to initialize audio context
- Procedural sound effects via Web Audio API oscillators
- Looping ambient music tracks

**Mobile**:
- Responsive canvas sizing
- Touch-friendly controls
- Portrait and landscape support

---

*games about being present*
*not winning, just tending*
*not rushing, just being*
