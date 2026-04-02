// ── Chamber 08: Multi-cube Multi-door ────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 8,
    name: { en: 'CHAMBER 08 — CUBE LOGISTICS', it: 'CAMERA 08 — LOGISTICA CUBI' },
    hint: { en: 'Two cubes, two buttons, two doors. Think before you push.', it: 'Due cubi, due pulsanti, due porte. Pensa prima di spingere.' },
    width: 16, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,7,1,1,1,1,1,7,1,1,1,1,2],
      [2,1,1,1,1,1,9,1,1,9,1,1,1,1,1,2],
      [2,1,1,1,1,1,9,1,1,9,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,5,5,9,9,9,9,9,9,2],
      [2,9,1,1,1,1,1,6,6,1,1,1,1,1,9,2],
      [2,9,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
      [2,9,1,1,1,1,1,1,1,4,1,1,1,1,9,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    links: [
      { button:{x:7,z:6}, door:{x:7,z:7} },
      { button:{x:8,z:6}, door:{x:8,z:7} },
    ],
    amica: {
      en: "Two cubes. Two buttons. I would explain the puzzle, but that would make it less educational.",
      it: "Due cubi. Due pulsanti. Potrei spiegarti il puzzle, ma lo renderebbe meno educativo."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Two cubes. Two buttons. Two doors.",
        "Each cube must reach its corresponding button for both doors to open.",
        "Plan your pushes carefully. The cubes cannot be pulled back — only pushed forward.",
        "If you get stuck, press F1 to restart the chamber.",
      ],
      it: [
        "Due cubi. Due pulsanti. Due porte.",
        "Ogni cubo deve raggiungere il suo pulsante corrispondente affinché entrambe le porte si aprano.",
        "Pianifica le spinte con attenzione. I cubi non possono essere tirati, solo spinti in avanti.",
        "Se rimani bloccato, premi F1 per ricominciare la camera.",
      ]
    }},
    stepCues: [
      { steps:5, lines: {
        en: [
          "LOGISTICS ADVISORY",
          "Push each cube toward its target button.",
          "The buttons are in the central alcove — you will need to navigate around the hazard borders.",
          "Use portals to reposition yourself between cube pushes.",
        ],
        it: [
          "AVVISO LOGISTICO",
          "Spingi ogni cubo verso il suo pulsante bersaglio.",
          "I pulsanti sono nell'alcova centrale; dovrai navigare attorno ai bordi pericolosi.",
          "Usa i portali per riposizionarti tra una spinta e l'altra.",
        ]
      }},
    ],
    events: {
      'cube:onbutton':{ condition:()=>true, lines: { 
        en: [
          "One button down. One to go.",
          "Both doors only open when both buttons are held simultaneously.",
        ],
        it: [
          "Un pulsante attivato. Ne manca uno.",
          "Entrambe le porte si aprono solo quando entrambi i pulsanti sono premuti contemporaneamente.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "Two cubes, two buttons, solved.",
        "You have successfully completed a logistics puzzle. Aperture Science thanks you for your contribution to the field of moving objects onto other objects.",
      ],
      it: [
        "Due cubi, due pulsanti, risolto.",
        "Hai completato con successo un puzzle logistico. Aperture Science ti ringrazia per il tuo contributo nel campo dello spostamento di oggetti sopra altri oggetti.",
      ]
    }},
  });
