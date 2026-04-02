// ── Chamber 07: Laser Introduction ──────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 7,
    name: { en: 'CHAMBER 07 — BEAM ALIGNMENT', it: 'CAMERA 07 — ALLINEAMENTO RAGGIO' },
    hint: { en: 'Use a portal to redirect the laser beam onto the receiver.', it: 'Usa un portale per reindirizzare il raggio laser sul ricevitore.' },
    width: 14, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,1,2,2,2,2,2,1,1,1,2],
      [2,1,3,1,1,2,2,2,2,2,1,1,1,2],
      [2,1,1,1,1,2,2,2,2,2,1,4,1,2],
      [2,9,9,9,9,2,2,2,2,2,6,1,1,2],
      [2,9,1,1,9,2,2,2,2,2,1,1,1,2],
      [2,9,1,1,9,2,2,2,2,2,9,9,9,2],
      [2,9,9,9,9,2,2,2,2,2,1,9,9,2],
      [2,10,1,1,1,1,1,1,1,1,1,11,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    lasers: [{ emitter:{x:1,z:8}, dir:{dx:1,dz:0}, receiverId:'11_7' }],
    links: [{ receiver:'11_7', door:{x:10,z:4} }],
    amica: {
      en: "A laser. Don't stare at it. Actually, stare at it. I'm curious what happens.",
      it: "Un laser. Non fissarlo. Anzi, fissalo pure. Sono curiosa di vedere cosa succede."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Chamber 07. Lasers.",
        "The orange beam is an Aperture Science Thermal Discouragement Beam.",
        "It is currently not pointed at anything useful.",
        "Your task: redirect it through a portal so it hits the blue receiver on the far wall.",
        "When the receiver activates, it opens the door to the exit.",
      ],
      it: [
        "Camera 07. Laser.",
        "Il raggio arancione è un Raggio di Scoraggiamento Termico Aperture Science.",
        "Al momento non è puntato verso nulla di utile.",
        "Il tuo compito: reindirizzarlo attraverso un portale in modo che colpisca il ricevitore blu sulla parete di fondo.",
        "Quando il ricevitore si attiva, apre la porta verso l'uscita.",
      ]
    }},
    stepCues: [
      { steps:4, lines: {
        en: [
          "LASER REDIRECTION PROTOCOL",
          "The emitter fires continuously in a fixed direction.",
          "Place Portal B (orange) in the laser's path.",
          "Place Portal A (blue) on a wall facing the receiver.",
          "The laser will travel through the portal and hit the receiver.",
        ],
        it: [
          "PROTOCOLLO REINDIRIZZAMENTO LASER",
          "L'emettitore spara continuamente in una direzione fissa.",
          "Piazza il Portale B (arancione) sulla traiettoria del laser.",
          "Piazza il Portale A (blu) su un muro rivolto verso il ricevitore.",
          "Il laser viaggerà attraverso il portale e colpirà il ricevitore.",
        ]
      }},
    ],
    events: {
      'laser:receiver-changed':{ condition:(d)=>!d.active, lines: {
        en: [
          "Laser beam is active.",
          "It needs to reach the receiver — the cyan glowing surface.",
          "Use portals to bend the beam's path.",
        ],
        it: [
          "Il raggio laser è attivo.",
          "Deve raggiungere il ricevitore, ovvero la superficie ciano luminosa.",
          "Usa i portali per deviare la traiettoria del raggio.",
        ]
      }, once:true },
      'laser:receiver-changed':{ condition:(d)=>d.active, lines: { 
        en: [
          "Receiver activated. Door opened. You redirected a laser with portals.",
          "I have updated your file. It now says 'competent'. That is unusual.",
        ],
        it: [
          "Ricevitore attivato. Porta aperta. Hai reindirizzato un laser con i portali.",
          "Ho aggiornato il tuo file. Ora dice 'competente'. È insolito.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "Laser + portals. You grasped it faster than expected.",
        "Expected was never. So technically, any speed is faster.",
      ],
      it: [
        "Laser + portali. Hai capito più in fretta del previsto.",
        "Il previsto era 'mai'. Quindi, tecnicamente, qualsiasi velocità è più veloce.",
      ]
    }},
  });

