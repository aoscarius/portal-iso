// ── Chamber 07: Laser Introduction ──────────────────────
// Laser: emitter at (1,8) firing right, receiver key '11_7', links receiver to door at (10,4)

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 7,
    name: 'CHAMBER 07 — BEAM ALIGNMENT',
    hint: 'Use a portal to redirect the laser beam onto the receiver. The receiver opens the door.',
    width: 14, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,2,2,2,2,2,2,4,2,2],
      [2,1,3,1,1,2,2,2,2,2,2,1,2,2],
      [2,1,1,1,1,2,2,2,2,2,2,6,2,2],
      [2,9,9,9,9,2,2,2,2,2,1,1,9,2],
      [2,9,1,1,9,2,2,2,2,2,1,11,9,2],
      [2,9,1,1,9,2,2,2,2,2,1,1,9,2],
      [2,9,9,9,9,2,2,2,2,2,1,9,9,2],
      [2,10,1,1,1,1,1,1,1,1,1,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    
    lasers: [{ emitter:{x:1,z:8}, dir:{dx:1,dz:0}, receiverId:'11_5' }],
    links: [{ receiver:'11_5', door:{x:11,z:3} }],
    amica: "A laser. Don't stare at it. Actually, stare at it. I'm curious what happens.",
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[7] = [
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
  ];
