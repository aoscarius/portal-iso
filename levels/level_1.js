// ── Chamber 01: Introduction ────────────────────────────
// Rows from top (z=0) to bottom (z=height-1)

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 1,
    name: 'CHAMBER 01 — AWAKENING',
    hint: 'Reach the exit. Walk forward.',
    width: 8, height: 8,
    
    grid: [
      [2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,2],
      [2,1,1,1,1,4,1,2],
      [2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2],
    ],
    amica: "Good morning. You have been in suspension for... a while. Please proceed to the exit.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[1] = [
    { trigger: 'start', speaker: 'amica', lines: [
      "Oh. You're awake.",
      "I was beginning to wonder if the re-animation process had failed. It does that sometimes. Not often. Occasionally.",
      "You are currently in Test Chamber 01. Your objective is simple: reach the glowing green exit panel.",
      "Use the WASD keys or arrow keys to move. Try not to walk into walls. This is harder than it sounds, statistically.",
    ]},
    { trigger: 'step_3', speaker: 'system', lines: [
      "APERTURE SCIENCE MOVEMENT PROTOCOL",
      "W / ↑ = move up-left   S / ↓ = move down-right",
      "A / ← = move left      D / → = move right",
      "The exit tile glows green. You cannot miss it. Unless you try.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "You reached the exit. I am... not surprised.",
      "That was the easiest test in the facility. Congratulations on clearing the absolute minimum.",
    ]},
  ];
