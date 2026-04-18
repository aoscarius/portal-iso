// ── Chamber 33: The Squeeze ──────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 33,
  name: { en: 'CHAMBER 33 — THE SQUEEZE', it: 'CAMERA 33 — LA STRETTA' },
  hint: { en: 'Navigate a narrow corridor lined with hazards. One wrong step, restart.', it: 'Naviga un corridoio stretto fiancheggiato da pericoli. Un passo sbagliato, ricomincia.' },
  width: 18, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,8,8,8,8,1,8,8,1,8,8,8,8,8,8,9,2],
    [2,9,8,1,1,8,1,8,8,1,8,1,1,1,1,8,9,2],
    [2,9,8,1,1,8,1,1,1,1,8,1,1,1,1,8,9,2],
    [2,9,8,1,1,8,8,8,8,8,8,1,1,1,4,8,9,2],
    [2,9,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  amica: {
    en: "A maze of hazard tiles with exactly one safe path through. I designed it on a Tuesday. Tuesdays are my cruel days.",
    it: "Un labirinto di caselle pericolose con esattamente un percorso sicuro attraverso. L'ho progettato di martedì. I martedì sono i miei giorni crudeli."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 33. Hazard maze.",
      "There is a safe path from the portal entry to the exit. It is not wide.",
      "Use portals to enter the maze at the correct position. Observe the layout before committing.",
      "One wrong step triggers a restart. I have a counter. It is currently at zero. I expect that to change.",
    ],
    it: [
      "Camera 33. Labirinto di pericoli.",
      "C'è un percorso sicuro dall'ingresso del portale all'uscita. Non è ampio.",
      "Usa i portali per entrare nel labirinto nella posizione corretta. Osserva il layout prima di impegnarti.",
      "Un passo sbagliato fa scattare un riavvio. Ho un contatore. Attualmente è a zero. Mi aspetto che cambi.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Hazard maze cleared. Death counter: I will not say. I respect your dignity. Marginally."],
    it: ["Labirinto di pericoli superato. Contatore morti: non lo dirò. Rispetto la tua dignità. Marginalmente."]
  }},
});
