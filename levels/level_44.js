// â”€â”€ Chamber 44: THE VOID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 44,
  name: { en: 'CHAMBER 44 \u2014 THE VOID', it: "CAMERA 44 \u2014 IL VUOTO" },
  hint: { en: 'Walk where there is no floor. Or find another way.', it: "Cammina dove non c"Ã¨ pavimento. O trova un altro modo.' },
  width: 16, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,2,0,0,0,0,2,9,9,9,9,2],
    [2,9,1,1,9,2,0,0,0,0,2,9,1,1,9,2],
    [2,9,1,5,9,2,0,0,0,0,2,9,1,4,9,2],
    [2,9,1,1,9,2,0,0,0,0,2,9,1,1,9,2],
    [2,9,9,9,9,2,0,0,0,0,2,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 3, "z": 5}, "door": {"x": 13, "z": 5}, "holdTime": 0}],
  lasers: [],
  amica: {
    en: "The centre has no floor. Portal walls exist on both sides. The exit is across the void.",
    it: "Il centro non ha pavimento. I muri portale esistono su entrambi i lati. L'uscita Ã¨ oltre il vuoto."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 44. The void.", "The centre corridor has no floor tiles â€” just empty space.", "You cannot walk across.", "Portal walls flank both sides. A portal placed correctly skips the void entirely."],
    it: ["Chamber 44. The void.", "The centre corridor has no floor tiles â€” just empty space.", "You cannot walk across.", "Portal walls flank both sides. A portal placed correctly skips the void entirely."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 44 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 44 completata. Il tuo contributo alla scienza Ã¨ stato annotato. Se verrÃ  usato Ã¨ un'altra questione."]
  }},
});
