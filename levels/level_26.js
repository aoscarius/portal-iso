// ── Chamber 26: Fetch ────────────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 26,
  name: { en: 'CHAMBER 26 — FETCH', it: 'CAMERA 26 — RECUPERO' },
  hint: { en: 'Reach the cube island via portals. Bring the cube back.', it: 'Raggiungi l\'isola del cubo via portali. Riporta il cubo indietro.' },
  width: 18, height: 12,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,9,9,9,9,9,9,2,2,2,2,9,9,9,9,9,9,2],
    [2,9,1,1,1,1,9,2,8,8,2,9,1,1,1,1,9,2],
    [2,9,1,7,1,1,9,2,8,8,2,9,1,1,1,1,9,2],
    [2,9,1,1,1,1,9,2,8,8,2,9,1,5,1,1,9,2],
    [2,9,1,1,1,1,9,2,8,8,2,9,1,1,1,1,9,2],
    [2,9,9,9,9,9,9,2,8,8,2,9,9,9,9,9,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,4,1,1,1,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [{ button: { x: 13, z: 6 }, door: { x: 13, z: 10 }, holdTime: 0 }],
  amica: {
    en: "Two islands separated by hazard. The cube is on the left. The button is on the right. You are on neither. Efficient.",
    it: "Due isole separate da un pericolo. Il cubo è a sinistra. Il pulsante è a destra. Tu non sei su nessuna delle due. Efficiente."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 26. Two portal-walled islands separated by a hazard corridor.",
      "The cube is on the left island. The button — which opens the exit — is on the right island.",
      "You must portal to the cube island, push the cube back through a portal to the right island, then proceed to the exit.",
      "This is a four-step process. I trust you can count to four.",
    ],
    it: [
      "Camera 26. Due isole con muri portale separate da un corridoio pericoloso.",
      "Il cubo è sull'isola sinistra. Il pulsante — che apre l'uscita — è sull'isola destra.",
      "Devi portale verso l'isola del cubo, spingere il cubo di ritorno attraverso un portale verso l'isola destra, poi procedere verso l'uscita.",
      "Questo è un processo in quattro fasi. Mi fido che tu sappia contare fino a quattro.",
    ]
  }},
  events: {
    'cube:moved': { condition: () => true, once: true, lines: {
      en: ["Cube in motion. Keep it moving toward the button."],
      it: ["Cubo in movimento. Continualo a muovere verso il pulsante."]
    }},
    'cube:onbutton': { condition: () => true, once: true, lines: {
      en: ["Cube on button. Exit door open. Well done. Marginally."],
      it: ["Cubo sul pulsante. Porta di uscita aperta. Bravo. Marginalmente."]
    }},
  },
  win: { speaker: 'amica', lines: {
    en: ["Fetch complete. You retrieved an object across hazardous terrain. I added this to your personnel file under 'manual labour experience'."],
    it: ["Recupero completato. Hai recuperato un oggetto attraverso terreno pericoloso. L'ho aggiunto al tuo fascicolo personale sotto 'esperienza di lavoro manuale'."]
  }},
});
