// ── Chamber 24: Countdown ────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 24,
  name: { en: 'CHAMBER 24 — COUNTDOWN', it: 'CAMERA 24 — CONTO ALLA ROVESCIA' },
  hint: { en: 'The door closes automatically. Step on the button, run.', it: 'La porta si chiude automaticamente. Premi il pulsante, corri.' },
  width: 16, height: 11,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,2,2,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,9,2,6,9,1,1,1,1,4,9,2],
    [2,9,1,5,1,9,2,2,9,1,1,1,1,1,9,2],
    [2,9,1,1,1,9,2,2,9,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,2,2,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 3, z: 6 }, door: { x: 7, z: 5 }, holdTime: 4 }],
  amica: {
    en: "The button holds the door open for 4 seconds. 4 seconds is longer than it sounds until you are running.",
    it: "Il pulsante tiene la porta aperta per 4 secondi. 4 secondi sono più lunghi di quanto suonino finché non stai correndo."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 24. Timed door mechanics.",
      "The pressure plate holds the connecting door open for exactly 4 seconds after you leave it.",
      "Step on it, then move through the portal corridor to reach the door before it closes.",
      "If it closes, you restart. There is no trick. There is only speed.",
    ],
    it: [
      "Camera 24. Meccaniche di porte temporizzate.",
      "La piastra di pressione tiene la porta aperta per esattamente 4 secondi dopo che la lasci.",
      "Calpestala, poi muoviti attraverso il corridoio portale per raggiungere la porta prima che si chiuda.",
      "Se si chiude, ricomincia. Non c'è trucco. C'è solo velocità.",
    ]
  }},
  events: {
    'door:closed': { condition: () => true, once: true, lines: {
      en: ["The door closed. This is a consequence of time passing. Try again, but faster."],
      it: ["La porta si è chiusa. Questa è una conseguenza del passare del tempo. Riprova, ma più veloce."]
    }},
    'door:opened': { condition: () => true, once: true, lines: {
      en: ["Door open. Move. Do not stop to admire the architecture."],
      it: ["Porta aperta. Muoviti. Non fermarti ad ammirare l'architettura."]
    }},
  },
  win: { speaker: 'amica', lines: {
    en: ["You beat a countdown. I would time your reflexes more precisely but the sensor budget was cut."],
    it: ["Hai battuto un conto alla rovescia. Misurerei i tuoi riflessi più precisamente ma il budget per i sensori è stato tagliato."]
  }},
});
