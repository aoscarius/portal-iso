// ── Chamber 30: The Loop ─────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 30,
  name: { en: 'CHAMBER 30 — THE LOOP', it: 'CAMERA 30 — IL LOOP' },
  hint: { en: 'Do not place portals that trap you. Think exit before entry.', it: 'Non piazzare portali che ti intrappolano. Pensa all\'uscita prima dell\'entrata.' },
  width: 16, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,2,2,2,2,2,2,2,2,2,9,9,9,2],
    [2,9,1,2,8,8,8,8,8,8,8,2,1,1,9,2],
    [2,9,1,2,8,1,1,1,1,1,8,2,1,1,9,2],
    [2,9,1,2,8,1,9,9,9,1,8,2,1,1,9,2],
    [2,9,1,2,8,1,9,5,9,1,8,2,1,1,9,2],
    [2,9,1,2,8,1,9,9,9,1,8,2,1,1,9,2],
    [2,9,1,2,8,1,1,1,1,1,8,2,1,1,9,2],
    [2,9,1,2,8,8,8,8,8,8,8,2,1,1,9,2],
    [2,9,9,2,2,2,2,2,2,2,2,2,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,4,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 7, z: 7 }, door: { x: 7, z: 7 }, holdTime: 0 }],
  amica: {
    en: "Three nested rings of portal walls. The button is in the centre. The exit is outside. No, there is no shortcut. Yes, I checked.",
    it: "Tre anelli annidati di muri portale. Il pulsante è al centro. L'uscita è fuori. No, non c'è scorciatoia. Sì, ho controllato."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 30. Nested portal chambers.",
      "The button is at the centre of three concentric portal-walled rings.",
      "To reach it you must portal in through each ring. Then portal back out.",
      "The exit is in the outer ring. Do not portal yourself into a wall. This is physically impossible but psychologically probable.",
    ],
    it: [
      "Camera 30. Camere portale annidate.",
      "Il pulsante è al centro di tre anelli concentrici di muri portale.",
      "Per raggiungerlo devi portale attraverso ogni anello. Poi tornare indietro con i portali.",
      "L'uscita è nell'anello esterno. Non portarti dentro un muro. Questo è fisicamente impossibile ma psicologicamente probabile.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You navigated three nested portal rings without trapping yourself. I am noting this as 'above average spatial reasoning'. The bar is very low."],
    it: ["Hai navigato tre anelli portale annidati senza intrappolarti. Lo sto annotando come 'ragionamento spaziale sopra la media'. Il bar è molto basso."]
  }},
});
