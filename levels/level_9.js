// ── Chamber 09: Laser + Portal redirect ─────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 9,
    name: { en: 'CHAMBER 09 — REDIRECTED SCIENCE', it: 'CAMERA 09 — SCIENZA REINDIRIZZATA' },
    hint: { en: 'Redirect the laser through portals to hit the receiver.', it: 'Reindirizza il laser attraverso i portali per colpire il ricevitore.' },
    width: 16, height: 14,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,3,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,2,2,2,2,2,9,9,9,9,9,2],
      [2,9,1,1,9,2,2,2,2,2,9,1,1,1,9,2],
      [2,9,1,1,9,2,2,2,2,2,9,1,11,1,9,2],
      [2,9,9,9,9,2,2,2,2,2,9,1,1,1,9,2],
      [2,1,1,1,1,2,2,2,2,2,9,9,9,9,9,2],
      [2,1,1,1,1,2,2,2,2,2,1,1,1,1,1,2],
      [2,1,1,1,9,9,9,9,9,9,9,9,9,9,1,2],
      [2,1,1,1,9,1,1,6,1,1,11,1,1,9,1,2],
      [2,10,1,1,9,1,1,1,1,1,1,4,1,9,1,2],
      [2,2,2,2,9,2,2,2,2,2,9,2,2,9,2,2],
    ],
    lasers: [
      { emitter:{x:1,z:12}, dir:{dx:1,dz:0}, receiverId:'10_11' },
    ],
    links: [
      { receiver:'10_11', door:{x:7,z:11} },
    ],
    amica: {
      en: "The laser must travel through portals. I designed this test in forty-three seconds. You have all day.",
      it: "Il laser deve passare attraverso i portali. Ho progettato questo test in quarantatré secondi. Tu hai tutto il giorno."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Chamber 09. Multi-hop laser routing.",
        "The laser emitter and the receiver are not on the same wall.",
        "You will need to route the beam through two separate portals to reach the target.",
        "This requires placing portals in a sequence. Think of it as a chain.",
      ],
      it: [
        "Camera 09. Rotte laser a salti multipli.",
        "L'emettitore laser e il ricevitore non sono sullo stesso muro.",
        "Dovrai indirizzare il raggio attraverso due portali separati per raggiungere il bersaglio.",
        "Questo richiede di piazzare i portali in sequenza. Pensalo come a una catena.",
      ]
    }},
    stepCues: [
      { steps:5, lines: {
        en: [
          "MULTI-PORTAL LASER PROTOCOL",
          "Step 1: Place a portal in the laser's direct path.",
          "Step 2: Place the exit portal facing toward the receiver.",
          "Step 3: Observe. Adjust if the beam misses.",
          "Remember: the laser exits the portal traveling in the SAME direction you're facing when you walk through one.",
        ],
        it: [
          "PROTOCOLLO LASER MULTI-PORTALE",
          "Punto 1: Piazza un portale sulla traiettoria diretta del laser.",
          "Punto 2: Piazza il portale di uscita rivolto verso il ricevitore.",
          "Punto 3: Osserva. Regola se il raggio manca il bersaglio.",
          "Ricorda: il laser esce dal portale viaggiando nella STESSA direzione in cui guardi quando ne attraversi uno.",
        ]
      }},
    ],
    event: {
      'laser:receiver-changed':{ condition:(d)=>!d.active, lines: {
        en: [
          "Laser is active and needs redirection.",
          "The receiver is the cyan surface. It needs to be hit from the correct angle.",
        ],
        it: [
          "Il laser è attivo e deve essere reindirizzato.",
          "Il ricevitore è la superficie ciano. Deve essere colpito dall'angolazione corretta.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "Multi-portal laser solution. Confirmed.",
        "Your spatial reasoning is adequate. I've updated your file from 'subject' to 'test candidate'. It's a minor distinction.",
      ],
      it: [
        "Soluzione laser multi-portale. Confermata.",
        "Il tuo ragionamento spaziale è adeguato. Ho aggiornato il tuo file da 'soggetto' a 'candidato al test'. È una distinzione minima.",
      ]
    }},
  });

