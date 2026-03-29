// ── Chamber 05: Hazards ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
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
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[5] = [
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
  ];
