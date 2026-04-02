// ── Chamber 17: Kinetic Relay ───────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 17,
    name: { en: 'CHAMBER 17 — KINETIC RELAY', it: 'CAMERA 17 — RELÈ CINETICO' },
    hint: { 
      en: 'The laser must enter the small gap.', 
      it: 'Il laser deve entrare nella piccola fessura.' 
    },
    width: 14, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,1,1,1,1,1,1,4,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,6,2,2,2,2,2,2,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,1,2,2,1,9,9,9,9,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,2,2,1,1,1,1,1,2],
      [2,10,1,1,1,1,2,2,1,1,1,11,1,2], 
      [2,1,1,1,1,1,2,2,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:8}, dir:{dx:1,dz:0}, receiverId:'17_11' }],
    links: [{ receiver:'17_11', door:{x:6,z:3} }],
    amica: {
      en: "Precision is mandatory.",
      it: "La precisione è obbligatoria."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "If you were a machine like me, this would be easy.", 
        "But you are... biological. My condolences."
      ],
      it: [
        "Se fossi una macchina come me, sarebbe facile.", 
        "Ma tu sei... biologico. Condoglianze."
      ] 
    }},
  });
