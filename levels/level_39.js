// ── Chamber 39: THE LONG PUSH ──────────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 39,
  name: { en: 'CHAMBER 39 — THE LONG PUSH', it: 'CAMERA 39 — IL LUNGO SPINTA' },
  hint: { en: 'Push the cube all the way across. No walls to stop it early.', it: 'Spingi il cubo per tutta la lunghezza. Nessun muro per fermarlo prima.' },
  width: 20, height: 10,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,7,1,1,1,1,1,1,1,1,1,1,1,1,1,5,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 17, "z": 4}, "door": {"x": 9, "z": 8}}],
  lasers: [],
  amica: {
    en: "The corridor is 16 cells long. The cube must travel all of them. I will time you. For science.",
    it: "Il corridoio è lungo 16 celle. Il cubo deve percorrerle tutte. Ti cronometrerò. Per la scienza."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 39. A long push puzzle.", "The cube starts at the west end. The button is at the east end.", "You must align yourself behind the cube and push it continuously east.", "Portal walls flank the corridor. If you lose your line you will need to reposition via portal."],
    it: ["Camera 39. A long push puzzle.", "Il cubo starts at the west end. Il pulsante is at the east end.", "You must align yourself behind the cubo and push it continuously east.", "Portal walls flank the corridor. If you lose your line you will need to reposition via portal."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 39 complete. Your performance was adequate. The definition of adequate varies."],
    it: ["Camera 39 completata. La tua performance è stata adeguata. La definizione di adeguata varia."]
  }},
});
