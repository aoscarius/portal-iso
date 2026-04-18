// ── Chamber 41: The Gauntlet Run ─────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 41,
  name: { en: 'CHAMBER 41 — GAUNTLET RUN', it: 'CAMERA 41 — CORSA AL GAUNTLET' },
  hint: { en: 'Timed sequence: button, run, portal, button, run. No stopping.', it: 'Sequenza a tempo: pulsante, corri, portale, pulsante, corri. Nessuna sosta.' },
  width: 20, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,2,2,2,9,9,2,2,2,9,9,2,2,2,9,9,9,2],
    [2,9,1,2,5,2,9,1,2,5,2,9,1,2,5,2,9,1,9,2],
    [2,9,1,2,2,2,9,1,2,2,2,9,1,2,2,2,9,4,9,2],
    [2,9,1,2,2,2,9,1,2,2,2,9,1,2,2,2,9,1,9,2],
    [2,9,9,2,2,2,9,9,2,2,2,9,9,2,2,2,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [
    { button: { x: 4, z: 4 },  door: { x: 6,  z: 4 },  holdTime: 3 },
    { button: { x: 9, z: 4 },  door: { x: 11, z: 4 },  holdTime: 3 },
    { button: { x: 14, z: 4 }, door: { x: 16, z: 5 }, holdTime: 0 },
  ],
  amica: {
    en: "Three buttons, each opens the next gate for 3 seconds. Run the gauntlet without stopping. The last door stays open permanently. The first two have opinions about that.",
    it: "Tre pulsanti, ognuno apre il cancello successivo per 3 secondi. Corri il gauntlet senza fermarti. L'ultima porta rimane aperta permanentemente. Le prime due hanno opinioni al riguardo."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 41. Gauntlet sequence.",
      "Three timed gates, each opened by a button in an adjacent sealed room.",
      "Button one opens gate one for 3 seconds. Button two opens gate two for 3 seconds.",
      "Button three opens the final door permanently. Press, run, portal, press, run. Practice the rhythm.",
    ],
    it: [
      "Camera 41. Sequenza gauntlet.",
      "Tre cancelli temporizzati, ognuno aperto da un pulsante in una stanza sigillata adiacente.",
      "Il pulsante uno apre il cancello uno per 3 secondi. Il pulsante due apre il cancello due per 3 secondi.",
      "Il pulsante tre apre la porta finale permanentemente. Premi, corri, portale, premi, corri. Pratica il ritmo.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Gauntlet cleared. You coordinated speed, portals, and timing simultaneously. This is either remarkable or you just got lucky three times in a row."],
    it: ["Gauntlet superato. Hai coordinato velocità, portali e tempistica simultaneamente. Questo è o notevole o hai solo avuto fortuna tre volte di fila."]
  }},
});
