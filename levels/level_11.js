// ── Chamber 11: Shadow Protocol ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 11,
    name: { en: 'CHAMBER 11 — SHADOW PROTOCOL', it: 'CAMERA 11 — PROTOCOLLO OMBRA' },
    hint: { 
      en: 'The cube can block the beam. Silence the receiver to pass.', 
      it: 'Il cubo può bloccare il raggio. Silenzia il ricevitore per passare.' 
    },
    width: 12, height: 9,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,2,2,1,1,1,4,2],
      [2,1,1,1,1,2,2,6,2,2,2,2],
      [2,1,9,9,1,2,2,1,2,2,2,2],
      [2,1,7,1,1,1,1,1,1,1,1,2],
      [2,9,9,1,1,2,2,1,2,2,2,2],
      [2,1,1,1,1,2,2,1,2,2,2,2],
      [2,10,1,1,1,1,1,1,1,1,11,2],
      [2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    lasers: [{ emitter:{x:1,z:7}, dir:{dx:1,dz:0}, receiverId:'11_7' }],
    links: [{ receiver:'11_7', door:{x:7,z:2} }], 
    amica: {
      en: "Sometimes progress requires standing in the way of science. Or putting a cube there.",
      it: "A volte il progresso richiede di ostacolare la scienza. O di metterci un cubo davanti."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Look at that beam. It is pure energy. And it is in your way.", 
        "I suggest you find something to... discourage it."
      ],
      it: [
        "Guarda quel raggio. È energia pura. Ed è sulla tua strada.", 
        "Suggerisco di trovare qualcosa per... scoraggiarlo."
      ] 
    }},
  });
