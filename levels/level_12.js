// ── Chamber 12: Kinetic Momentum ────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: 12,
    name: { en: 'CHAMBER 12 — KINETIC MOMENTUM', it: 'CAMERA 12 — MOMENTO CINETICO' },
    hint: { 
      en: 'The movable block is light but useful. Use portals to reach the isolated button.', 
      it: 'Il blocco mobile è leggero ma utile. Usa i portali per raggiungere il pulsante isolato.' 
    },
    width: 14, height: 9,
    grid: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,3,1,1,9,2,5,1,1,2,9,1,4,2], // Button 5 isolated
      [2,1,1,1,9,2,1,1,1,2,9,1,1,2],
      [2,8,8,8,8,2,1,1,1,2,8,8,8,2], // Hazard barrier
      [2,1,1,1,1,2,2,6,2,2,1,1,1,2], // Door 6
      [2,1,12,1,1,1,1,1,1,1,1,1,1,2], // Movable block 12
      [2,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,9,9,9,9,9,9,9,9,9,9,9,9,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    ],
    links: [{ button: {x:6,z:1}, door: {x:7,z:4} }],
    amica: {
      en: "The movable block doesn't block lasers, but it does respect gravity. And buttons.",
      it: "Il blocco mobile non blocca i laser, ma rispetta la gravità. E i pulsanti."
    },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({ 
    intro: { speaker:'amica', lines: {
      en: [
        "This block is light and agile.", 
        "Just like you, before the suspension period and the mandatory snacks."
      ],
      it: [
        "Questo blocco è leggero e agile.", 
        "Proprio come te, prima del periodo di sospensione e degli snack obbligatori."
      ] 
    }},
  });
