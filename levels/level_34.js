// ── Chamber 34: Dam the Beam ─────────────────────────────

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
  id: 34,
  name: { en: 'CHAMBER 34 — DAM THE BEAM', it: 'CAMERA 34 — DIGA AL RAGGIO' },
  hint: { en: 'The laser is blocking the only portal wall. Block the laser first.', it: 'Il laser blocca l\'unico muro portale. Blocca prima il laser.' },
  width: 16, height: 13,
  grid: [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,12,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
    [2,10,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,1,1,9,2],
    [2,1,1,1,1,1,1,1,1,1,1,1,4,1,9,2],
    [2,1,1,1,1,1,1,11,1,1,1,1,1,1,9,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  lasers: [{ emitter: { x: 1, z: 5 }, dir: { dx: 1, dz: 0 }, receiverId: '7_11' }],
  links: [{ receiver: '7_11', door: { x: 7, z: 11 } }],
  amica: {
    en: "The laser hits a receiver that keeps a door open. The portal wall is behind the laser's path. The movable block can stop the beam if you push it into the line of fire.",
    it: "Il laser colpisce un ricevitore che mantiene una porta aperta. Il muro portale è dietro il percorso del laser. Il blocco mobile può fermare il raggio se lo spingi nella linea di fuoco."
  },
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push({
  intro: { speaker: 'amica', lines: {
    en: [
      "Chamber 34. The laser fires from west to east.",
      "The receiver on the east wall, when active, keeps a door sealed.",
      "To reach the portal wall — which you need to access the lower section — you must deactivate that receiver.",
      "The movable glass block, pushed into the laser's path, will interrupt the beam. Then you can proceed.",
    ],
    it: [
      "Camera 34. Il laser spara da ovest a est.",
      "Il ricevitore sul muro est, quando attivo, mantiene una porta sigillata.",
      "Per raggiungere il muro portale — necessario per accedere alla sezione inferiore — devi disattivare quel ricevitore.",
      "Il blocco di vetro mobile, spinto nel percorso del laser, interromperà il raggio. Poi potrai procedere.",
    ]
  }},
  win: { speaker: 'amica', lines: {
    en: ["You used a structural element to sever a laser. This is either creative engineering or vandalism. The report will call it the former."],
    it: ["Hai usato un elemento strutturale per recidere un laser. È o ingegneria creativa o vandalismo. Il rapporto lo chiamerà il primo."]
  }},
});
