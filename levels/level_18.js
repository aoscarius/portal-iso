// ── Chamber 18: Portal Shielding ────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 18,
    name: { en: 'CHAMBER 18 — PORTAL SHIELDING', it: 'CAMERA 18 — SCHERMATURA PORTALE' },
    hint: { 
      en: 'The beam is a barrier. Use the cube as a shield.', 
      it: 'Il raggio è una barriera. Usa il cubo come scudo.' 
    },
    width: 12, height: 14,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,2,1,1,5,1,1,1,2], 
      [2,1,1,1,2,1,1,1,1,1,1,2],
      [2,9,9,9,2,1,1,1,1,1,1,2],
      [2,1,12,1,6,1,1,1,1,1,1,2], 
      [2,2,2,2,2,2,2,2,9,9,9,2],
      [2,1,1,1,1,1,1,1,1,7,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,10,1,1,1,1,11,2,2], 
      [2,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,4,2], 
      [2,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:4,z:8}, dir:{dx:1,dz:0}, receiverId:'18_11' }],
    links: [{ button:{x:7,z:1}, door:{x:4,z:4} }],
    amica: {
      en: "The beam will not move. You, however, are very movable.",
      it: "Il raggio non si muoverà. Tu, invece, sei molto mobile."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Don't demonstrante your mobility by disintegrating.", 
        "The paperwork for that is exhausting."
      ],
      it: [
        "Non dimostrare la tua mobilità disintegrandoti.", 
        "La burocrazia per questo è estenuante."
      ] 
    }},
  });
