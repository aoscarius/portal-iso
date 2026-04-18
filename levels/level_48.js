// â”€â”€ Chamber 48: THE ARCHITECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 48,
  name: { en: 'CHAMBER 48 \u2014 THE ARCHITECT', it: "CAMERA 48 \u2014 L"ARCHITETTO' },
  hint: { en: 'Everything is a portal wall. Plan your route before you build it.', it: "Tutto Ã¨ un muro portale. Pianifica il percorso prima di costruirlo." },
  width: 18, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,8,1,1,1,8,1,1,1,8,1,1,1,9,2],
    [2,9,1,7,8,1,1,7,8,1,1,7,8,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,5,1,1,1,5,1,1,1,5,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 6, "z": 7}, "door": {"x": 8, "z": 11}}, {"button": {"x": 10, "z": 7}, "door": {"x": 8, "z": 11}}, {"button": {"x": 14, "z": 7}, "door": {"x": 8, "z": 11}}],
  lasers: [],
  amica: {
    en: "Three cubes, three hazard walls, three buttons. All three buttons simultaneously to open exit. Nothing is adjacent.",
    it: "Tre cubi, tre muri di pericolo, tre pulsanti. Tutti e tre i pulsanti contemporaneamente per aprire l'uscita. Niente Ã¨ adiacente."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 48. Multi-cube simultaneous placement.", "Three cubes must be pushed to three separate buttons simultaneously.", "Hazard walls separate each cube from its target button.", "Use portals to relay each cube across the hazard to its button. Plan all three paths before executing."],
    it: ["Chamber 48. Multi-cube simultaneous placement.", "Three cubes must be pushed to three separate buttons simultaneously.", "Hazard walls separate each cube from its target button.", "Use portals to relay each cube across the hazard to its button. Plan all three paths before executing."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 48 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 48 completata. Il tuo contributo alla scienza Ã¨ stato annotato. Se verrÃ  usato Ã¨ un'altra questione."]
  }},
});
