// ── Chamber 15: Weight Management ───────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 15,
    name: { en: 'CHAMBER 15 — WEIGHT MANAGEMENT', it: 'CAMERA 15 — GESTIONE PESI' },
    hint: { 
      en: 'One object to block, one to press. Choose wisely.', 
      it: 'Un oggetto per bloccare, uno per premere. Scegli saggiamente.' 
    },
    width: 12, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,2,4,1,1,1,1,1,2],
      [2,1,1,1,2,6,2,2,2,2,1,2], 
      [2,1,1,1,2,1,2,1,1,2,1,2],
      [2,1,7,1,9,1,9,1,5,2,1,2], 
      [2,1,1,1,2,1,2,1,1,2,1,2],
      [2,2,1,2,2,1,2,2,1,2,1,2],
      [2,2,12,2,2,1,1,1,1,1,1,2], 
      [2,2,1,2,2,9,2,2,9,2,1,2],
      [2,10,1,1,1,1,1,1,1,1,11,2], 
      [2,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:9}, dir:{dx:1,dz:0}, receiverId:'15_11' }],
    links: [
      { button:{x:8,z:4}, door:{x:5,z:2} },
      { receiver:'15_11', door:{x:5,z:2} }
    ],
    amica: {
      en: "Resource allocation is key.",
      it: "L'allocazione delle risorse è fondamentale."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "If you run out of cubes, you could always use yourself.", 
        "But I'd have to clean the floor. And I just did that."
      ],
      it: [
        "Se finisci i cubi, potresti sempre usare te stesso.", 
        "Ma dovrei pulire il pavimento. E l'ho appena fatto."
      ] 
    }},
  });
