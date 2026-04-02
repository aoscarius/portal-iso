// ── Chamber 03: Button & Door ────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 3,
    name: { en: 'CHAMBER 03 — PRESSURE PLATES', it: 'CAMERA 03 — PIASTRE A PRESSIONE' },
    hint: { en: 'Step on the button to open the door, then reach the exit.', it: 'Sali sul pulsante per aprire la porta, poi raggiungi l’uscita.' },
    width: 10, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,5,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,6,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,4,1,1,2],
      [2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:4,z:4}, door: {x:5,z:6} }],
    amica: {
      en: "The button opens the door. This is not a metaphor.",
      it: "Il pulsante apre la porta. Questa non è una metafora."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "This chamber introduces the Aperture Science Weighted Pressure Plate.",
        "The yellow disc on the floor is a button. Standing on it activates something.",
        "In this case, it opens a door. The door is red. The exit is green. Please don't confuse them.",
      ],
      it: [
        "Questa camera introduce la Piastra a Pressione Pesata Aperture Science.",
        "Il disco giallo sul pavimento è un pulsante. Starci sopra attiva qualcosa.",
        "In questo caso, apre una porta. La porta è rossa. L'uscita è verde. Per favore, non confonderle.",
      ]
    }},
    events: {
      'player:landed':{ condition:(d)=>{ try{ return Physics.getTile(d.x,d.z)===CONSTANTS.TILE.BUTTON; }catch(e){ return false; } }, lines: {
        en: [
          "Pressure plate activated!",
          "The linked door has been unlocked. You can now walk through it.",
          "Note: stepping off the button does NOT close the door in this chamber. You are welcome.",
        ],
        it: [
          "Piastra a pressione attivata!",
          "La porta collegata è stata sbloccata. Ora puoi attraversarla.",
          "Nota: scendere dal pulsante NON chiude la porta in questa camera. Prego.",
        ]
      }, once:true },
      'door:opened':{ condition:()=>true, lines: {
        en: [
          "Door open. Please proceed before I change my mind.",
        ],
        it: [
          "Porta aperta. Procedi pure prima che io cambi idea.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: { 
      en: [
        "Button → door → exit. You solved it.",
        "I will not pretend that required exceptional intellect. But it was adequate.",
      ],
      it: [
        "Pulsante → porta → uscita. Risolto.",
        "Non fingerò che abbia richiesto un intelletto eccezionale. Ma è stato adeguato.",
      ]
    }},
  });

