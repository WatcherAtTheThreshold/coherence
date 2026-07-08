# Hub Day — Idea Capture

> Seed notes, not a spec. Captured mid-ideation, July 2026.

---

## The Day Structure

wake → routine (Daily Routine, home) → yard (Continuous State as building/tending)
→ work (Soft Drift in summer / Cold Drift in winter) → evening walk (Journey, branching)
→ fire (Ember) or wizard battle (Wizard Masters, framed as story/dream) → sleep → next day

- Seasons are the meta-clock. A full run might be one year (or four days, one per season).
- Coherence (the roguelike) is played diegetically: it's a retro game on the PC
  at Daily Routine's Workstation. The CRT scanlines become literal — a screen
  within a screen. Slots into the existing "Logic Leak" coming-soon hole.

---

## Hidden Coherence (the day-state)

**Core idea: the only place coherence is a visible number is inside the video
game the character plays.** Games quantify; days don't. Outside the PC game,
the stat never appears — the day just responds.

- Effects are behind the scenes: less wood at Ember, busier pace at Soft Drift,
  heavier deck on the evening walk, character moves a touch slower.
- **Legible in retrospect, not in the moment.** Small cues (wizard dialogue,
  waking tired after a late night at the computer) let attentive players form
  the theory. Mystery that rewards attention — but not unsolvable.
- **Input is manner, not score.** What drains the day is how you moved through
  it: rushing, overreaching. Pushing past the threshold in the PC game is
  optimal *game* play — and costs the evening. The game teaches by charging
  the fiction around it.
- Not one shared stat so much as shared weather. Each game has a translation:
  coherence → wood (Ember), order pace (Soft Drift), deck contents (Journey),
  starting coherence (the PC game).
- Player experiences good/bad days and weathers them. No min-maxing, no meter.

**Mechanism:** shared localStorage key (Ember already uses localStorage), e.g.
`day-state: { day, season, coherence, flags }`. Each game reads on load,
writes on exit. No key present = freeplay mode; every game stays standalone.
The hub becomes the day-manager, not a menu.

---

## The Garden Roguelike (don't forget)

A soft roguelike: a tiny settlement or garden that persists and grows, using
the Wizard Masters character palette. The "roguelike" part is that seasons or
drift can end a run. Simulation-forward, Dwarf-Fortress-adjacent in spirit —
watching a small world develop, intervening gently.

**Where it probably lives:** it's already in the plan at a different zoom.
The yard IS the settlement — Continuous State as daily yard work, the water
feature persisting and growing day over day, seasons advancing, winter or
drift able to end the year. The seed grows from a piece already placed.

Could still become its own standalone game later. The seed lives in the yard.

---

## Smallest playable slice

One hardcoded day: Daily Routine → Coherence on the PC → Ember, with wood
count set by how the day went. Three existing games, one localStorage key,
one evening.
