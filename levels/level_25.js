// ── Chamber 25: Glass Mirror ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 25,
  name: { en: 'CHAMBER 25 — GLASS MIRROR', it: 'CAMERA 25 — SPECCHIO DI VETRO' },
  hint: { en: 'The movable block can intercept the laser. Position it between emitter and receiver.', it: 'Il blocco mobile può intercettare il laser. Posizionalo tra emettitore e ricevitore.' },
  width: 16, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,2,2,2,2,2,2,1,1,1,2],
    [2,1,1,1,1,1,2,1,1,1,1,2,1,1,1,2],
    [2,10,1,1,1,1,2,1,12,1,1,2,1,1,11,2],
    [2,1,1,1,1,1,2,1,1,1,1,2,1,1,1,2],
    [2,1,1,1,1,1,2,2,2,6,2,2,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,4,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [{ emitter: { x: 1, z: 6 }, dir: { dx: 1, dz: 0 }, receiverId: '14_6' }],
  links: [{ receiver: '14_6', door: { x: 9, z: 8 } }],
  amica: {
    en: "The movable block is inside the room. The laser passes through open space. These two facts are related.",
    it: "Il blocco mobile è dentro la stanza. Il laser passa attraverso lo spazio aperto. Questi due fatti sono correlati."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 25. A movable glass block is inside a sealed room.",
      "The laser fires horizontally and currently passes through the room without hitting anything useful.",
      "Push the block so that it lands between the emitter's beam path and the receiver.",
      "The receiver is on the east wall. The emitter is on the west. The block is in the middle. Think.",
    ],
    it: [
      "Camera 25. Un blocco di vetro mobile è dentro una stanza sigillata.",
      "Il laser spara orizzontalmente e attualmente passa attraverso la stanza senza colpire nulla di utile.",
      "Spingi il blocco in modo che si posizioni tra il percorso del raggio dell'emettitore e il ricevitore.",
      "Il ricevitore è sul muro est. L'emettitore è a ovest. Il blocco è nel mezzo. Pensa.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You used a structural element as a laser conductor. I had not predicted this specific approach. I am updating my models."],
    it: ["Hai usato un elemento strutturale come conduttore laser. Non avevo previsto questo approccio specifico. Sto aggiornando i miei modelli."]
  }},
});
