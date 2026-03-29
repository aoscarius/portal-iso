// ── Chamber 03: Button & Door ────────────────────────────
// Link button at (4,4) to door at (5,6)

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 3,
    name: 'CHAMBER 03 — PRESSURE PLATES',
    hint: 'Step on the button to open the door, then reach the exit.',
    width: 10, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,5,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,6,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,4,1,1,2],
      [2,2,2,2,2,2,2,2,2,2],
    ],
    
    links: [{ button: {x:4,z:4}, door: {x:5,z:6} }],
    amica: "The button opens the door. This is not a metaphor.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[3] = [
    { trigger: 'start', speaker: 'amica', lines: [
      "This chamber introduces the Aperture Science Weighted Pressure Plate.",
      "The yellow disc on the floor is a button. Standing on it activates something.",
      "In this case, it opens a door. The door is red. The exit is green. Please don't confuse them.",
    ]},
    { trigger: 'button', speaker: 'core', lines: [
      "Pressure plate activated!",
      "The linked door has been unlocked. You can now walk through it.",
      "Note: stepping off the button does NOT close the door in this chamber. You are welcome.",
    ]},
    { trigger: 'door_open', speaker: 'amica', lines: [
      "Door open. Please proceed before I change my mind.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Button → door → exit. You solved it.",
      "I will not pretend that required exceptional intellect. But it was adequate.",
    ]},
  ];
