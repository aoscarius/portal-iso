// ── Chamber 14: Redirect Loop ───────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 14,
    name: { en: 'CHAMBER 14 — REDIRECT LOOP', it: 'CAMERA 14 — LOOP DI REINDIRIZZAMENTO' },
    hint: { 
      en: 'The laser needs a path. Use portals to bridge the gap.', 
      it: 'Il laser ha bisogno di un percorso. Usa i portali per superare il divario.' 
    },
    width: 14, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,1,1,2,1,1,1,1,1,4,2],
      [2,1,1,1,1,1,6,1,1,1,1,1,1,2], 
      [2,9,9,1,9,9,2,9,9,9,1,9,9,2], // Portal walls
      [2,8,8,8,8,8,2,8,8,8,8,8,8,2], // Hazard pit
      [2,1,1,1,1,1,2,1,1,1,1,1,1,2],
      [2,10,1,1,1,1,2,1,1,1,1,11,1,2], 
      [2,1,1,1,1,1,2,1,1,1,1,1,1,2],
      [2,9,9,9,9,9,2,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:6}, dir:{dx:1,dz:0}, receiverId:'14_11' }],
    links: [{ receiver:'14_11', door:{x:6,z:2} }],
    amica: {
      en: "The laser doesn't care about your personal space.",
      it: "Al laser non importa del tuo spazio personale."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Please try not to obstruct the beam with your head.", 
        "It's messy to clean up."
      ],
      it: [
        "Per favore, cerca di non ostruire il raggio con la testa.", 
        "È un pasticcio da pulire."
      ] 
    }},
  });
