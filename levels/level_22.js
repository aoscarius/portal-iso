// ── Chamber 22: Cube Relay ────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 22,
  name: { en: 'CHAMBER 22 — CUBE RELAY', it: 'CAMERA 22 — STAFFETTA CUBI' },
  hint: { en: 'The cube cannot cross fire on its own. Help it.', it: 'Il cubo non può attraversare il fuoco da solo. Aiutalo.' },
  width: 16, height: 10,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,3,1,7,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,1,1,1,8,8,8,8,8,8,1,1,1,9,2],
    [2,9,1,1,1,8,1,1,1,1,8,1,1,1,9,2],
    [2,9,1,1,1,8,1,5,1,1,8,1,1,4,9,2],
    [2,9,1,1,1,8,1,1,1,1,8,1,1,1,9,2],
    [2,9,1,1,1,8,8,8,8,8,8,1,1,1,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 7, z: 6 }, door: { x: 13, z: 6 }, holdTime: 0 }],
  amica: {
    en: "The button is inside the hazard zone. The cube is outside. The exit is also outside. This is a logistics problem.",
    it: "Il pulsante è dentro la zona pericolosa. Il cubo è fuori. L'uscita è anche fuori. Questo è un problema logistico."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 22. Portal relay problem.",
      "The button that opens the exit door is inside a hazard zone.",
      "You cannot reach it on foot. The cube can be sent through a portal.",
      "Position portals so the cube lands on the button from outside the hazard ring.",
    ],
    it: [
      "Camera 22. Problema di staffetta portale.",
      "Il pulsante che apre la porta di uscita è dentro una zona pericolosa.",
      "Non puoi raggiungerlo a piedi. Il cubo può essere inviato attraverso un portale.",
      "Posiziona i portali in modo che il cubo atterri sul pulsante dall'esterno dell'anello pericoloso.",
    ]
  }},
  events: {
    'cube:onbutton': { condition: () => true, once: true, lines: {
      en: ["Cube on button. The door is open. Now get yourself through."],
      it: ["Cubo sul pulsante. La porta è aperta. Ora passa tu stesso."]
    }},
  },
  win: { speaker: 'amica', lines: {
    en: ["Cube relay complete. You used a box as a proxy. This is either clever or lazy. Both, probably."],
    it: ["Staffetta cubi completata. Hai usato una scatola come proxy. È o furbo o pigro. Probabilmente entrambi."]
  }},
});
