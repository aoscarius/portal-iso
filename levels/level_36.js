// ── Chamber 36: Push & Teleport ──────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 36,
  name: { en: 'CHAMBER 36 — PUSH & TELEPORT', it: 'CAMERA 36 — SPINGI E TELETRASPORTA' },
  hint: { en: 'Push the cube, teleport to the other side, keep pushing.', it: 'Spingi il cubo, teletrasportati dall\'altro lato, continua a spingere.' },
  width: 18, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,1,1,1,1,1,7,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,2,2,2,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,2,5,2,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,2,2,2,1,1,4,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 10, z: 5 }, door: { x: 14, z: 6 }, holdTime: 0 }],
  amica: {
    en: "The button is inside a three-walled alcove open to the south. The cube must enter from the east. There is a wall between you and the cube. Portals are along the entire east-west corridor.",
    it: "Il pulsante è dentro un'alcova a tre pareti aperta a sud. Il cubo deve entrare da est. C'è un muro tra te e il cubo. I portali sono lungo l'intero corridoio est-ovest."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 36. The cube and the button are separated by a wall section.",
      "You must push the cube toward the wall, then portal to the other side, and push it into the button from there.",
      "The portal walls run east-west across the chamber. Use them to reposition mid-push.",
      "Think of it as a relay race where you are both runners.",
    ],
    it: [
      "Camera 36. Il cubo e il pulsante sono separati da una sezione di muro.",
      "Devi spingere il cubo verso il muro, poi portale dall'altro lato, e spingerlo nel pulsante da là.",
      "I muri portale corrono est-ovest attraverso la camera. Usali per riposizionarti durante la spinta.",
      "Pensalo come una staffetta in cui sei entrambi i corridori.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Interrupted push sequence completed. You teleported mid-task. This shows adaptability. Or desperation. The file will call it adaptability."],
    it: ["Sequenza di spinta interrotta completata. Ti sei teletrasportato a metà compito. Questo mostra adattabilità. O disperazione. Il fascicolo lo chiamerà adattabilità."]
  }},
});
