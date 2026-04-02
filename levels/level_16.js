// ── Chamber 16: The Splitter ────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 16,
    name: { en: 'CHAMBER 16 — THE SPLITTER', it: 'CAMERA 16 — LO SCISSORE' },
    hint: { 
      en: 'Open the gate with the laser, then send the object.', 
      it: 'Apri il cancello con il laser, poi manda l\'oggetto.' 
    },
    width: 16, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,9,2,2,5,1,1,1,1,1,2], 
      [2,1,1,1,1,1,9,2,2,1,1,1,1,1,1,2],
      [2,2,2,6,2,2,2,2,2,2,2,2,1,1,1,2], 
      [2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,2],
      [2,1,12,1,1,1,1,1,1,1,1,2,1,1,4,2], 
      [2,1,1,1,1,1,1,1,1,1,1,6,1,1,1,2], 
      [2,9,9,9,9,9,9,9,9,9,9,2,1,1,1,2],
      [2,10,1,1,1,1,1,1,1,1,1,11,1,1,1,2], 
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:8}, dir:{dx:1,dz:0}, receiverId:'16_11' }],
    links: [
      { receiver:'16_11', door:{x:3,z:3} },
      { button:{x:9,z:1}, door:{x:11,z:6} }
    ],
    amica: {
      en: "Logic is the art of going wrong with confidence.",
      it: "La logica è l'arte di sbagliare con fiducia."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: ["This chamber requires timing. And fingers. Do you still have those?"],
      it: ["Questa camera richiede tempismo. E dita. Le hai ancora?"] 
    }},
  });
