// â”€â”€ Chamber 45: BOOMERANG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 45,
  name: { en: 'CHAMBER 45 \u2014 BOOMERANG', it: "CAMERA 45 \u2014 BOOMERANG" },
  hint: { en: 'Press button at the start, reach exit at the far end.', it: "Premi pulsante all"inizio, raggiungi uscita in fondo.' },
  width: 18, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,2,2,2,2,2,2,2,2,2,9,9,9,2],
    [2,9,1,5,9,2,1,1,1,1,1,1,1,2,9,1,9,2],
    [2,9,1,1,9,2,1,8,8,8,8,8,1,2,9,1,9,2],
    [2,9,1,1,9,2,1,8,1,7,1,8,1,2,9,1,9,2],
    [2,9,9,9,9,2,1,8,1,1,1,8,1,2,9,1,9,2],
    [2,1,1,1,1,1,1,8,8,8,8,8,1,1,1,1,4,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 3, "z": 3}, "door": {"x": 16, "z": 7}, "holdTime": 0}],
  lasers: [],
  amica: {
    en: "Button top-left, exit bottom-right, cube in centre hazard block. A triangle of problems.",
    it: "Pulsante in alto a sinistra, uscita in basso a destra, cubo nel blocco di pericoli centrale. Un triangolo di problemi."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 45. A non-linear path.", "The button that opens the exit is near the start. The exit is near the far end.", "A cube inside the central hazard block must be retrieved and pushed to the button.", "Portal to the cube, push it out, relay it to the button room, then run to the exit."],
    it: ["Chamber 45. A non-linear path.", "The button that opens the exit is near the start. The exit is near the far end.", "A cube inside the central hazard block must be retrieved and pushed to the button.", "Portal to the cube, push it out, relay it to the button room, then run to the exit."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 45 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 45 completata. Il tuo contributo alla scienza Ã¨ stato annotato. Se verrÃ  usato Ã¨ un'altra questione."]
  }},
});
