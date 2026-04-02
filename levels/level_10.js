// ── Chamber 10: The Gauntlet ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 10,
    name: { en: 'CHAMBER 10 — FINAL SYNTHESIS', it: 'CAMERA 10 — SINTESI FINALE' },
    hint: { en: 'Every mechanic combined. Portals, cubes, lasers, hazards. Good luck.', it: 'Ogni meccanica combinata. Portali, cubi, laser, pericoli. Buona fortuna.' },
    width: 18, height: 16,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,2,2,2,2,2,2,2,9,9,9,9,9,9,2],
      [2,9,1,9,2,8,8,8,8,8,2,9,1,1,1,1,9,2],
      [2,9,1,9,2,8,1,1,1,8,2,9,1,7,1,1,9,2],
      [2,9,9,9,2,8,1,5,1,8,2,9,1,1,11,1,9,2],
      [2,1,1,1,2,8,1,1,1,8,2,9,1,1,1,1,9,2],
      [2,1,1,1,2,8,8,6,8,8,2,9,9,9,9,9,9,2],
      [2,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
      [2,10,1,1,1,1,1,4,1,1,1,1,1,1,1,1,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [
      { emitter:{x:1,z:14}, dir:{dx:1,dz:0}, receiverId:'14_7' },
    ],
    links: [
      { button:{x:7,z:7}, door:{x:7,z:9} },
      { receiver:'14_7', door:{x:7,z:9} },
    ],
    amica: {
      en: "This is the final test. I want you to know that I am very proud of you. That was a lie. Good luck.",
      it: "Questo è il test finale. Voglio che tu sappia che sono molto orgogliosa di te. Era una bugia. Buona fortuna."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: { 
      en: [
        "Chamber 10. The final test.",
        "Everything you have learned is required here: portal navigation, cube management, laser redirection, and hazard avoidance.",
        "There is no single solution. There are several wrong ones.",
        "Good luck. I mean that in the statistical sense — luck will not help you, but the phrase is culturally appropriate.",
      ],
      it: [
        "Camera 10. Il test finale.",
        "Tutto ciò che hai imparato è richiesto qui: navigazione tra i portali, gestione dei cubi, reindirizzamento laser ed evitamento pericoli.",
        "Non esiste un'unica soluzione. Ce ne sono diverse sbagliate.",
        "Buona fortuna. Lo dico in senso statistico: la fortuna non ti aiuterà, ma la frase è culturalmente appropriata.",
      ]
    }},
    stepCues: [
      { steps:5, lines: {
        en: [
          "FINAL CHAMBER BRIEFING",
          "Objectives in suggested order:",
          "1. Navigate past the hazard zone using portals.",
          "2. Push the cube onto the button to open the inner door.",
          "3. Redirect the laser to activate the receiver and open the outer gate.",
          "4. Reach the exit.",
        ],
        it: [
          "BRIEFING CAMERA FINALE",
          "Obiettivi nell'ordine suggerito:",
          "1. Supera la zona pericolosa usando i portali.",
          "2. Spingi il cubo sul pulsante per aprire la porta interna.",
          "3. Reindirizza il laser per attivare il ricevitore e aprire il cancello esterno.",
          "4. Raggiungi l'uscita.",
        ]
      }},
    ],
    event: {
      'player:landed':{ condition:(d)=>{ try{ return Physics.getTile(d.x,d.z)===CONSTANTS.TILE.BUTTON; }catch(e){ return false; } }, lines: { 
        en: [
          "Button activated. One obstacle down.",
          "The laser still needs to hit the receiver.",
        ],
        it: [
          "Pulsante attivato. Un ostacolo in meno.",
          "Il laser deve ancora colpire il ricevitore.",
        ]
      }, once:true },
      'laser:receiver-changed':{ condition:(d)=>!d.active, lines: {
        en: [
          "LASER SYSTEM ACTIVE",
          "Route the beam to the receiver using portals.",
          "The receiver is on the marked wall. The emitter fires from the left side.",
        ],
        it: [
          "SISTEMA LASER ATTIVO",
          "Invia il raggio al ricevitore usando i portali.",
          "Il ricevitore è sulla parete contrassegnata. L'emettitore spara dal lato sinistro.",
        ]
      }, once:true },
      'door:opened':{ condition:()=>true, lines: {
        en: [
          "Door opened. The exit is in reach.",
          "You are one step from completing all Aperture Science test chambers.",
          "I have prepared a speech. It is mostly statistics.",
        ],
        it: [
          "Porta aperta. L'uscita è a portata di mano.",
          "Sei a un passo dal completare tutte le camere test della Aperture Science.",
          "Ho preparato un discorso. Sono per lo più statistiche.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "All test chambers complete.",
        "Your contribution to science has been noted, filed, and will probably never be reviewed.",
        "The Aperture Science Enrichment Center thanks you for your participation.",
        "You may now return to your life.",
        "...",
        "There is cake waiting in the break room. This is true.",
      ],
      it: [
        "Tutte le camere test completate.",
        "Il tuo contributo alla scienza è stato annotato, archiviato e probabilmente non sarà mai revisionato.",
        "Il Centro di Arricchimento della Aperture Science ti ringrazia per la partecipazione.",
        "Ora puoi tornare alla tua vita.",
        "...",
        "C'è una torta che ti aspetta nella sala relax. Dico sul serio.",
      ]
    }},
  });

