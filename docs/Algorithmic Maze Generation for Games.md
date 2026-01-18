That insight about "navigable paths" is the key. You want the Distortion to be an obstacle that creates a **maze**, not a wall that seals you in.  
If you stick to pure **Option 2 (Density Decay)**, you run a slight risk: density rules often act like "surface tension" on water. They try to minimize surface area, which naturally rounds off jagged edges and fills in the "coves" and "bays" where a player might want to hide or explore. It eventually becomes a solid blob.  
To keep those paths open while using a density-style logic, you just need to invert the rule slightly. Instead of "checking the source," you "check the destination."  
Here is the **"Coral Growth"** algorithm (a variation on Option 2 tailored for navigable paths):

### **The "Coral Growth" Rule**

This ensures the Distortion grows in tendrils (like frost on a window or coral) rather than a blob. It guarantees gaps.  
The Logic:  
When a Distortion cell tries to spread to an empty Neighbor Tile, it asks: "Is this empty tile already too crowded?"  
**The Math:**

1. **Select:** Pick a random active Distortion cell.  
2. **Target:** Pick a random empty neighbor (North, South, East, or West).  
3. **Check:** Count how many **Distortion** neighbors that *target* tile already has.  
   * If Target has **1** Distortion neighbor (just the parent): **Allow Spread.**  
   * If Target has **\> 1** Distortion neighbor: **Cancel Spread.**

Why this preserves paths:  
This rule forbids the Distortion from closing small loops or filling in corners.

* It cannot fill a "corner" because a corner spot has 2 Distortion neighbors.  
* It creates long, winding 1-tile-thick branches.  
* It leaves **perfect navigable paths** because the branches can never fuse together to form a solid wall unless they meet head-on from a distance (which is rare and slow).

### 

### **Visualizing the difference**

Aggressive / Blob Growth (Standard):  
(Fills every available space)

Plaintext

⬛⬛⬛⬛  
⬛⬛⬛⬛  \<-- Player gets crushed  
⬛⬛⬛⬛

Coral Growth (Your "Navigable" Goal):  
(Leaves negative space)

Plaintext

⬛⬜⬛⬜  
⬛⬜⬛⬛  \<-- Player can slip through here  
⬜⬜⬜⬛

### **Implementation in your Game Loop**

Since you are concerned about "aggressive growth" in your notes, combining this Coral Rule with your "One Spread Per Cycle" idea creates a very "calm" pressure.  
Here is the pseudocode logic for that specific mechanic:

JavaScript

function runCycle() {  
  // 1\. Get all potential growth spots (empty tiles next to distortion)  
  let candidates \= getAllGrowthCandidates();  
    
  // 2\. Filter them by the "Coral Rule" (The Crowding Threshold)  
  let validMoves \= candidates.filter(target \=\> {  
    let neighborCount \= countDistortedNeighbors(target);  
    return neighborCount \< 2; // Only grow if it won't touch another branch  
  });

  // 3\. Execute ONE spread (The "Calm" Pacing)  
  if (validMoves.length \> 0\) {  
    let chosen \= randomPick(validMoves);  
    grid\[chosen.x\]\[chosen.y\] \= DISTORTION;  
  }  
}

This creates a procedural maze that builds itself around the player, rather than an infection trying to eat them. Does that "Branching" visual fit the *Coherence* vibe?