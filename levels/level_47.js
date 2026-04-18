// ── Chamber 47: CHAIN REACTION ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 47,
  name: { en: 'CHAMBER 47 \u2014 CHAIN REACTION', it: 'CAMERA 47 \u2014 REAZIONE A CATENA' },
  hint: { en: 'Four sequential gates. Press and run, press and run.', it: 'Quattro cancelli sequenziali. Premi e corri, premi e corri.' },
  width: 20, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,2,9,9,9,2,9,9,9,2,9,9,9,2,9,9,2],
    [2,9,1,9,6,9,1,9,6,9,1,9,6,9,1,9,6,9,4,2],
    [2,9,5,9,2,9,5,9,2,9,5,9,2,9,5,9,2,9,1,2],
    [2,9,1,9,2,9,1,9,2,9,1,9,2,9,1,9,2,9,1,2],
    [2,9,9,9,2,9,9,9,2,9,9,9,2,9,9,9,2,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 2, "z": 4}, "door": {"x": 4, "z": 3}, "holdTime": 3}, {"button": {"x": 6, "z": 4}, "door": {"x": 8, "z": 3}, "holdTime": 3}, {"button": {"x": 10, "z": 4}, "door": {"x": 12, "z": 3}, "holdTime": 3}, {"button": {"x": 14, "z": 4}, "door": {"x": 18, "z": 3}, "holdTime": 0}],
  lasers: [],
  amica: {
    en: "Four timed gates in sequence. Three close after 3 seconds. The last is permanent. Run the chain without stopping.",
    it: "Quattro cancelli temporizzati in sequenza. Tre si chiudono dopo 3 secondi. L'ultimo è permanente. Corri la catena senza fermarti."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 47. Chain sequence.", "Four rooms in a row. Each button opens the gate to the next room for 3 seconds.", "The final gate stays open permanently.", "Press button one, run through, press button two, run through. Do not pause between rooms."],
    it: ["Chamber 47. Chain sequence.", "Four rooms in a row. Each button opens the gate to the next room for 3 seconds.", "The final gate stays open permanently.", "Press button one, run through, press button two, run through. Do not pause between rooms."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 47 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 47 completata. Il tuo contributo alla scienza è stato annotato. Se verrà usato è un'altra questione."]
  }},
});
