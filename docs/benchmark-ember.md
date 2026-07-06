# Ember — The Quality Benchmark

Ember (`ember.html`) was built as the reference for what "up to par" means in this
collection. When revisiting the other games, measure them against this checklist —
every item below is implemented in Ember and can be inspected there.

## The Bar

### Game design
- [ ] **A real risk/reward loop.** The core tension must exist in the *mechanics*, not
      just the fiction. In Ember: a bright fire attracts gift-giving wanderers but burns
      wood faster; a low fire is cheap but cold and lonely. Both are viable; they produce
      different endings. (Contrast: Coherence's threshold, where optimal play ignores
      the entire risk half of the game.)
- [ ] **A session arc.** Beginning, rising tension, peak (the coldest hour), resolution
      (dawn). ~5 minutes. Even "endless" games need some arc per sitting.
- [ ] **Tiered endings that reflect how you played**, not just whether you survived.
- [ ] **Degenerate strategies must lose.** Ember's balance was verified by simulation:
      breath-spam, idling, and fuel-dumping all fail; skilled and cautious play both
      survive. If a single repeated action beats the game, the game isn't done.
- [ ] **Teach through play.** One-line contextual hints at the moment they matter
      ("the wind rises…", "tap the flames to breathe on the embers"). No instruction walls.

### Respect for the player
- [ ] **Persistence.** localStorage remembers nights kept, souls warmed, best night,
      and the mute setting. Meditative games especially need memory across visits.
      Wrap in try/catch (private browsing).
- [ ] **Instant restart** — reset state in place. Never `location.reload()`; never make
      the player click through the audio-init overlay twice.
- [ ] **Mute control** (persisted), visible at all times. M as shortcut.
- [ ] **A way back to the hub** from inside the game, and from the end screen.
- [ ] **Pause when the tab is hidden** (`visibilitychange`) — a real-time fire must not
      die while the player answers a text.
- [ ] **`prefers-reduced-motion`** honored: fewer particles, no flicker/bob.
- [ ] **Keyboard + pointer + touch** all work. Overlay buttons reachable by keyboard.

### Craft
- [ ] **Delta-time game loop** via requestAnimationFrame, clamped dt.
- [ ] **Feedback on every action**: sound + visual flare for logs and breath, progress
      ticks over wanderers' heads, captions for every event that changes state.
- [ ] **Procedural audio only** — crackle, wind, chimes from Web Audio; ambient drone
      instead of MP3s. Zero audio assets (the music/ folder is already ~38MB).
- [ ] **Bounded particle arrays**, no allocation leaks, no full-DOM rebuilds per frame.
- [ ] **The title screen doubles as the audio-init gesture** — one click, not two.

## How Ember was verified
- Script block syntax-checked with `node --check`.
- Balance verified by bot simulation (60 nights per strategy): bright keeper,
  cautious keeper, breath-spammer, idler, fuel-dumper. See the session scratchpad
  `ember-sim.js` pattern — stub the DOM, drive `update(dt)` directly, assert on
  survival rates and warmed counts.

## Applying the bar to the existing games (from the July 2026 review)
1. **Coherence**: implement the artifact-depth ending tiers (its risk half is currently
   a strict trap); stable grid cells instead of innerHTML rebuilds; in-place restart.
2. **All games**: back-to-hub link, mute toggle, one persisted number each.
3. **Hub**: add the missing Daily Routine card (or bench the game); fix "six meditations".
4. **Soft Drift**: persist `bestStreak` — it already exists in memory.
