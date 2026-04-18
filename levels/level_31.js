// ── Chamber 31: Island Logistics ─────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 31,
  name: { en: 'CHAMBER 31 — ISLAND LOGISTICS', it: 'CAMERA 31 — LOGISTICA INSULARE' },
  hint: { en: 'Push the cube through the portal. It lands where the portal opens.', it: 'Spingi il cubo attraverso il portale. Atterra dove si apre il portale.' },
  width: 16, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,9,2,2,2,2,2,2,9,1,1,1,2],
    [2,1,1,1,9,2,7,1,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,1,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,5,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,1,1,1,1,2,9,1,1,1,2],
    [2,1,1,1,9,2,2,2,2,2,2,9,1,1,1,2],
    [2,1,1,1,9,9,9,9,9,9,9,9,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,4,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 7, z: 5 }, door: { x: 10, z: 10 }, holdTime: 0 }],
  amica: {
    en: "The cube and the button are in a sealed room. The button is not directly under the cube. Pushing is the easy part.",
    it: "Il cubo e il pulsante sono in una stanza sigillata. Il pulsante non è direttamente sotto il cubo. Spingere è la parte facile."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 31. The cube is inside a sealed room accessible only by portal.",
      "The button is also inside the room, but not adjacent to the cube.",
      "Enter the room via portal, align yourself behind the cube, push toward the button.",
      "Then portal out before you celebrate. The exit is outside the room.",
    ],
    it: [
      "Camera 31. Il cubo è dentro una stanza sigillata accessibile solo tramite portale.",
      "Il pulsante è anche dentro la stanza, ma non adiacente al cubo.",
      "Entra nella stanza tramite portale, allineati dietro il cubo, spingi verso il pulsante.",
      "Poi porta fuori prima di festeggiare. L'uscita è fuori dalla stanza.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You entered a sealed room, completed a task, and left. This is what we call operational efficiency. You did it accidentally, but it counts."],
    it: ["Sei entrato in una stanza sigillata, hai completato un compito e sei uscito. Questo è ciò che chiamiamo efficienza operativa. L'hai fatto per caso, ma conta."]
  }},
});
