// ── Chamber 05: Hazards ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 5,
    name: { en: 'CHAMBER 05 — EMANCIPATION GRID', it: 'CAMERA 05 — GRIGLIA DI EMANCIPAZIONE' },
    hint: { en: 'Avoid the hazard tiles. Use portals to bypass them.', it: 'Evita le caselle pericolose. Usa i portali per superarle.' },
    width: 12, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,8,1,1,1,2,2,1,1,1,8,2],
      [2,1,3,1,1,2,2,1,1,1,1,2],
      [2,1,1,1,9,2,2,9,1,1,1,2],
      [2,1,1,1,9,8,8,9,1,4,1,2],
      [2,1,1,1,9,1,1,9,1,1,1,2],
      [2,1,1,1,9,2,2,9,1,1,1,2],
      [2,1,1,1,1,2,2,1,1,1,1,2],
      [2,8,1,1,1,2,2,1,1,1,8,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    amica: {
      en: "The emancipation grid will destroy all portals and cubes. Not you, though. Probably.",
      it: "La griglia di emancipazione distruggerà tutti i portali e i cubi. Ma non te. Probabilmente."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Chamber 05. Hazard tiles.",
        "The red tiles contain a highly persuasive gel that will end your participation in the testing program.",
        "Permanently.",
        "You will need to use portals to cross the gap. The highlighted walls accept portal placement.",
      ],
      it: [
        "Camera 05. Caselle pericolose.",
        "Le caselle rosse contengono un gel altamente persuasivo che porrà fine alla tua partecipazione al programma di test.",
        "Permanentemente.",
        "Dovrai usare i portali per attraversare il divario. I muri evidenziati accettano il piazzamento dei portali.",
      ]
    }},
    stepCues: [
      { steps:4, lines: { 
        en: [
          "HAZARD AVOIDANCE ADVISORY",
          "Red tiles = instant death.",
          "Place Portal A on one side of the hazard, Portal B on the other.",
          "Step into Portal A to emerge safely from Portal B.",
        ],
        it: [
          "AVVISO EVITAMENTO PERICOLI",
          "Caselle rosse = morte istantanea.",
          "Piazza il Portale A su un lato del pericolo, il Portale B sull'altro.",
          "Entra nel Portale A per uscire in sicurezza dal Portale B.",
        ]
      }},
    ],
    events: { 
      'portal:both':{ condition:()=>true, lines: {
        en: [
          "Both portals placed — you have created a safe passage over the hazard.",
          "Walk into the portal on your side to emerge on the far side.",
          "Do not hesitate. The hazard does not care about hesitation.",
        ],
        it: [
          "Entrambi i portali piazzati: hai creato un passaggio sicuro sopra il pericolo.",
          "Entra nel portale dal tuo lato per uscire dal lato opposto.",
          "Non esitare. Al pericolo non importa della tua esitazione.",
        ]
      }, once:true },
    },
    fail: { speaker: 'amica', lines: {
      en: [
        "You stepped on the hazard. I noted the time.",
        "Try placing portals on the marked walls to create a safe path across.",
      ],
      it: [
        "Sei finito sul pericolo. Ho annotato l'ora.",
        "Prova a piazzare i portali sui muri contrassegnati per creare un percorso sicuro.",
      ]
    }},
    win: { speaker: 'amica', lines: {
      en: [
        "You survived. Statistically speaking, this is better than average.",
      ],
      it: [
        "Sei sopravvissuto. Statisticamente parlando, è meglio della media.",
      ]
    }},
  });

