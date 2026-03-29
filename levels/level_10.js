// ── Chamber 10: The Gauntlet ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 10,
    name: 'CHAMBER 10 — FINAL SYNTHESIS',
    hint: 'Every mechanic combined. Portals, cubes, lasers, hazards. Good luck.',
    width: 18, height: 16,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,2,2,2,2,2,2,2,9,9,9,9,9,9,2],
      [2,9,1,9,2,8,8,8,8,8,2,9,1,1,1,1,9,2],
      [2,9,1,9,2,8,1,1,1,8,2,9,1,7,1,1,9,2],
      [2,9,9,9,2,8,1,5,1,8,2,9,1,1,11,1,9,2],
      [2,1,1,1,2,8,1,1,1,8,2,9,1,1,1,1,9,2],
      [2,1,1,1,2,8,8,6,8,8,2,9,9,9,9,9,9,2],
      [2,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
      [2,10,1,1,1,1,1,4,1,1,1,1,1,1,1,1,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [
      { emitter:{x:1,z:14}, dir:{dx:1,dz:0}, receiverId:'14_7' },
    ],
    links: [
      { button:{x:7,z:7}, door:{x:7,z:9} },
      { receiver:'14_7', door:{x:7,z:9} },
    ],
    amica: "This is the final test. I want you to know that I am very proud of you. That was a lie. Good luck.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[10] = [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 10. The final test.",
      "Everything you have learned is required here: portal navigation, cube management, laser redirection, and hazard avoidance.",
      "There is no single solution. There are several wrong ones.",
      "Good luck. I mean that in the statistical sense — luck will not help you, but the phrase is culturally appropriate.",
    ]},
    { trigger: 'step_3', speaker: 'core', lines: [
      "FINAL CHAMBER BRIEFING",
      "Objectives in suggested order:",
      "1. Navigate past the hazard zone using portals.",
      "2. Push the cube onto the button to open the inner door.",
      "3. Redirect the laser to activate the receiver and open the outer gate.",
      "4. Reach the exit.",
    ]},
    { trigger: 'button', speaker: 'amica', lines: [
      "Button activated. One obstacle down.",
      "The laser still needs to hit the receiver.",
    ]},
    { trigger: 'laser_active', speaker: 'system', lines: [
      "LASER SYSTEM ACTIVE",
      "Route the beam to the receiver using portals.",
      "The receiver is on the marked wall. The emitter fires from the left side.",
    ]},
    { trigger: 'door_open', speaker: 'amica', lines: [
      "Door opened. The exit is in reach.",
      "You are one step from completing all Aperture Science test chambers.",
      "I have prepared a speech. It is mostly statistics.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "All test chambers complete.",
      "Your contribution to science has been noted, filed, and will probably never be reviewed.",
      "The Aperture Science Enrichment Center thanks you for your participation.",
      "You may now return to your life.",
      "...",
      "There is cake waiting in the break room. This is true.",
    ]},
  ];
