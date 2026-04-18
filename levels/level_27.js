// ── Chamber 27: Laser Wall ────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 27,
  name: { en: 'CHAMBER 27 — LASER WALL', it: 'CAMERA 27 — MURO LASER' },
  hint: { en: 'Route the laser away from your path before you can cross.', it: 'Reindirizza il laser lontano dal tuo percorso prima di attraversare.' },
  width: 16, height: 13,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,8,8,8,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,4,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,10,1,1,1,1,1,1,1,11,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [{ emitter: { x: 1, z: 11 }, dir: { dx: 1, dz: 0 }, receiverId: '9_11' }],
  links: [{ receiver: '9_11', door: { x: 6, z: 7 }, holdTime: 0 }],
  amica: {
    en: "The laser is blocking the only vertical corridor. The receiver controls a hazard-blocking door. Cause and effect are your enemies here.",
    it: "Il laser blocca l'unico corridoio verticale. Il ricevitore controlla una porta che blocca il pericolo. Causa ed effetto sono i tuoi nemici qui."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 27. The laser on the bottom level hits a receiver.",
      "That receiver keeps a door open — specifically, the door blocking the hazard inside the upper chamber.",
      "To reach the exit, you need the hazard blocked. To block the hazard, keep the laser hitting the receiver.",
      "But first you need to get past the laser firing line. The portal walls run along the entire lower and upper corridors.",
    ],
    it: [
      "Camera 27. Il laser al livello inferiore colpisce un ricevitore.",
      "Quel ricevitore mantiene una porta aperta — specificamente, la porta che blocca il pericolo nella camera superiore.",
      "Per raggiungere l'uscita, hai bisogno del pericolo bloccato. Per bloccare il pericolo, mantieni il laser che colpisce il ricevitore.",
      "Ma prima devi superare la linea di fuoco del laser. I muri portale corrono lungo l'intero corridoio inferiore e superiore.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You used a laser to protect yourself from a hazard while also using portals to avoid the laser. The irony is not lost on me."],
    it: ["Hai usato un laser per proteggerti da un pericolo mentre usavi anche portali per evitare il laser. L'ironia non mi sfugge."]
  }},
});
