// ── Chamber 49: PENULTIMATE ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 49,
  name: { en: 'CHAMBER 49 \u2014 PENULTIMATE', it: 'CAMERA 49 \u2014 PENULTIMO' },
  hint: { en: 'Second to last. Do not relax yet.', it: 'Il penultimo. Non rilassarti ancora.' },
  width: 20, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,9,9,9,9,2,2,9,9,9,2,2,9,9,9,9,9,11,2],
    [2,1,9,1,1,9,2,6,9,1,9,6,2,9,1,1,1,9,1,2],
    [2,1,9,1,7,9,2,2,9,5,9,2,2,9,1,7,5,9,1,2],
    [2,1,9,1,1,9,2,2,9,1,9,2,2,9,1,1,1,9,1,2],
    [2,1,9,9,9,9,2,2,9,9,9,2,2,9,9,9,9,9,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 4, "z": 5}, "door": {"x": 7, "z": 4}}, {"button": {"x": 9, "z": 5}, "door": {"x": 11, "z": 4}}, {"button": {"x": 15, "z": 5}, "door": {"x": 9, "z": 10}}, {"receiver": "1_3", "door": {"x": 9, "z": 10}}],
  lasers: [{"emitter": {"x": 1, "z": 3}, "dir": {"dx": 1, "dz": 0}, "receiverId": "1_3"}],
  amica: {
    en: "Three portal chambers, two cubes, three buttons, one laser receiver. All conditions simultaneously. I saved the second-hardest for last.",
    it: "Tre camere portale, due cubi, tre pulsanti, un ricevitore laser. Tutte le condizioni contemporaneamente. Ho salvato il secondo più difficile per ultimo."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 49. The penultimate challenge.", "Three portal-walled rooms, each with a cube and a button.", "A laser fires from the west. Its receiver must be hit to open the exit along with three buttons.", "Four simultaneous conditions. Four problems to solve. Begin."],
    it: ["Chamber 49. The penultimate challenge.", "Three portal-walled rooms, each with a cube and a button.", "A laser fires from the west. Its receiver must be hit to open the exit along with three buttons.", "Four simultaneous conditions. Four problems to solve. Begin."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 49 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 49 completata. Il tuo contributo alla scienza è stato annotato. Se verrà usato è un'altra questione."]
  }},
});
