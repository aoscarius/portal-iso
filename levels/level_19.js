// ── Chamber 19: The Infinite Squeeze ────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 19,
    name: { en: 'CHAMBER 19 — THE INFINITE SQUEEZE', it: 'CAMERA 19 — LA STRETTA INFINITA' },
    hint: { 
      en: 'One laser, two targets.', 
      it: 'Un laser, due bersagli.' 
    },
    width: 16, height: 16,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,10,1,1,1,1,1,1,1,1,11,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,2,2,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,1,6,1,2,2,2,2,2,2,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,11,1,1,1,1,1,1,1,1,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,4,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:3,z:3}, dir:{dx:1,dz:0}, receiverId:'19_11' }],
    links: [
      { receiver:'19_11', door:{x:7,z:7} },
      { receiver:'3_10', door:{x:13,z:13} }
    ],
    amica: {
      en: "Two targets, one beam. Prove me wrong.",
      it: "Due bersagli, un raggio. Dimostrami il contrario."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: ["This is mathematically impossible for someone of your... background."],
      it: ["Questo è matematicamente impossibile per qualcuno con il tuo... background."] 
    }},
  });
