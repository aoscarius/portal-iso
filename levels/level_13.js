// ── Chamber 13: Reflection Geometry ─────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 13,
    name: { en: 'CHAMBER 13 — TRIPLE THREAD', it: 'CAMERA 13 — TRIPLO FILO' },
    hint: { 
      en: 'Coordinate cube, laser, and portals. The receiver and button must both be active.', 
      it: 'Coordina cubo, laser e portali. Il ricevitore e il pulsante devono essere entrambi attivi.' 
    },
    width: 16, height: 11,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,2,1,1,1,1,2,1,1,4,2],
      [2,1,1,1,1,1,2,1,5,1,1,6,1,1,1,2], // Final door 6
      [2,9,9,9,9,1,2,1,1,1,1,2,1,1,1,2],
      [2,1,7,1,1,1,2,2,2,1,2,2,1,1,1,2], // Cube 7
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,10,1,1,1,9,8,8,8,9,1,1,11,1,2], // Emitter and Receiver
      [2,1,1,1,1,1,1,8,1,8,1,1,1,1,1,2],
      [2,1,12,1,1,1,9,8,8,8,9,1,1,1,1,2], // Movable 12
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:2,z:6}, dir:{dx:1,dz:0}, receiverId:'13_11' }],
    links: [
      { button:{x:8,z:2}, door:{x:11,z:2} },
      { receiver:'13_11', door:{x:11,z:2} }
    ],
    amica: {
      en: "Multi-tasking is the key to efficiency.",
      it: "Il multitasking è la chiave dell'efficienza."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "I am processing a billion operations per second while watching you fail.", 
        "It's quite a multitasking feat."
      ],
      it: [
        "Sto elaborando un miliardo di operazioni al secondo mentre ti guardo fallire.", 
        "È una vera prodezza di multitasking."
      ] 
    }},
  });
