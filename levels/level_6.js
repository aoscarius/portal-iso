// ── Chamber 06: Complex Portal Puzzle ───────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 6,
    name: { en: 'CHAMBER 06 — ADVANCED TESTING', it: 'CAMERA 06 — TEST AVANZATO' },
    hint: { en: 'Use portals creatively. The exit is behind the wall.', it: 'Usa i portali in modo creativo. L’uscita è dietro il muro.' },
    width: 14, height: 12,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,2,2,2,2,2,2,9,9,9,2],
      [2,9,1,9,2,1,1,1,1,2,9,1,9,2],
      [2,9,1,9,2,1,5,1,1,2,9,4,9,2],
      [2,9,9,9,2,1,1,1,1,2,9,9,9,2],
      [2,1,1,1,2,1,1,1,1,2,1,1,1,2],
      [2,1,1,1,2,2,6,2,2,2,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:6,z:5}, door: {x:6,z:8} }],
    amica: {
      en: "Excellent. You are thinking with portals. Most test subjects never reach this conclusion.",
      it: "Eccellente. Stai pensando con i portali. La maggior parte dei soggetti non arriva mai a questa conclusione."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Chamber 06. Advanced portal routing.",
        "The exit is in a sealed alcove. You cannot reach it directly.",
        "You will need to place portals creatively — using the marked walls — to reach areas that appear inaccessible.",
        "Think about where you need to go, then work backward to where portals should be placed.",
      ],
      it: [
        "Camera 06. Rotte avanzate dei portali.",
        "L'uscita è in un'alcova sigillata. Non puoi raggiungerla direttamente.",
        "Dovrai piazzare i portali in modo creativo, usando i muri contrassegnati, per raggiungere aree apparentemente inaccessibili.",
        "Pensa a dove devi andare, poi procedi a ritroso per capire dove piazzare i portali.",
      ]
    }},
    events: {
      'portal:first':{ condition:()=>true, lines: { 
        en: [
          "Portal placed. Now place the second one on a wall near your destination.",
          "Remember: you travel from one portal to the other. Either direction works.",
        ],
        it: [
          "Portale piazzato. Ora piazza il secondo su un muro vicino alla tua destinazione.",
          "Ricorda: viaggi da un portale all'altro. Funziona in entrambe le direzioni.",
        ]
      }, once:true },
      'player:landed':{ condition:(d)=>{ try{ return Physics.getTile(d.x,d.z)===CONSTANTS.TILE.BUTTON; }catch(e){ return false; } }, lines: { 
        en: [
          "Button activated. A door somewhere has opened.",
          "Explore the chamber — the route to the exit may now be clear.",
        ],
        it: [
          "Pulsante attivato. Una porta da qualche parte si è aperta.",
          "Esplora la camera: il percorso per l'uscita ora potrebbe essere libero.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "Impressive. You find the path through multiple portal hops.",
        "You are now thinking with portals. This is either progress or a warning sign.",
      ],
      it: [
        "Impressionante. Hai trovato il percorso attraverso salti multipli tra i portali.",
        "Ora stai pensando con i portali. Questo è un progresso o un segnale d'allarme.",
      ]
    }},
  });

