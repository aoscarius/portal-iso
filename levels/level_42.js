// ── Chamber 42: The Answer ───────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 42,
  name: { en: 'CHAMBER 42 — THE ANSWER', it: 'CAMERA 42 — LA RISPOSTA' },
  hint: { en: '42. You know what it means. Find the question.', it: '42. Sai cosa significa. Trova la domanda.' },
  width: 20, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,7,1,1,8,8,8,8,8,8,8,8,8,1,1,1,9,2],
    [2,9,1,1,1,1,8,1,1,1,1,1,1,1,8,1,5,1,9,2],
    [2,9,1,1,1,1,8,1,1,1,1,1,1,1,8,1,1,1,9,2],
    [2,9,1,1,1,1,8,1,1,4,1,1,1,1,8,1,1,1,9,2],
    [2,9,1,1,1,1,8,1,1,1,1,1,1,1,8,1,1,1,9,2],
    [2,9,1,1,1,1,8,8,8,8,8,8,8,8,8,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 16, z: 6 }, door: { x: 9, z: 8 } }],
  amica: {
    en: "Chamber 42. The answer to life, the universe, and everything. The question, however, requires a cube, a button, some hazards, and no small amount of portal work.",
    it: "Camera 42. La risposta alla vita, all'universo e a tutto quanto. La domanda, tuttavia, richiede un cubo, un pulsante, alcuni pericoli e non poca lavoro con i portali."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 42.",
      "I will not make the obvious reference.",
      "...",
      "The answer is 42. The question is: how many steps will it take you to solve this? We will see.",
    ],
    it: [
      "Camera 42.",
      "Non farò il riferimento ovvio.",
      "...",
      "La risposta è 42. La domanda è: quanti passi ti ci vorranno per risolvere questo? Vedremo.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 42 complete. You found the answer. Whether you understood the question is a separate matter entirely."],
    it: ["Camera 42 completata. Hai trovato la risposta. Se hai capito la domanda è un'altra questione interamente."]
  }},
});