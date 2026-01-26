# Card Spread Component

> Extracted from **Shadows of the Deck** for reuse as navigation links or other card-based UI.

## Overview

Two spread styles available:
- **Hand spread** - Fanned out with rotation (like holding cards)
- **Market spread** - Horizontal overlap, no rotation (like cards on a table)

Both feature:
- Overlapping cards that spread on hover
- Individual card lift + scale on hover
- Smooth transitions
- Works with any number of cards (1-6 recommended)

---

## Quick Start HTML

```html
<!-- Container for the cards -->
<div id="card-container" class="card-spread">

  <!-- Each card is an anchor tag -->
  <a href="game1.html" class="card-flip">
    <div class="card-flip-inner">
      <div class="card-front">
        <div class="card-title">Game Title</div>
        <div class="card-subtitle">Description</div>
      </div>
    </div>
  </a>

  <a href="game2.html" class="card-flip">
    <div class="card-flip-inner">
      <div class="card-front">
        <div class="card-title">Another Game</div>
        <div class="card-subtitle">Description</div>
      </div>
    </div>
  </a>

  <!-- Add more cards as needed -->

</div>
```

---

## Core CSS (Required)

```css
/* ========== CARD CONTAINER ========== */
.card-spread {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 20px 0;
  min-height: 200px;
}

/* ========== BASE CARD ========== */
.card-flip {
  width: 120px;
  height: 170px;
  position: relative;
  cursor: pointer;
  transition: all 0.4s ease;
  z-index: 1;
  text-decoration: none; /* For anchor tags */
}

.card-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px 8px;
  box-sizing: border-box;

  /* Default styling - customize these */
  background: linear-gradient(135deg,
    rgba(25, 25, 45, 0.98) 0%,
    rgba(15, 15, 35, 0.95) 30%,
    rgba(20, 20, 40, 0.98) 70%,
    rgba(10, 10, 30, 0.95) 100%);
  border: 2px solid rgba(138, 43, 226, 0.4);
  color: #f5f5f5;
  font-size: 1.1em;

  /* For background images */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.card-front:hover {
  border-color: rgba(222, 184, 135, 0.8);
  box-shadow: 0 5px 15px rgba(222, 184, 135, 0.3);
}

/* Card text styling */
.card-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.card-subtitle {
  font-size: 0.85em;
  opacity: 0.8;
}
```

---

## Hand Spread Style (Fanned with Rotation)

```css
/* ========== HAND SPREAD - FANNED CARDS ========== */
.card-spread.hand-style .card-flip {
  margin-left: -30px;
  transform-origin: bottom center;
}

.card-spread.hand-style .card-flip:first-child {
  margin-left: 0;
}

/* Fan rotation - adjust angles as needed */
.card-spread.hand-style .card-flip:nth-child(1) { transform: rotate(-8deg); }
.card-spread.hand-style .card-flip:nth-child(2) { transform: rotate(-4deg); }
.card-spread.hand-style .card-flip:nth-child(3) { transform: rotate(0deg); }
.card-spread.hand-style .card-flip:nth-child(4) { transform: rotate(4deg); }
.card-spread.hand-style .card-flip:nth-child(5) { transform: rotate(8deg); }
.card-spread.hand-style .card-flip:nth-child(6) { transform: rotate(10deg); }

/* Container hover - cards spread apart */
.card-spread.hand-style:hover .card-flip {
  margin-left: -20px;
  z-index: 2;
}

/* Individual card hover - lift and straighten */
.card-spread.hand-style .card-flip:hover {
  transform: rotate(0deg) translateY(-15px) scale(1.03) !important;
  z-index: 10 !important;
  margin-left: 15px;
  margin-right: 15px;
}
```

**Usage:**
```html
<div class="card-spread hand-style">
  <!-- cards here -->
</div>
```

---

## Market Spread Style (Horizontal Overlap)

```css
/* ========== MARKET SPREAD - HORIZONTAL CARDS ========== */
.card-spread.market-style .card-flip {
  margin-left: -25px;
  transform-origin: center center;
}

.card-spread.market-style .card-flip:first-child {
  margin-left: 0;
}

/* No rotation - cards stay horizontal */
.card-spread.market-style .card-flip {
  transform: rotate(0deg);
}

/* Container hover - cards spread apart */
.card-spread.market-style:hover .card-flip {
  margin-left: -15px;
  z-index: 2;
}

/* Individual card hover - lift and scale */
.card-spread.market-style .card-flip:hover {
  transform: translateY(-12px) scale(1.05) !important;
  z-index: 10 !important;
  margin-left: 12px;
  margin-right: 12px;
}
```

**Usage:**
```html
<div class="card-spread market-style">
  <!-- cards here -->
</div>
```

---

## Customization Guide

### Card Sizing
```css
/* Adjust card dimensions */
.card-flip {
  width: 120px;   /* Card width */
  height: 170px;  /* Card height (1.42 ratio looks good) */
}
```

### Overlap Amount
```css
/* Tighter overlap = more negative margin */
.card-spread.hand-style .card-flip { margin-left: -40px; }  /* More overlap */
.card-spread.hand-style .card-flip { margin-left: -20px; }  /* Less overlap */
```

### Fan Angle (Hand Style)
```css
/* Adjust rotation angles for different fan effects */
.card-spread.hand-style .card-flip:nth-child(1) { transform: rotate(-12deg); } /* Wider fan */
.card-spread.hand-style .card-flip:nth-child(5) { transform: rotate(12deg); }
```

### Colors & Borders
```css
/* Purple theme (default) */
.card-front {
  border: 2px solid rgba(138, 43, 226, 0.4);
}
.card-front:hover {
  border-color: rgba(222, 184, 135, 0.8);
  box-shadow: 0 5px 15px rgba(222, 184, 135, 0.3);
}

/* Blue theme */
.card-front {
  border: 2px solid rgba(66, 135, 245, 0.4);
}
.card-front:hover {
  border-color: rgba(100, 180, 255, 0.8);
  box-shadow: 0 5px 15px rgba(100, 180, 255, 0.3);
}
```

### Background Images
```css
/* Per-card backgrounds using data attributes */
[data-game="game1"] .card-front {
  background-image:
    linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%),
    url('images/game1-thumb.png');
}

[data-game="game2"] .card-front {
  background-image:
    linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%),
    url('images/game2-thumb.png');
}
```

```html
<a href="game1.html" class="card-flip" data-game="game1">
```

---

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #1a1a2e;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Paste Core CSS here */
    /* Paste Hand or Market style here */

  </style>
</head>
<body>

  <div class="card-spread hand-style">
    <a href="game1.html" class="card-flip">
      <div class="card-flip-inner">
        <div class="card-front">
          <div class="card-title">Shadows of the Deck</div>
          <div class="card-subtitle">Deck Builder</div>
        </div>
      </div>
    </a>

    <a href="game2.html" class="card-flip">
      <div class="card-flip-inner">
        <div class="card-front">
          <div class="card-title">Next Game</div>
          <div class="card-subtitle">Coming Soon</div>
        </div>
      </div>
    </a>

    <a href="game3.html" class="card-flip">
      <div class="card-flip-inner">
        <div class="card-front">
          <div class="card-title">Another Game</div>
          <div class="card-subtitle">Puzzle</div>
        </div>
      </div>
    </a>
  </div>

</body>
</html>
```

---

## Source Reference

Extracted from: `shadows-of-the-deck/style.css`
- Lines 1432-1520: Base card system
- Lines 1443-1471: Hand spread (player-hand)
- Lines 1473-1519: Market spread
- Lines 1521-1590: Card visual styles

Original context: Cards were interactive game elements. This adaptation makes them work as static navigation links.
