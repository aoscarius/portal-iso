// ── Chamber 04: Companion Cube ───────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
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
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[4] = [
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
  ];
