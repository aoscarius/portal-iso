// ── Chamber 20: The Event Horizon ───────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 20,
    name: { en: 'CHAMBER 20 — EVENT HORIZON', it: 'CAMERA 20 — ORIZZONTE DEGLI EVENTI' },
    hint: { 
      en: 'The final challenge. Use the movable block to clear the path.', 
      it: 'L\'ultima sfida. Usa il blocco mobile per liberare la strada.' 
    },
    width: 18, height: 14,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,1,2,1,1,1,1,1,1,1,1,4,2],
      [2,1,1,1,1,1,1,6,1,1,1,1,1,1,1,6,1,2], // Output doors
      [2,9,9,9,2,2,2,2,2,2,2,2,2,2,2,2,1,2],
      [2,1,7,1,2,1,1,1,1,1,1,1,1,1,1,1,1,2], // Cube
      [2,1,1,1,2,1,8,8,8,8,8,8,8,8,1,1,1,2],
      [2,2,6,2,2,1,8,9,9,9,9,8,1,1,1,1,1,2], // Internal gate
      [2,1,1,1,1,1,8,9,5,1,9,8,1,1,1,1,1,2], // Button
      [2,1,12,1,1,1,8,9,9,9,9,8,1,1,1,1,1,2], // Movable 12
      [2,2,2,2,2,1,8,8,8,8,8,8,8,8,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,2], 
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:11}, dir:{dx:1,dz:0}, receiverId:'20_11' }],
    links: [
      { button:{x:8,z:7}, door:{x:7,z:2} },
      { receiver:'20_11', door:{x:15,z:2} },
      { button:{x:8,z:7}, door:{x:2,z:6} }
    ],
    amica: {
      en: "This is the end. If you survive, there will be a ceremony.",
      it: "Questa è la fine. Se sopravvivi, ci sarà una cerimonia."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: ["You reached the last chamber. I am almost proud.", "Almost."],
      it: ["Hai raggiunto l'ultima camera. Sono quasi orgogliosa.", "Quasi."] 
    }},
    win: { speaker: 'amica', lines: {
      en: [
        "Twenty chambers complete. Unbelievable.",
        "You have shown a remarkable ability to push boxes and walk through holes.",
        "I've contacted your emergency contact. They didn't pick up.",
        "Please remain still until the party associates arrive to collect you.",
      ],
      it: [
        "Venti camere completate. Incredibile.",
        "Hai mostrato una notevole capacità di spingere scatole e camminare attraverso buchi.",
        "Ho contattato il tuo contatto di emergenza. Non hanno risposto.",
        "Resta fermo finché gli addetti alla festa non verranno a prenderti.",
      ]
    }},
  });
