// ── Chamber 32: Synchronised Beams ───────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 32,
  name: { en: 'CHAMBER 32 — SYNCHRONISED BEAMS', it: 'CAMERA 32 — RAGGI SINCRONIZZATI' },
  hint: { en: 'Both receivers must be active simultaneously to open the exit.', it: 'Entrambi i ricevitori devono essere attivi contemporaneamente per aprire l\'uscita.' },
  width: 18, height: 13,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,9,9,9,9,9,9,2,2,9,9,9,9,9,9,10,2],
    [2,1,9,1,1,1,1,9,2,2,9,1,1,1,1,9,1,2],
    [2,1,9,1,1,1,1,9,2,2,9,1,1,1,1,9,1,2],
    [2,1,9,1,11,1,1,9,2,2,9,1,1,11,1,9,1,2],
    [2,1,9,1,1,1,1,9,2,2,9,1,1,1,1,9,1,2],
    [2,1,9,9,9,9,9,9,2,2,9,9,9,9,9,9,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [
    { emitter: { x: 1, z: 3 }, dir: { dx: 1, dz: 0 }, receiverId: '4_6' },
    { emitter: { x: 16, z: 3 }, dir: { dx: -1, dz: 0 }, receiverId: '13_6' },
  ],
  links: [
    { receiver: '4_6',  door: { x: 9, z: 10 } },
    { receiver: '13_6', door: { x: 9, z: 10 } },
  ],
  amica: {
    en: "Two emitters. Two receivers. One exit. The exit opens only when both receivers are active. You have one pair of portals. Choose wisely.",
    it: "Due emettitori. Due ricevitori. Un'uscita. L'uscita si apre solo quando entrambi i ricevitori sono attivi. Hai un solo paio di portali. Scegli con saggezza."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 32. Two laser emitters fire inward from opposite sides.",
      "Each must hit its corresponding receiver inside its sealed chamber.",
      "Both receivers must be active simultaneously for the single exit door to unlock.",
      "You cannot redirect both beams at once with one pair of portals. Think about what that implies.",
    ],
    it: [
      "Camera 32. Due emettitori laser sparano verso l'interno da lati opposti.",
      "Ognuno deve colpire il suo ricevitore corrispondente nella sua camera sigillata.",
      "Entrambi i ricevitori devono essere attivi contemporaneamente affinché la singola porta di uscita si sblocchi.",
      "Non puoi reindirizzare entrambi i raggi contemporaneamente con un solo paio di portali. Pensa a cosa implica questo.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Both beams aligned simultaneously. I am genuinely uncertain how you achieved that. I am reviewing the sensor logs. They are also uncertain."],
    it: ["Entrambi i raggi allineati simultaneamente. Sono genuinamente incerta su come tu l'abbia realizzato. Sto esaminando i log dei sensori. Sono anche loro incerti."]
  }},
});
