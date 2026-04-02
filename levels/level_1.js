// ── Chamber 01: Introduction ────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 1,
    name: { en: 'CHAMBER 01 — AWAKENING', it: 'CAMERA 01 — IL RISVEGLIO' },
    hint: { en: 'Reach the exit. Walk forward.', it: 'Raggiungi l’uscita. Cammina in avanti.' },
    width: 8, height: 8,
    grid: [
      [2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,2],
      [2,1,1,1,1,4,1,2],
      [2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2],
    ],
    amica: { 
      en: "Good morning. You have been in suspension for... a while. Please proceed to the exit.",
      it: "Buongiorno. Sei in sospensione da... un po'. Per favore, procedi verso l'uscita."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Oh. You're awake.",
        "I was beginning to wonder if the re-animation process had failed. It does that sometimes. Not often. Occasionally.",
        "You are currently in Test Chamber 01. Your objective is simple: reach the glowing green exit panel.",
        "Use the WASD keys or arrow keys to move. Try not to walk into walls. This is harder than it sounds, statistically.",
      ],
      it: [
        "Oh. Sei sveglio.",
        "Iniziavo a chiedermi se il processo di rianimazione fosse fallito. Succede a volte. Non spesso. Occasionalmente.",
        "Ti trovi nella Camera Test 01. Il tuo obiettivo è semplice: raggiungi il pannello d'uscita verde luminoso.",
        "Usa i tasti WASD o le frecce per muoverti. Cerca di non sbattere contro i muri. Statisticamente, è più difficile di quanto sembri.",
      ]
    }},
    stepCues: [
      { steps:3, lines: { 
        en: [
          "APERTURE SCIENCE MOVEMENT PROTOCOL",
          "W / ↑ = move up-left   S / ↓ = move down-right",
          "A / ← = move left      D / → = move right",
          "The exit tile glows green. You cannot miss it. Unless you try.",
        ],
        it: [
          "PROTOCOLLO DI MOVIMENTO APERTURE SCIENCE",
          "W / ↑ = muovi su-sinistra   S / ↓ = muovi giù-destra",
          "A / ← = muovi sinistra      D / → = muovi destra",
          "La casella di uscita brilla di verde. Non puoi mancarla. A meno che tu non ci provi.",
        ]
      }},
    ],
    win: { speaker: 'amica', lines: {
      en: [
        "You reached the exit. I am... not surprised.",
        "That was the easiest test in the facility. Congratulations on clearing the absolute minimum.",
      ],
      it: [
        "Hai raggiunto l'uscita. Non sono... sorpresa.",
        "Questo era il test più facile della struttura. Congratulazioni per aver superato il minimo indispensabile.",
      ]
    }},
  });
