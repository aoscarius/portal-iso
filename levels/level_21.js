// ── Chamber 21: Aperture Gauntlet II ─────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 21,
  name: { en: 'CHAMBER 21 — ANGLES', it: 'CAMERA 21 — ANGOLI' },
  hint: { en: 'The hazard is not the obstacle. Your angle is.', it: 'Il pericolo non è l\'ostacolo. Il tuo angolo lo è.' },
  width: 14, height: 11,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,1,1,2,2,2,2,2,2,2,9,1,2],
    [2,9,1,1,2,8,8,8,8,8,2,9,1,2],
    [2,9,1,1,2,8,1,1,1,8,2,9,4,2],
    [2,9,1,1,2,8,1,1,1,8,2,9,1,2],
    [2,9,1,1,2,8,8,8,8,8,2,9,1,2],
    [2,9,1,1,2,2,2,2,2,2,2,9,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  amica: {
    en: "The exit is behind a wall of lava. Portals are on the flanking walls. I have done everything except walk for you.",
    it: "L'uscita è dietro un muro di lava. I portali sono sui muri laterali. Ho fatto tutto tranne camminare per te."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 21. The exit is flanked by hazard tiles.",
      "You cannot walk through fire. Despite what certain motivational posters suggest.",
      "However, the portal walls on both sides of the hazard zone create a bypass.",
      "Aim carefully. The exit is on the right portal wall's far side.",
    ],
    it: [
      "Camera 21. L'uscita è fiancheggiata da caselle pericolose.",
      "Non puoi camminare attraverso il fuoco. Nonostante ciò che certi poster motivazionali suggeriscono.",
      "Tuttavia, i muri portale su entrambi i lati della zona pericolosa creano un bypass.",
      "Mira con attenzione. L'uscita è sul lato lontano del muro portale destro.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You used geometry to avoid death. This is either intelligence or luck. The file is ambiguous."],
    it: ["Hai usato la geometria per evitare la morte. Questo è o intelligenza o fortuna. Il fascicolo è ambiguo."]
  }},
});
