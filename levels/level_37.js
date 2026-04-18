// ── Chamber 37: Zone Sequence ────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 37,
  name: { en: 'CHAMBER 37 — ZONE SEQUENCE', it: 'CAMERA 37 — SEQUENZA ZONE' },
  hint: { en: 'Three zones, one button each. Portals connect all three.', it: 'Tre zone, un pulsante ciascuna. I portali le collegano tutte.' },
  width: 20, height: 14,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,2,9,9,9,9,9,2,9,9,9,9,9,9,2],
    [2,9,1,1,1,9,2,9,1,1,1,9,2,9,1,1,1,1,9,2],
    [2,9,1,5,1,9,2,9,1,5,1,9,2,9,1,5,1,1,9,2],
    [2,9,1,1,1,9,2,9,1,1,1,9,2,9,1,1,1,1,9,2],
    [2,9,1,1,1,9,2,9,1,1,1,9,2,9,1,1,1,1,9,2],
    [2,9,9,9,9,9,2,9,9,9,9,9,2,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,4,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [
    { button: { x: 3, z: 5 },  door: { x: 9,  z: 10 } },
    { button: { x: 9, z: 5 },  door: { x: 9,  z: 10 } },
    { button: { x: 15, z: 5 }, door: { x: 9,  z: 10 } },
  ],
  amica: {
    en: "Three rooms. Three buttons. All three must be pressed to open the single exit. You cannot be in three rooms at once. Yet.",
    it: "Tre stanze. Tre pulsanti. Tutti e tre devono essere premuti per aprire la singola uscita. Non puoi essere in tre stanze contemporaneamente. Ancora."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 37. Three sealed portal-walled rooms arranged side by side.",
      "Each contains a pressure plate. All three must be activated to open the exit.",
      "You must enter each room via portal, activate the button, and exit to visit the next.",
      "Efficiency is rewarded. Wandering is noted.",
    ],
    it: [
      "Camera 37. Tre stanze sigillate con muri portale disposte fianco a fianco.",
      "Ognuna contiene una piastra di pressione. Tutte e tre devono essere attivate per aprire l'uscita.",
      "Devi entrare in ogni stanza tramite portale, attivare il pulsante e uscire per visitare la successiva.",
      "L'efficienza è premiata. Il vagare viene annotato.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["Three zones cleared. You visited all of them. I appreciate thoroughness, even when it is accidental."],
    it: ["Tre zone liberate. Le hai visitate tutte. Apprezzo la minuziosità, anche quando è accidentale."]
  }},
});
