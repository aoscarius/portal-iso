// â”€â”€ Chamber 46: PATIENCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 46,
  name: { en: 'CHAMBER 46 \u2014 PATIENCE', it: "CAMERA 46 \u2014 PAZIENZA" },
  hint: { en: 'Three nested rings. Work inward, then out.', it: "Tre anelli annidati. Lavora verso l"interno, poi fuori.' },
  width: 18, height: 16,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,9,9,9,9,9,9,9,9,9,9,9,1,1,9,2],
    [2,9,1,9,1,1,1,1,1,1,1,1,1,9,1,1,9,2],
    [2,9,1,9,1,9,9,9,9,9,9,1,1,9,1,1,9,2],
    [2,9,1,9,1,9,1,5,1,4,9,1,1,9,1,1,9,2],
    [2,9,1,9,1,9,9,9,9,9,9,1,1,9,1,1,9,2],
    [2,9,1,9,1,1,1,1,1,1,1,1,1,9,1,1,9,2],
    [2,9,1,9,9,9,9,9,9,9,9,9,9,9,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{"button": {"x": 7, "z": 8}, "door": {"x": 9, "z": 8}, "holdTime": 0}],
  lasers: [],
  amica: {
    en: "Three concentric portal rings. Button and exit at the centre. Portal inward three times. Portal outward once.",
    it: "Tre anelli portale concentrici. Pulsante ed uscita al centro. Portale verso l'interno tre volte. Portale verso l'esterno una volta."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: ["Chamber 46. Triple nested rings.", "The button and exit are at the absolute centre of three concentric portal-walled rings.", "You must portal through each ring to reach the centre.", "Press the button, then portal back out through each ring to the exit â€” which is also at centre."],
    it: ["Chamber 46. Triple nested rings.", "The button and exit are at the absolute centre of three concentric portal-walled rings.", "You must portal through each ring to reach the centre.", "Press the button, then portal back out through each ring to the exit â€” which is also at centre."]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Chamber 46 complete. Your contribution to science has been noted. Whether it will be used is another matter."],
    it: ["Camera 46 completata. Il tuo contributo alla scienza Ã¨ stato annotato. Se verrÃ  usato Ã¨ un'altra questione."]
  }},
});
