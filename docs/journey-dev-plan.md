# Journey

*(working title, game plan)*

A gentle, meditative, story‑builder / deck‑builder experience inspired by **Coherence**. Designed to be kid‑friendly, calming, and reflective rather than goal‑driven or competitive.

---
in /docs is cards.html and beep.html I want the card system from cards.html and I want a robot wizard who can talk to you through text to speech. The robot wizard should be a quarter the size of beep.

The play pop-up to initiate the music should be a card.  that matches the game cards.

Music file is jaunt.mp3 in /music

Lets start with all js and no api calls, we'll visit that later if we want but for now lets go all js local driven.

## 1. Core Vision

**Journey** is about building a *cohesive story* one card at a time.

There is no failure state.
There is no winning.

Instead, the player is guided by a small wizard‑like character (robotic, calm, and observant) who reflects on the story as it unfolds.

The experience should feel:

* Cozy
* Slow
* Safe
* Curious
* Slightly magical

---

## 2. Core Gameplay Loop

1. Player is presented with **3 cards**
2. Each card represents a **story fragment**
3. Player selects **1 card**
4. Card is added to the growing story
5. The wizard reacts with:

   * A short spoken line (text + optional TTS)
   * A visual emote or state change
6. Loop repeats

Optional:

* Player can review the story so far at any time
* Session ends gently after a set number of cards (e.g. 12–20)

---

## 3. Cards

### Card Types (initial)

* **Character** – someone or something enters the story
* **Place** – a location or environment
* **Action** – something happens
* **Object** – an item of meaning
* **Tone** – shifts the emotional color

### Card Metadata (hidden)

Each card includes simple tags used for coherence tracking:

* `role` (character, place, action, object, tone)
* `tone` (calm, hopeful, strange, tense, warm)
* `theme` (nature, machine, journey, home, mystery)
* `weight` (light / heavy)

---

## 4. Coherence System

Coherence is *not* correctness.

It measures how gently the story flows.

Tracked softly:

* Repeated themes (good)
* Extreme tonal swings (not bad, just noted)
* Unresolved elements
* Returning ideas

Coherence influences:

* Wizard dialogue tone
* Wizard visual state

No numeric score is shown to the player.

---

## 5. The Wizard Character

### Role

* Shopkeeper / guide / scribe
* Smaller than Beep (about 1/4 size)
* Calm, non‑judgmental presence

### Personality

* Observant
* Curious
* Gently reflective
* Never critical

### Visual States

* Calm (soft glow)
* Curious (lean‑in, brighter eyes)
* Unsettled (faint flicker)
* Pleased (warm glow)

### Dialogue Principles

* Never says the player is wrong
* Never gives instructions
* Speaks in short reflections

Examples:

* “That fits quietly with what came before.”
* “The story leans somewhere new now.”
* “A thread has returned.”

---

## 6. Dialogue System (Phase‑Based)

### Phase 1 – Local Only (Initial Build)

* Hand‑written dialogue stored in JSON
* Triggered by:

  * Card tags
  * Coherence shifts
  * Simple patterns

### Phase 2 – Optional API Enhancement

* Periodic API calls for reflective lines
* API text reacts to state but never controls mechanics
* Wizard visuals always driven locally

API usage is optional and can be toggled.

---

## 7. Audio

* Soft ambient background sound
* Wizard voice:

  * Robotic
  * Calm
  * Neutral gender
* TTS optional and can be disabled

---

## 8. UI / Aesthetic

* Minimal interface
* Large readable cards
* Gentle animations
* No timers
* No alerts or sharp transitions

Strong alignment with **Coherence** aesthetic.

---

## 9. Technical Structure (High Level)

* Static HTML / CSS / JS
* Card data via JSON
* Wizard dialogue via JSON (+ optional API proxy)
* GitHub Pages compatible

---

## 10. MVP Scope

**Must Have**

* Card draw + selection
* Story log
* Wizard reactions
* Coherence tracking

**Nice to Have**

* TTS toggle
* Session end summary
* Gentle visual polish

---

## 11. Guiding Principle

Journey should feel like:

> Someone quietly sitting with you
> while you tell yourself a story

Not teaching.
Not judging.
Just witnessing.
