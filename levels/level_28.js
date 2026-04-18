// ── Chamber 28: Triple Lock ───────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 28,
  name: { en: 'CHAMBER 28 — TRIPLE LOCK', it: 'CAMERA 28 — TRIPLA SERRATURA' },
  hint: { en: 'Three buttons, three doors. The order in which you press them matters.', it: 'Tre pulsanti, tre porte. L\'ordine in cui li premi è importante.' },
  width: 18, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,2,2,9,9,9,2,2,9,9,9,9,9,2],
    [2,9,1,1,9,2,6,9,1,9,6,2,9,1,1,1,9,2],
    [2,9,1,5,9,2,2,9,5,9,2,2,9,1,5,1,9,2],
    [2,9,1,1,9,2,2,9,1,9,2,2,9,1,1,1,9,2],
    [2,9,9,9,9,2,2,9,9,9,2,2,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,9,1,1,1,1,1,1,1,4,1,1,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [
    { button: { x: 3, z: 5 }, door: { x: 6, z: 4 } },
    { button: { x: 8, z: 5 }, door: { x: 10, z: 4 } },
    { button: { x: 14, z: 5 }, door: { x: 14, z: 4 }, holdTime: 0 },
  ],
  amica: {
    en: "Three buttons. Each opens its own door. The last one stays open permanently. The first two do not. Plan accordingly.",
    it: "Tre pulsanti. Ognuno apre la sua porta. L'ultimo rimane aperto permanentemente. I primi due no. Pianifica di conseguenza."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 28. Three rooms, three buttons, three doors.",
      "The first button opens a door to the second room. The second button opens a door to the third.",
      "The third button opens the gate to the exit corridor permanently.",
      "You must navigate all three rooms in sequence. Portals help you cross the outer ring.",
    ],
    it: [
      "Camera 28. Tre stanze, tre pulsanti, tre porte.",
      "Il primo pulsante apre una porta verso la seconda stanza. Il secondo apre una porta verso la terza.",
      "Il terzo pulsante apre permanentemente il cancello verso il corridoio di uscita.",
      "Devi navigare tutte e tre le stanze in sequenza. I portali ti aiutano ad attraversare l'anello esterno.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Three sequential puzzles completed. You have the patience of someone who has no choice but to have patience."],
    it: ["Tre puzzle sequenziali completati. Hai la pazienza di qualcuno che non ha altra scelta che avere pazienza."]
  }},
});
