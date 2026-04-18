// ── Chamber 40: PERISCOPE ──────────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 40,
  name: { en: 'CHAMBER 40 — PERISCOPE', it: 'CAMERA 40 — PERISCOPIO' },
  hint: { en: 'Navigate around corners using portals as windows.', it: 'Naviga attorno agli angoli usando i portali come finestre.' },
  width: 16, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,2,2,2,2,2,2,9,9,9,9,2],
    [2,9,1,1,9,2,1,1,1,1,2,9,1,1,9,2],
    [2,9,1,1,9,2,1,8,8,1,2,9,1,1,9,2],
    [2,9,1,1,9,2,1,8,8,1,2,9,1,5,9,2],
    [2,9,1,1,9,2,1,1,1,1,2,9,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,2,2,2,2,2,2,9,9,9,9,2],
    [2,9,1,1,9,2,1,1,1,1,2,9,1,1,9,2],
    [2,9,1,7,9,2,1,1,1,1,2,9,1,1,9,2],
    [2,9,1,1,9,2,1,1,4,1,2,9,1,1,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 13, "z": 5}, "door": {"x": 8, "z": 12}}],
  lasers: [],
  amica: {
    en: "Four rooms in a cross pattern. A cube in the lower-left, a button in the upper-right, an exit in the lower-centre. A pleasant arrangement.",
    it: "Quattro stanze in schema a croce. Un cubo in basso a sinistra, un pulsante in alto a destra, un'uscita al centro in basso. Una disposizione piacevole."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 40. A cross-pattern chamber layout.", "The cube is in the lower-left quadrant. The button is in the upper-right quadrant.", "The hazard fills the centre connecting corridor.", "Use portals to relay the cube across the hazard to the button, then navigate to the exit."],
    it: ["Camera 40. A cross-pattern chamber layout.", "Il cubo is in the lower-left quadrant. Il pulsante is in the upper-right quadrant.", "Il hazard fills the centre connecting corridor.", "Use portals to relay the cubo across the hazard to the pulsante, then navigate to the exit."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 40 complete. Your performance was adequate. The definition of adequate varies."],
    it: ["Camera 40 completata. La tua performance è stata adeguata. La definizione di adeguata varia."]
  }},
});
