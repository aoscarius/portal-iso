// ── Chamber 35: Blind Shot ───────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 35,
  name: { en: 'CHAMBER 35 — BLIND SHOT', it: 'CAMERA 35 — TIRO CIECO' },
  hint: { en: 'The portal wall is not visible from your starting position. Explore first.', it: 'Il muro portale non è visibile dalla tua posizione iniziale. Esplora prima.' },
  width: 18, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2],
    [2,1,1,1,2,8,8,8,8,8,8,8,8,8,2,1,1,2],
    [2,1,1,1,2,8,1,1,1,1,1,1,1,8,2,1,1,2],
    [2,1,1,1,2,8,1,9,9,9,9,1,1,8,2,1,1,2],
    [2,1,1,1,2,8,1,9,4,1,9,1,1,8,2,1,1,2],
    [2,1,1,1,2,8,1,9,9,9,9,1,1,8,2,1,1,2],
    [2,1,1,1,2,8,1,1,1,1,1,1,1,8,2,1,1,2],
    [2,1,1,1,2,8,8,8,8,8,8,8,8,8,2,1,1,2],
    [2,1,1,1,2,2,2,2,2,2,2,2,2,2,2,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  amica: {
    en: "There is one portal wall in this chamber. It is on the bottom-right corner. The exit is behind a hazard moat and a portal wall ring. I trust you can work backwards.",
    it: "C'è un solo muro portale in questa camera. È nell'angolo in basso a destra. L'uscita è dietro un fossato di pericoli e un anello di muri portale. Mi fido che tu possa ragionare a ritroso."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 35. Exploration required.",
      "The exit is in the centre of a hazard-surrounded portal-walled block.",
      "There is one portal wall accessible from the outside — at the bottom-right.",
      "From there you can reach the inner portal ring. Survey the layout before firing.",
    ],
    it: [
      "Camera 35. Esplorazione richiesta.",
      "L'uscita è al centro di un blocco di muri portale circondato da pericoli.",
      "C'è un muro portale accessibile dall'esterno — in basso a destra.",
      "Da lì puoi raggiungere l'anello portale interno. Studia il layout prima di sparare.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You found the entry point and executed correctly. Navigation plus execution. Two skills in one chamber. I will update your skills matrix accordingly."],
    it: ["Hai trovato il punto di ingresso e hai eseguito correttamente. Navigazione più esecuzione. Due competenze in una camera. Aggiornerò la tua matrice di competenze di conseguenza."]
  }},
});
