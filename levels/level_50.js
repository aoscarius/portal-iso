// ── Chamber 50: THE FINAL CURTAIN ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 50,
  name: { en: 'CHAMBER 50 \u2014 THE FINAL CURTAIN', it: 'CAMERA 50 \u2014 IL SIPARIO FINALE' },
  hint: { en: 'Everything. All of it. Now.', it: 'Tutto. Tutto quanto. Adesso.' },
  width: 22, height: 18,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,9,9,9,2,2,9,9,9,9,2,2,9,9,9,9,2,2,9,11,2],
    [2,1,9,1,9,2,2,9,1,1,9,2,2,9,1,1,9,2,2,9,1,2],
    [2,1,9,7,9,2,2,9,1,5,9,2,2,9,1,7,9,2,2,9,1,2],
    [2,1,9,1,9,2,2,9,1,1,9,2,2,9,5,1,9,2,2,9,1,2],
    [2,1,9,9,9,2,2,9,9,9,9,2,2,9,9,9,9,2,2,9,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,12,1,8,8,8,1,12,1,8,8,8,1,12,1,8,8,1,9,2],
    [2,9,1,1,1,8,5,8,1,1,1,8,5,8,1,1,1,8,5,1,9,2],
    [2,9,1,1,1,8,1,8,1,1,1,8,1,8,1,1,1,8,1,1,9,2],
    [2,9,1,1,1,8,8,8,1,1,1,8,8,8,1,1,1,8,8,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 8, "z": 5}, "door": {"x": 9, "z": 16}}, {"button": {"x": 14, "z": 6}, "door": {"x": 9, "z": 16}}, {"button": {"x": 6, "z": 11}, "door": {"x": 9, "z": 16}}, {"button": {"x": 12, "z": 11}, "door": {"x": 9, "z": 16}}, {"button": {"x": 18, "z": 11}, "door": {"x": 9, "z": 16}}, {"receiver": "1_3", "door": {"x": 9, "z": 16}}],
  lasers: [{"emitter": {"x": 1, "z": 3}, "dir": {"dx": 1, "dz": 0}, "receiverId": "1_3"}],
  amica: {
    en: "Chamber 50. The last test. Everything simultaneously. I have nothing more to add. You know what to do. Probably.",
    it: "Camera 50. L'ultimo test. Tutto simultaneamente. Non ho altro da aggiungere. Sai cosa fare. Probabilmente."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 50. The final test.", "Six conditions must be met simultaneously to open the exit.", "Five cubes across three rooms and the lower section must each reach their buttons.", "A laser must be routed to its receiver via portal while all five cubes remain in place.", "I will be honest: I did not think you would make it this far. Begin."],
    it: ["Chamber 50. The final test.", "Six conditions must be met simultaneously to open the exit.", "Five cubes across three rooms and the lower section must each reach their buttons.", "A laser must be routed to its receiver via portal while all five cubes remain in place.", "I will be honest: I did not think you would make it this far. Begin."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 50 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 50 completata. Il tuo contributo alla scienza è stato annotato. Se verrà usato è un'altra questione."]
  }},
});
