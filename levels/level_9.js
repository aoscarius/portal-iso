// ── Chamber 09: Laser + Portal redirect ─────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
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
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[9] = [
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
  ];
