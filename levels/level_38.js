// ── Chamber 38: Laser Fence ──────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 38,
  name: { en: 'CHAMBER 38 — LASER FENCE', it: 'CAMERA 38 — RECINZIONE LASER' },
  hint: { en: 'Multiple laser beams divide the room. Move cubes to block each one.', it: 'Più raggi laser dividono la stanza. Muovi i cubi per bloccarli ognuno.' },
  width: 18, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,7,1,1,2],
    [2,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,11,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,4,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [
    { emitter: { x: 1, z: 4 },  dir: { dx: 1, dz: 0 }, receiverId: '16_4' },
    { emitter: { x: 1, z: 6 },  dir: { dx: 1, dz: 0 }, receiverId: '16_6' },
  ],
  links: [
    { receiver: '16_4', door: { x: 9, z: 10 } },
    { receiver: '16_6', door: { x: 9, z: 10 } },
  ],
  amica: {
    en: "Two laser fences across the corridor. Two cubes available. Both must be blocked simultaneously for the gate to open. The maths is simple. The execution is not.",
    it: "Due recinti laser attraverso il corridoio. Due cubi disponibili. Entrambi devono essere bloccati simultaneamente per aprire il cancello. La matematica è semplice. L'esecuzione no."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 38. Two laser fences, two cubes.",
      "Each laser must be physically blocked by a cube to deactivate its receiver.",
      "Both receivers must be simultaneously inactive for the exit gate to open.",
      "Position both cubes in both beam paths before attempting to proceed.",
    ],
    it: [
      "Camera 38. Due recinti laser, due cubi.",
      "Ogni laser deve essere fisicamente bloccato da un cubo per disattivare il suo ricevitore.",
      "Entrambi i ricevitori devono essere simultaneamente inattivi perché il cancello di uscita si apra.",
      "Posiziona entrambi i cubi in entrambi i percorsi del raggio prima di tentare di procedere.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Both beams blocked simultaneously. You used cubes as infrastructure. Aperture Science has been doing this for decades. Welcome to the team."],
    it: ["Entrambi i raggi bloccati simultaneamente. Hai usato i cubi come infrastruttura. Aperture Science lo fa da decenni. Benvenuto nel team."]
  }},
});
