# Journey
*(working title)*

A gentle, meditative, story‑builder / deck‑builder experience inspired by **Coherence**. Designed to be kid‑friendly, calming, and reflective rather than goal‑driven or competitive.

---

## 1. Core Vision

**Journey** is about building a *cohesive story* one card at a time.

There is no failure state.
There is no winning.

Instead, the player is guided by a small wizard‑like character (robotic, calm, and observant) who reflects on the story as it unfolds.

The experience should feel:
- Cozy
- Slow
- Safe
- Curious
- Slightly magical

---

## 2. Core Gameplay Loop

1. Player is presented with **3 cards**
2. Each card represents a **story fragment**
3. Player selects **1 card**
4. Card is added to the growing story
5. The wizard reacts with:
   - A short spoken line (text + optional TTS)
   - A visual emote or state change
6. Loop repeats

Optional:
- Player can review the story so far at any time
- Session ends gently after a set number of cards (e.g. 12–20)

---

## 3. Cards

### Card Types (initial)
- **Character** – someone or something enters the story
- **Place** – a location or environment
- **Action** – something happens
- **Object** – an item of meaning
- **Tone** – shifts the emotional color

### Card Metadata (hidden)
Each card includes simple tags used for coherence tracking:
- `role` (character, place, action, object, tone)
- `tone` (calm, hopeful, strange, tense, warm)
- `theme` (nature, machine, journey, home, mystery)
- `weight` (light / heavy)

---

## 4. Coherence System

Coherence is *not* correctness.

It measures how gently the story flows.

Tracked softly:
- Repeated themes (good)
- Extreme tonal swings (not bad, just noted)
- Unresolved elements
- Returning ideas

Coherence influences:
- Wizard dialogue tone
- Wizard visual state

No numeric score is shown to the player.

---

## 5. The Wizard Character

### Role
- Shopkeeper / guide / scribe
- Smaller than Beep (about 1/4 size)
- Calm, non‑judgmental presence

### Personality
- Observant
- Curious
- Gently reflective
- Never critical

### Visual States
- Calm (soft glow)
- Curious (lean‑in, brighter eyes)
- Unsettled (faint flicker)
- Pleased (warm glow)

### Dialogue Principles
- Never says the player is wrong
- Never gives instructions
- Speaks in short reflections

Examples:
- “That fits quietly with what came before.”
- “The story leans somewhere new now.”
- “A thread has returned.”

---

## 6. Dialogue System (Phase‑Based)

### Phase 1 – Local Only (Initial Build)
- Hand‑written dialogue stored in JSON
- Triggered by:
  - Card tags
  - Coherence shifts
  - Simple patterns

### Phase 2 – Optional API Enhancement
- Periodic API calls for reflective lines
- API text reacts to state but never controls mechanics
- Wizard visuals always driven locally

API usage is optional and can be toggled.

---

## 7. Audio

- Soft ambient background sound
- Wizard voice:
  - Robotic
  - Calm
  - Neutral gender
- TTS optional and can be disabled

---

## 8. UI / Aesthetic

- Minimal interface
- Large readable cards
- Gentle animations
- No timers
- No alerts or sharp transitions

Strong alignment with **Coherence** aesthetic.

---

## 9. Technical Structure (High Level)

- Static HTML / CSS / JS
- Card data via JSON
- Wizard dialogue via JSON (+ optional API proxy)
- GitHub Pages compatible

---

## 10. MVP Scope

**Must Have**
- Card draw + selection
- Story log
- Wizard reactions
- Coherence tracking

**Nice to Have**
- TTS toggle
- Session end summary
- Gentle visual polish

---

## 11. Guiding Principle

Journey should feel like:

> Someone quietly sitting with you
> while you tell yourself a story

Not teaching.
Not judging.
Just witnessing.


---

## 12. Story Beats System (Detailed)

To strengthen narrative cohesion without turning *Journey* into a rigid choose-your-own-adventure, each card will carry a **hidden story beat**.

- The **card face** remains vague, poetic, and open-ended.
- The **story beat** is a concrete sentence fragment used only during narration.
- Beats are stitched together at the end to form a complete story.

This allows the player to feel authorship while Beep/Wizard acts as a storyteller rather than a judge.

---

## 13. Story Timing & Flow

### Story Construction Phase
- Player selects cards one by one.
- After each selection:
  - Wizard offers brief, vague commentary.
  - Beat is stored silently.

### Storytelling Phase
- Triggered by:
  - A **Tell Story** button (enabled after 6–8 cards), **or**
  - Automatic trigger at a maximum card count (e.g. 12).

- Wizard narrates the story aloud by reading the stitched beats.
- Optional: short pauses between beats for rhythm.

---

## 14. Beat Stitching Rules (Simple)

To keep the output gentle and readable:

- First beat is prefixed with **"Once,"** or **"At the beginning,"**
- Middle beats are joined with **"Then,"** or **"Along the way,"**
- Final beat is prefixed with **"At last,"** or **"In the end,"**

No grammar perfection required — slight awkwardness feels handmade and human.

---

## 15. Example Cards & Story Beats (v1)

Below are ten example cards showing the separation between **card text** and **story beat**.

```json
[
  {
    "id": "wanderer",
    "cardText": "A wanderer appears on the road.",
    "beat": "someone set out without knowing where the path would lead"
  },
  {
    "id": "threshold",
    "cardText": "A threshold waits to be crossed.",
    "beat": "they reached a place where turning back felt heavier than going forward"
  },
  {
    "id": "lantern",
    "cardText": "A lantern is lit at dusk.",
    "beat": "a small light was carried, not to banish the dark, but to soften it"
  },
  {
    "id": "keeper",
    "cardText": "A quiet keeper watches from the edge.",
    "beat": "someone was seen by another who did not speak, but remembered"
  },
  {
    "id": "key",
    "cardText": "A key is found, warm to the touch.",
    "beat": "an answer was discovered before the question was fully understood"
  },
  {
    "id": "storm",
    "cardText": "A storm passes overhead.",
    "beat": "things became difficult for a while, and nothing could be hurried"
  },
  {
    "id": "rest",
    "cardText": "A moment of rest is taken.",
    "beat": "they stopped, long enough to remember why they had begun"
  },
  {
    "id": "companion",
    "cardText": "A companion walks beside you.",
    "beat": "the journey was no longer carried alone"
  },
  {
    "id": "return",
    "cardText": "The path curves back toward home.",
    "beat": "the road eventually turned, as all roads do"
  },
  {
    "id": "quiet_end",
    "cardText": "Something settles into place.",
    "beat": "and what remained was not an ending, but a gentle holding"
  }
]
```

---

## 16. Why This Works

- Cards stay **mysterious**
- Stories feel **intentional**
- Kids can enjoy the surface meaning
- Adults feel the narrative arc
- No branching logic required

The player doesn’t solve the story.
They *grow* it.

---

## 17. Future Extensions (Optional)

- Beat variants by tone (same card, different sentence)
- Rare beats that only appear after certain patterns
- Chapter-style narration every 3 cards
- Printable story export

None of these are required for the core experience.

