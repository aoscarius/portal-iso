// ── Chamber 29: Dual Purpose ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 29,
  name: { en: 'CHAMBER 29 — DUAL PURPOSE', it: 'CAMERA 29 — DOPPIO SCOPO' },
  hint: { en: 'The cube must block the laser AND press the button at the same time.', it: 'Il cubo deve bloccare il laser E premere il pulsante allo stesso tempo.' },
  width: 18, height: 13,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,2,2,2,2,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,9,2,7,1,2,9,1,1,1,1,9,2],
    [2,9,1,5,1,1,9,2,1,1,2,9,1,1,6,1,9,2],
    [2,9,1,1,1,1,9,2,1,1,2,9,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,2,2,2,2,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [{ emitter: { x: 1, z: 3 }, dir: { dx: 1, dz: 0 }, receiverId: '16_3' }],
  links: [
    { button: { x: 3, z: 7 }, door: { x: 14, z: 7 } },
    { receiver: '16_3', door: { x: 14, z: 7 }, holdTime: 0 },
  ],
  amica: {
    en: "The door opens only when the button is pressed AND the laser receiver is blocked. The cube can do both. If it is in the right place.",
    it: "La porta si apre solo quando il pulsante è premuto E il ricevitore laser è bloccato. Il cubo può fare entrambe le cose. Se è nel posto giusto."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 29. The exit door has two independent locking mechanisms.",
      "Mechanism one: a pressure plate inside the left chamber.",
      "Mechanism two: the laser receiver on the east wall must NOT be active.",
      "The cube, if positioned precisely, can press the button and simultaneously block the laser beam.",
    ],
    it: [
      "Camera 29. La porta di uscita ha due meccanismi di blocco indipendenti.",
      "Meccanismo uno: una piastra di pressione nella camera sinistra.",
      "Meccanismo due: il ricevitore laser sul muro est NON deve essere attivo.",
      "Il cubo, se posizionato con precisione, può premere il pulsante e bloccare simultaneamente il raggio laser.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["One cube. Two functions. Zero wasted steps. I am almost annoyed by how elegant that was."],
    it: ["Un cubo. Due funzioni. Zero passi sprecati. Sono quasi infastidita da quanto fosse elegante."]
  }},
});
