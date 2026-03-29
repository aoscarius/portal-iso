// ── Chamber 06: Complex Portal Puzzle ───────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 6,
    name: 'CHAMBER 06 — ADVANCED TESTING',
    hint: 'Use portals creatively. The exit is behind the wall.',
    width: 14, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,2,2,2,2,2,2,9,9,9,2],
      [2,9,1,9,2,1,1,1,1,2,9,1,9,2],
      [2,9,1,9,2,1,5,1,1,2,9,4,9,2],
      [2,9,9,9,2,1,1,1,1,2,9,9,9,2],
      [2,1,1,1,2,1,1,1,1,2,1,1,1,2],
      [2,1,1,1,2,2,6,2,2,2,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:6,z:5}, door: {x:6,z:8} }],
    amica: "Excellent. You are thinking with portals. Most test subjects never reach this conclusion.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[6] = [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 06. Advanced portal routing.",
      "The exit is in a sealed alcove. You cannot reach it directly.",
      "You will need to place portals creatively — using the marked walls — to reach areas that appear inaccessible.",
      "Think about where you need to go, then work backward to where portals should be placed.",
    ]},
    { trigger: 'portal_first', speaker: 'core', lines: [
      "Portal placed. Now place the second one on a wall near your destination.",
      "Remember: you travel from one portal to the other. Either direction works.",
    ]},
    { trigger: 'button', speaker: 'amica', lines: [
      "Button activated. A door somewhere has opened.",
      "Explore the chamber — the route to the exit may now be clear.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Impressive. You found the path through multiple portal hops.",
      "You are now thinking with portals. This is either progress or a warning sign.",
    ]},
  ];
