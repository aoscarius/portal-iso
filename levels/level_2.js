// ── Chamber 02: Portal Introduction ─────────────────────
// Redesigned: open corridor with portal walls on both ends.
// Player in center corridor can aim LEFT (Z) to hit left portal wall,
// aim RIGHT (V) to hit right portal wall, then walk through either portal.

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
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
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = {};
DIALOGUE_SCRIPTS[2] = [
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
  ];
