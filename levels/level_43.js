// ── Chamber 43: SPAGHETTI ──────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 43,
  name: { en: 'CHAMBER 43 \u2014 SPAGHETTI', it: 'CAMERA 43 \u2014 SPAGHETTI' },
  hint: { en: 'Multiple overlapping systems. Untangle them one at a time.', it: 'Sistemi multipli sovrapposti. Districali uno alla volta.' },
  width: 18, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,9,9,9,9,2,2,9,9,9,9,2,2,9,9,11,2],
    [2,1,9,1,1,9,2,6,9,1,1,9,6,2,9,1,1,2],
    [2,1,9,1,5,9,2,2,9,1,5,9,2,2,9,1,1,2],
    [2,1,9,1,1,9,2,2,9,7,1,9,2,2,9,1,1,2],
    [2,1,9,9,9,9,2,2,9,9,9,9,2,2,9,9,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,4,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 4, "z": 5}, "door": {"x": 7, "z": 4}}, {"button": {"x": 10, "z": 5}, "door": {"x": 12, "z": 4}}, {"receiver": "16_3", "door": {"x": 9, "z": 11}}],
  lasers: [{"emitter": {"x": 1, "z": 3}, "dir": {"dx": 1, "dz": 0}, "receiverId": "16_3"}],
  amica: {
    en: "Three interleaved systems. Laser, two cubes, two buttons. Untangle them in the right order.",
    it: "Tre sistemi intrecciati. Laser, due cubi, due pulsanti. Districali nell'ordine giusto."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 43. Multiple simultaneous systems.", "Laser must reach receiver to open the outer gate.", "Two cubes must reach their buttons to open two inner doors.", "Start with what is reachable. The rest follows."],
    it: ["Chamber 43. Multiple simultaneous systems.", "Laser must reach receiver to open the outer gate.", "Two cubes must reach their buttons to open two inner doors.", "Start with what is reachable. The rest follows."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 43 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 43 completata. Il tuo contributo alla scienza è stato annotato. Se verrà usato è un'altra questione."]
  }},
});
