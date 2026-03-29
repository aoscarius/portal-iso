// ── Chamber 08: Multi-cube Multi-door ────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 8,
    name: 'CHAMBER 08 — CUBE LOGISTICS',
    hint: 'Two cubes, two buttons, two doors. Think before you push.',
    width: 16, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,7,1,1,1,1,1,7,1,1,1,1,2],
      [2,1,1,1,1,1,9,1,1,9,1,1,1,1,1,2],
      [2,1,1,1,1,1,9,1,1,9,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,5,5,9,9,9,9,9,9,2],
      [2,9,1,1,1,1,1,6,6,1,1,1,1,1,9,2],
      [2,9,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
      [2,9,1,1,1,1,1,1,1,4,1,1,1,1,9,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    links: [
      { button:{x:7,z:6}, door:{x:7,z:7} },
      { button:{x:8,z:6}, door:{x:8,z:7} },
    ],
    amica: "Two cubes. Two buttons. I would explain the puzzle, but that would make it less educational.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[8] = [
    { trigger: 'start', speaker: 'amica', lines: [
      "Two cubes. Two buttons. Two doors.",
      "Each cube must reach its corresponding button for both doors to open.",
      "Plan your pushes carefully. The cubes cannot be pulled back — only pushed forward.",
      "If you get stuck, press F1 to restart the chamber.",
    ]},
    { trigger: 'step_6', speaker: 'core', lines: [
      "LOGISTICS ADVISORY",
      "Push each cube toward its target button.",
      "The buttons are in the central alcove — you will need to navigate around the hazard borders.",
      "Use portals to reposition yourself between cube pushes.",
    ]},
    { trigger: 'cube_on_button', speaker: 'amica', lines: [
      "One button down. One to go.",
      "Both doors only open when both buttons are held simultaneously.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Two cubes, two buttons, solved.",
      "You have successfully completed a logistics puzzle. Aperture Science thanks you for your contribution to the field of moving objects onto other objects.",
    ]},
  ];
