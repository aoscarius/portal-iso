// ── Chamber 04: Companion Cube ───────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 4,
    name: { en: 'CHAMBER 04 — WEIGHTED CUBE', it: 'CAMERA 04 — CUBO PESATO' },
    hint: { en: 'Push the cube onto the button to hold the door open.', it: 'Spingi il cubo sul pulsante per tenere aperta la porta.' },
    width: 10, height: 10,
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,1,1,1,9,9,9,9,1,2],
      [2,1,3,1,9,1,1,9,1,2],
      [2,1,1,1,9,1,7,9,1,2],
      [2,9,9,9,2,2,1,9,1,2],
      [2,9,1,9,2,2,1,9,1,2],
      [2,9,1,9,2,2,5,1,1,2],
      [2,9,9,9,2,2,6,1,1,2],
      [2,1,1,1,1,1,1,4,1,2],
      [2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:6,z:6}, door: {x:6,z:7} }],
    amica: {
      en: "The Weighted Storage Cube cannot speak. It also cannot feel pain. These facts are unrelated.",
      it: "Il Cubo di Archiviazione Pesato non può parlare. Non può nemmeno provare dolore. Questi fatti non sono correlati."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "Chamber 04. The Weighted Storage Cube is introduced.",
        "The cube is the cyan box. You can push it by walking into it.",
        "Push it onto the yellow button to hold the door open permanently.",
        "Unlike you, the cube will not get bored and wander off the button.",
      ],
      it: [
        "Camera 04. Viene introdotto il Cubo da Compagnia Pesato.",
        "Il cubo è la scatola ciano. Puoi spingerlo camminandoci contro.",
        "Spingilo sul pulsante giallo per tenere la porta aperta permanentemente.",
        "A differenza di te, il cubo non si annoierà né si allontanerà dal pulsante.",
      ]
    }},
    stepCues: [
      { steps:5, lines: {  
        en: [
          "CUBE HANDLING PROTOCOL",
          "Walk into the cube to push it one tile in that direction.",
          "Plan your route — if you push it into a corner, you may need to restart with F1.",
        ],
        it: [
          "PROTOCOLLO GESTIONE CUBO",
          "Cammina verso il cubo per spingerlo di una casella in quella direzione.",
          "Pianifica il percorso: se lo spingi in un angolo, potresti dover ricominciare con F1.",
        ]
      }},
    ],
    event: {
      'cube:onbutton':{ condition:()=>true, lines: {
        en: [
          "The cube is on the button. The door is now open.",
          "I am genuinely impressed. That is not a compliment, it is an observation.",
        ],
        it: [
          "Il cubo è sul pulsante. La porta è ora aperta.",
          "Sono sinceramente impressionata. Non è un complimento, è un'osservazione.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: {
      en: [
        "Excellent. You have demonstrated basic object manipulation skills.",
        "The cube will be destroyed after this test. This is not a metaphor. It will actually be destroyed.",
      ],
      it: [
        "Eccellente. Hai dimostrato abilità basilari di manipolazione degli oggetti.",
        "Il cubo verrà distrutto dopo questo test. Non è una metafora. Verrà distrutto davvero.",
      ]
    }},
  });

