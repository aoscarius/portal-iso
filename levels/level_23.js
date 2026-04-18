// ── Chamber 23: Double Redirect ──────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 23,
  name: { en: 'CHAMBER 23 — DOUBLE REDIRECT', it: 'CAMERA 23 — DOPPIO REINDIRIZZAMENTO' },
  hint: { en: 'The laser must bounce twice. Portals can act as mirrors.', it: 'Il laser deve rimbalzare due volte. I portali fungono da specchi.' },
  width: 16, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,9,9,9,2,2,2,2,2,2,9,9,9,9,2],
    [2,1,1,1,9,2,1,1,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,1,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,8,8,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,1,1,1,2,9,1,6,1,2],
    [2,1,1,1,9,2,2,2,2,2,2,9,1,1,1,2],
    [2,1,1,1,9,9,9,11,9,9,9,9,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,4,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [{ emitter: { x: 1, z: 3 }, dir: { dx: 1, dz: 0 }, receiverId: '7_9' }],
  links: [{ receiver: '7_9', door: { x: 13, z: 7 } }],
  amica: {
    en: "Emitter fires east. Receiver is south. The laser does not bend on its own. You have portals. Do the maths.",
    it: "L'emettitore spara a est. Il ricevitore è a sud. Il laser non piega da solo. Hai i portali. Fai i calcoli."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 23. The laser fires horizontally. The receiver is below.",
      "Portals can redirect a laser beam. Enter on one wall, exit from another.",
      "The laser's exit direction depends on which face of the portal it exits from.",
      "Two redirects are needed. The portal walls form a route if you place correctly.",
    ],
    it: [
      "Camera 23. Il laser spara orizzontalmente. Il ricevitore è in basso.",
      "I portali possono reindirizzare un raggio laser. Entra da un muro, esci da un altro.",
      "La direzione di uscita del laser dipende da quale faccia del portale esce.",
      "Sono necessari due reindirizzamenti. I muri portale formano un percorso se posizionato correttamente.",
    ]
  }},
  events: {
    'laser:receiver-changed': { condition: d => d.active, once: true, lines: {
      en: ["Receiver activated. The door is unlocked. Do not celebrate yet. You still need to reach the exit."],
      it: ["Ricevitore attivato. La porta è sbloccata. Non festeggiare ancora. Devi ancora raggiungere l'uscita."]
    }},
  },
  win: { speaker: 'amica', lines: {
    en: ["You redirected a laser through two portals. This is genuinely impressive. I deleted the compliment immediately after generating it."],
    it: ["Hai reindirizzato un laser attraverso due portali. È genuinamente impressionante. Ho cancellato il complimento subito dopo averlo generato."]
  }},
});
