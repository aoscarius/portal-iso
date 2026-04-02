// ── Chamber 02: Portal Introduction ─────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 2,
    name: { en: 'CHAMBER 02 — PORTALS', it: 'CAMERA 02 — PORTALI' },
    hint: { 
      en: 'Aim with Z/X/C/V. Press Q for Portal A (blue), R for Portal B (orange). Walk into a portal to teleport.', 
      it: 'Mira con Z/X/C/V. Premi Q per il Portale A (blu), R per il Portale B (arancione). Entra in un portale per teletrasportarti.' 
    },
    width: 12, height: 8,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2],
      [2,9,9,9,1,1,1,1,9,9,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,1,9,1,3,1,1,9,4,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,1,9,1,1,1,1,9,1,9,2],
      [2,9,9,9,1,1,1,1,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    amica: {
      en: "The Aperture Science Handheld Portal Device. Try not to damage it. Or yourself.",
      it: "Il Dispositivo Portale Portatile della Aperture Science. Cerca di non danneggiarlo. O di non danneggiarti."
    },
  });

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
    intro: { speaker:'amica', lines: {
      en: [
        "Welcome to Test Chamber 02.",
        "You have been issued the Aperture Science Handheld Portal Device. Do not drop it.",
        "Press Q to fire Portal A (blue). Press R to fire Portal B (orange).",
        "Portals can only be placed on surfaces marked with a faint blue outline. Those are portal-capable walls.",
        "When both portals are placed, stepping into one will transport you to the other. Science.",
      ],
      it: [
        "Benvenuto nella Camera Test 02.",
        "Ti è stato consegnato il Dispositivo Portale Portatile della Aperture Science. Non farlo cadere.",
        "Premi Q per sparare il Portale A (blu). Premi R per il Portale B (arancione).",
        "I portali possono essere piazzati solo su superfici con un leggero contorno blu. Quelle sono pareti predisposte.",
        "Quando entrambi i portali sono piazzati, entrarne in uno ti trasporterà nell'altro. Scienza.",
      ]
    }},
    events: {
      'portal:first':{ condition:()=>true, lines: {
        en: [
          "You fired a portal. Good.",
          "Now fire the second one. Q for blue, R for orange. Aim at the wall on the other side.",
          "Hint: face the direction you want to shoot, then press the key.",
        ],
        it: [
          "Hai sparato un portale. Bene.",
          "Ora spara il secondo. Q per blu, R per arancione. Mira al muro dall'altra parte.",
          "Suggerimento: guarda nella direzione in cui vuoi sparare, poi premi il tasto.",
        ]
      }, once:true },
      'portal:both':{ condition:()=>true, lines: {
        en: [
          "Both portals are active!",
          "Walk into the blue portal to travel through it.",
          "You will emerge from the orange portal. Your molecules will reassemble automatically. Probably.",
        ],
        it: [
          "Entrambi i portali sono attivi!",
          "Entra nel portale blu per attraversarlo.",
          "Uscirai dal portale arancione. Le tue molecole si riassembleranno automaticamente. Probabilmente.",
        ]
      }, once:true },
      'portal:used':{ condition:()=>true, lines: {
        en: [
          "Successful portal traversal. All limbs accounted for.",
          "The exit should now be within reach.",
        ],
        it: [
          "Attraversamento del portale riuscito. Tutti gli arti sono presenti.",
          "L'uscita dovrebbe essere a portata di mano ora.",
        ]
      }, once:true },
    },
    win: { speaker: 'amica', lines: { 
      en: [
        "You have grasped the fundamental concept of portal technology.",
        "This puts you ahead of 40% of test subjects. The other 60% are not available for comment.",
      ],
      it: [
        "Hai compreso il concetto fondamentale della tecnologia dei portali.",
        "Questo ti pone davanti al 40% dei soggetti del test. Il restante 60% non è disponibile per commenti.",
      ]
    }},
  });
