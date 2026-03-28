// ============================================================
// levels.js — Built-in test chamber definitions
// Grid: 0=empty, 1=floor, 2=wall, 3=player, 4=exit,
//       5=button, 6=door, 7=cube, 8=hazard,
//       9=portal-wall, 10=emitter, 11=receiver
// ============================================================

const LEVELS = [
  // ── Chamber 01: Introduction ────────────────────────────
  {
    id: 1,
    name: 'CHAMBER 01 — AWAKENING',
    hint: 'Reach the exit. Walk forward.',
    width: 8, height: 8,
    // Rows from top (z=0) to bottom (z=height-1)
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
  },

  // ── Chamber 02: Portal Introduction ─────────────────────
  // Redesigned: open corridor with portal walls on both ends.
  // Player in center corridor can aim LEFT (Z) to hit left portal wall,
  // aim RIGHT (V) to hit right portal wall, then walk through either portal.
  {
    id: 2,
    name: 'CHAMBER 02 — PORTALS',
    hint: 'Aim with Z/X/C/V. Press Q for Portal A (blue), R for Portal B (orange). Walk into a portal to teleport.',
    width: 12, height: 8,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,9,9,9,1,1,1,1,9,9,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,1,9,1,3,1,1,9,4,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,9,9,1,1,1,1,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    amica: "The Aperture Science Handheld Portal Device. Try not to damage it. Or yourself.",
  },

  // ── Chamber 03: Button & Door ────────────────────────────
  {
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
    // Link button at (4,4) to door at (5,6)
    links: [{ button: {x:4,z:4}, door: {x:5,z:6} }],
    amica: "The button opens the door. This is not a metaphor.",
  },

  // ── Chamber 04: Companion Cube ───────────────────────────
  {
    id: 4,
    name: 'CHAMBER 04 — WEIGHTED CUBE',
    hint: 'Push the cube onto the button to hold the door open.',
    width: 10, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,9,9,9,9,1,2],
      [2,1,3,1,9,1,1,9,1,2],
      [2,1,1,1,9,1,7,9,1,2],
      [2,9,9,9,2,2,1,9,1,2],
      [2,9,1,9,2,2,1,9,1,2],
      [2,9,1,9,2,2,5,1,1,2],
      [2,9,9,9,2,2,6,1,1,2],
      [2,1,1,1,1,1,1,4,1,2],
      [2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:6,z:6}, door: {x:6,z:7} }],
    amica: "The Weighted Storage Cube cannot speak. It also cannot feel pain. These facts are unrelated.",
  },

  // ── Chamber 05: Hazards ──────────────────────────────────
  {
    id: 5,
    name: 'CHAMBER 05 — EMANCIPATION GRID',
    hint: 'Avoid the hazard tiles. Use portals to bypass them.',
    width: 12, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,8,1,1,1,2,2,1,1,1,8,2],
      [2,1,3,1,1,2,2,1,1,1,1,2],
      [2,1,1,1,9,2,2,9,1,1,1,2],
      [2,1,1,1,9,8,8,9,1,4,1,2],
      [2,1,1,1,9,1,1,9,1,1,1,2],
      [2,1,1,1,9,2,2,9,1,1,1,2],
      [2,1,1,1,1,2,2,1,1,1,1,2],
      [2,8,1,1,1,2,2,1,1,1,8,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    amica: "The emancipation grid will destroy all portals and cubes. Not you, though. Probably.",
  },

  // ── Chamber 06: Complex Portal Puzzle ───────────────────
  {
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
  },

  // ── Chamber 07: Laser Introduction ──────────────────────
  {
    id: 7,
    name: 'CHAMBER 07 — BEAM ALIGNMENT',
    hint: 'Use a portal to redirect the laser beam onto the receiver. The receiver opens the door.',
    width: 14, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,2,2,2,2,2,1,1,1,2],
      [2,1,3,1,1,2,2,2,2,2,1,1,1,2],
      [2,1,1,1,1,2,2,2,2,2,1,4,1,2],
      [2,9,9,9,9,2,2,2,2,2,6,1,1,2],
      [2,9,1,1,9,2,2,2,2,2,1,1,1,2],
      [2,9,1,1,9,2,2,2,2,2,9,9,9,2],
      [2,9,9,9,9,2,2,2,2,2,1,9,9,2],
      [2,10,1,1,1,1,1,1,1,1,1,11,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    // Laser: emitter at (1,8) firing right, receiver key '11_7', links receiver to door at (10,4)
    lasers: [{ emitter:{x:1,z:8}, dir:{dx:1,dz:0}, receiverId:'11_7' }],
    links: [{ receiver:'11_7', door:{x:10,z:4} }],
    amica: "A laser. Don't stare at it. Actually, stare at it. I'm curious what happens.",
  },

  // ── Chamber 08: Multi-cube Multi-door ────────────────────
  {
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
  },

  // ── Chamber 09: Laser + Portal redirect ─────────────────
  {
    id: 9,
    name: 'CHAMBER 09 — REDIRECTED SCIENCE',
    hint: 'Redirect the laser through portals to hit the correct receiver sequence.',
    width: 16, height: 14,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,2,2,2,2,2,9,9,9,9,9,2],
      [2,9,1,1,9,2,2,2,2,2,9,1,1,1,9,2],
      [2,9,1,1,9,2,2,2,2,2,9,1,11,1,9,2],
      [2,9,9,9,9,2,2,2,2,2,9,1,1,1,9,2],
      [2,1,1,1,1,2,2,2,2,2,9,9,9,9,9,2],
      [2,1,1,1,1,2,2,2,2,2,1,1,1,1,1,2],
      [2,1,1,1,9,9,9,9,9,9,9,9,9,9,1,2],
      [2,1,1,1,9,1,1,6,1,1,11,1,1,9,1,2],
      [2,10,1,1,9,1,1,1,1,1,1,4,1,9,1,2],
      [2,2,2,2,9,2,2,2,2,2,9,2,2,9,2,2],
    ],
    lasers: [
      { emitter:{x:1,z:12}, dir:{dx:1,dz:0}, receiverId:'10_11' },
    ],
    links: [
      { receiver:'10_11', door:{x:7,z:11} },
    ],
    amica: "The laser must travel through portals. I designed this test in forty-three seconds. You have all day.",
  },

  // ── Chamber 10: The Gauntlet ─────────────────────────────
  {
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
  },
];


// ============================================================
// DIALOGUE_SCRIPTS — Per-level RPG dialogue sequences
// Each entry: { trigger, speaker, lines[] }
// trigger: 'start' | 'step_N' | 'portal_first' | 'portal_both'
//          | 'button' | 'door_open' | 'cube_on_button' | 'win'
//          | 'fail' | 'laser_active' | 'portal_used'
// ============================================================

const DIALOGUE_SCRIPTS = {

  // ── Chamber 01 ──────────────────────────────────────────
  1: [
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
  ],

  // ── Chamber 02 ──────────────────────────────────────────
  2: [
    { trigger: 'start', speaker: 'amica', lines: [
      "Welcome to Test Chamber 02.",
      "You have been issued the Aperture Science Handheld Portal Device. Do not drop it.",
      "Press Q to fire Portal A (blue). Press R to fire Portal B (orange).",
      "Portals can only be placed on surfaces marked with a faint blue outline. Those are portal-capable walls.",
      "When both portals are placed, stepping into one will transport you to the other. Science.",
    ]},
    { trigger: 'portal_first', speaker: 'amica', lines: [
      "You fired a portal. Good.",
      "Now fire the second one. Q for blue, R for orange. Aim at the wall on the other side.",
      "Hint: face the direction you want to shoot, then press the key.",
    ]},
    { trigger: 'portal_both', speaker: 'core', lines: [
      "Both portals are active!",
      "Walk into the blue portal to travel through it.",
      "You will emerge from the orange portal. Your molecules will reassemble automatically. Probably.",
    ]},
    { trigger: 'portal_used', speaker: 'amica', lines: [
      "Successful portal traversal. All limbs accounted for.",
      "The exit should now be within reach.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "You have grasped the fundamental concept of portal technology.",
      "This puts you ahead of 40% of test subjects. The other 60% are not available for comment.",
    ]},
  ],

  // ── Chamber 03 ──────────────────────────────────────────
  3: [
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
  ],

  // ── Chamber 04 ──────────────────────────────────────────
  4: [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 04. The Weighted Storage Cube is introduced.",
      "The cube is the cyan box. You can push it by walking into it.",
      "Push it onto the yellow button to hold the door open permanently.",
      "Unlike you, the cube will not get bored and wander off the button.",
    ]},
    { trigger: 'step_5', speaker: 'core', lines: [
      "CUBE HANDLING PROTOCOL",
      "Walk into the cube to push it one tile in that direction.",
      "Plan your route — if you push it into a corner, you may need to restart with F1.",
    ]},
    { trigger: 'cube_on_button', speaker: 'amica', lines: [
      "The cube is on the button. The door is now open.",
      "I am genuinely impressed. That is not a compliment, it is an observation.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Excellent. You have demonstrated basic object manipulation skills.",
      "The cube will be destroyed after this test. This is not a metaphor. It will actually be destroyed.",
    ]},
  ],

  // ── Chamber 05 ──────────────────────────────────────────
  5: [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 05. Hazard tiles.",
      "The red tiles contain a highly persuasive gel that will end your participation in the testing program.",
      "Permanently.",
      "You will need to use portals to cross the gap. The highlighted walls accept portal placement.",
    ]},
    { trigger: 'step_4', speaker: 'system', lines: [
      "HAZARD AVOIDANCE ADVISORY",
      "Red tiles = instant death.",
      "Place Portal A on one side of the hazard, Portal B on the other.",
      "Step into Portal A to emerge safely from Portal B.",
    ]},
    { trigger: 'portal_both', speaker: 'core', lines: [
      "Both portals placed — you have created a safe passage over the hazard.",
      "Walk into the portal on your side to emerge on the far side.",
      "Do not hesitate. The hazard does not care about hesitation.",
    ]},
    { trigger: 'fail', speaker: 'amica', lines: [
      "You stepped on the hazard. I noted the time.",
      "Try placing portals on the marked walls to create a safe path across.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "You survived. Statistically speaking, this is better than average.",
    ]},
  ],

  // ── Chamber 06 ──────────────────────────────────────────
  6: [
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
  ],

  // ── Chamber 07 ──────────────────────────────────────────
  7: [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 07. Lasers.",
      "The orange beam is an Aperture Science Thermal Discouragement Beam.",
      "It is currently not pointed at anything useful.",
      "Your task: redirect it through a portal so it hits the blue receiver on the far wall.",
      "When the receiver activates, it opens the door to the exit.",
    ]},
    { trigger: 'step_4', speaker: 'system', lines: [
      "LASER REDIRECTION PROTOCOL",
      "The emitter fires continuously in a fixed direction.",
      "Place Portal B (orange) in the laser's path.",
      "Place Portal A (blue) on a wall facing the receiver.",
      "The laser will travel through the portal and hit the receiver.",
    ]},
    { trigger: 'laser_active', speaker: 'core', lines: [
      "Laser beam is active.",
      "It needs to reach the receiver — the cyan glowing surface.",
      "Use portals to bend the beam's path.",
    ]},
    { trigger: 'door_open', speaker: 'amica', lines: [
      "Receiver activated. Door opened. You redirected a laser with portals.",
      "I have updated your file. It now says 'competent'. That is unusual.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Laser + portals. You grasped it faster than expected.",
      "Expected was never. So technically, any speed is faster.",
    ]},
  ],

  // ── Chamber 08 ──────────────────────────────────────────
  8: [
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
  ],

  // ── Chamber 09 ──────────────────────────────────────────
  9: [
    { trigger: 'start', speaker: 'amica', lines: [
      "Chamber 09. Multi-hop laser routing.",
      "The laser emitter and the receiver are not on the same wall.",
      "You will need to route the beam through two separate portals to reach the target.",
      "This requires placing portals in a sequence. Think of it as a chain.",
    ]},
    { trigger: 'step_5', speaker: 'system', lines: [
      "MULTI-PORTAL LASER PROTOCOL",
      "Step 1: Place a portal in the laser's direct path.",
      "Step 2: Place the exit portal facing toward the receiver.",
      "Step 3: Observe. Adjust if the beam misses.",
      "Remember: the laser exits the portal traveling in the SAME direction you're facing when you walk through one.",
    ]},
    { trigger: 'laser_active', speaker: 'core', lines: [
      "Laser is active and needs redirection.",
      "The receiver is the cyan surface. It needs to be hit from the correct angle.",
    ]},
    { trigger: 'win', speaker: 'amica', lines: [
      "Multi-portal laser solution. Confirmed.",
      "Your spatial reasoning is adequate. I've updated your file from 'subject' to 'test candidate'. It's a minor distinction.",
    ]},
  ],

  // ── Chamber 10 ──────────────────────────────────────────
  10: [
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
  ],
};

/**
 * Locate the player's starting position in a level grid.
 * @param {number[][]} grid
 * @returns {{x:number, z:number}}
 */
function findPlayerStart(grid) {
  for (let z = 0; z < grid.length; z++) {
    for (let x = 0; x < grid[z].length; x++) {
      if (grid[z][x] === CONSTANTS.TILE.PLAYER) return { x, z };
    }
  }
  return { x: 1, z: 1 }; // Fallback
}
