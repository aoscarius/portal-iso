# PORTAL ISO — Aperture Isometric Laboratories

A fan-made isometric puzzle game inspired by Valve's Portal series, built with [BabylonJS](https://www.babylonjs.com/).  
No build tools, no npm, no bundler — serve the folder and play.

---

## Quick Start

```bash
# Python (zero dependencies)
python3 -m http.server 8080
# → http://localhost:8080

# Node.js
npx serve .
# → http://localhost:3000

# VS Code — "Live Server" extension → right-click index.html → Open with Live Server

# HTTPS (required for AR / WebXR)
python3 server.py      # uses certs/cert.pem + certs/key.pem (self-signed, localhost only)
# → https://localhost:443
```

> Opening `index.html` as `file://` will not work — the level loader and BabylonJS require HTTP(S).

---

## Controls

### Desktop

| Key | Action |
|-----|--------|
| `W` `A` `S` `D` / Arrow Keys | Move |
| `Q` | Fire Portal A (blue) |
| `R` | Fire Portal B (orange) |
| `Z` `X` `C` `V` | Aim portal without moving (Classic scheme) |
| `SPACE` | Advance dialogue |
| `M` | Toggle minimap |
| `F1` | Restart current chamber |
| `ESC` | Return to main menu |
| Mouse wheel | Zoom |
| Left-click floor | Walk to cell (BFS path) |
| Left-click portal wall | Fire Portal A |
| Right-click portal wall | Fire Portal B |

### Touch (mobile / tablet)

| Control | Action |
|---------|--------|
| D-pad bottom-left | Move |
| **A** button (blue, bottom-right) | Portal A |
| **B** button (orange, bottom-right) | Portal B |
| Two-finger pinch | Zoom |

### Control Schemes (Settings)

| Scheme | Movement | Aim |
|--------|----------|-----|
| **Classic WASD** | WASD / arrows → 4 directions | `Z X C V` → aim without moving |
| **Tank (FWD/TURN)** | `W`/`S` → forward/back · `A`/`D` → rotate 90° | — |

---

## Gameplay

### Core Mechanics

**Portal Gun** — Fire two portals onto teal-outlined *portal walls*. Walk into one to instantly emerge from the other. Portals also redirect laser beams.

**Pressure Plates** — Yellow buttons open linked doors while weighted. Step on them yourself, push a cube onto them, or align a laser to a receiver linked to the door. Cubes keep buttons held permanently (unless the link has a `holdTime`).

**Weighted Storage Cube** (`7`) — Push by walking into it. Can rest on buttons. Can block laser beams.

**Weighted Glass Block** (`12`) — Same push mechanics as Cube, distinct visual; used in puzzles requiring a specific object type.

**Lasers** — Orange beams travel from emitter tiles until they hit a wall, a cube, or a receiver tile. Redirect them through portals to reach receivers around obstacles. A beam reaching its receiver unlocks all doors linked to that receiver.

**Hazards** — Red tiles kill instantly on contact. Use portals or route around them.

**Stairs & Holes** — Multi-floor levels include `STAIR_UP` (`13`), `STAIR_DOWN` (`14`), and `FLOOR_HOLE` (`15`). Stepping on one triggers a vertical camera pan and floor switch.

### Tile Reference

| ID | Name | Notes |
|----|------|-------|
| `0` | Empty | No mesh rendered |
| `1` | Floor | Basic walkable slab |
| `2` | Wall | Solid; blocks movement, portals, lasers |
| `3` | Player | Start position marker (renders as floor) |
| `4` | Exit | Level exit — green glowing ring |
| `5` | Button | Pressure plate — links to doors via `links[]` |
| `6` | Door | Blocked until linked button/receiver activates it |
| `7` | Cube | Weighted Storage Cube (pushable) |
| `8` | Hazard | Lethal; triggers instant fail |
| `9` | Portal Wall | Accepts portal shots; teal wireframe outline |
| `10` | Emitter | Laser source; direction set in level data |
| `11` | Receiver | Laser target; `id` = `"x_z"` coordinate string |
| `12` | Movable | Weighted Glass Block (pushable) |
| `13` | Stair Up | Ascend to the next layer |
| `14` | Stair Down | Descend to the previous layer |
| `15` | Floor Hole | Player falls through to layer below |

---

## Chambers

The game ships with **20 hand-crafted chambers** plus **2 multi-floor demo chambers**.

### Built-in chambers (01–20)

| Range | Focus |
|-------|-------|
| 01–03 | Movement, portals, basic teleportation |
| 04–06 | Pressure plates, doors, cube pushing |
| 07–10 | Laser emitters/receivers, combined mechanics |
| 11–15 | Extended — advanced portal routing, weight management |
| 16–20 | All mechanics combined; multi-step solutions |

The default `levels/levels.json` loads only **01–10**. Add `level_11.js` through `level_20.js` to the manifest to unlock the full sequence.

### Multi-floor chambers

| ID | Title | Floors |
|----|-------|--------|
| ML-01 | Ascension | 2 |
| ML-02 | Stratification | 3 |

Accessible via **▶ CHAMBERS MULTI-FLOOR** on the main menu.

---

## Procedural Generation

### Single-floor

**♾ PROCEDURAL CHAMBERS** on the main menu generates an endless supply of solvable puzzles.

```js
LevelGenerator.generate({
  seed:       42,      // optional; omit for random
  difficulty: 1,       // 1–5
  width:      14,
  height:     12,
  id:         1000,
});
```

| Difficulty | Content |
|-----------|---------|
| 1 | Floor, walls, portal walls, exit |
| 2 | + More portal walls |
| 3 | + Hazard tiles |
| 4 | + Pressure plates + doors |
| 5 | + Lasers + cubes |

### Multi-floor

**♾ PROCEDURAL CHAMBERS MULTI-FLOOR** generates 2–4-floor levels.

```js
LevelGeneratorMulti.generate({
  seed:       42,
  difficulty: 2,
  width:      12,
  height:     10,
  numLayers:  2,     // 2–4 floors
  id:         3000,
});
```

---

## Project Structure

```
portal-iso/
├── index.html                   Entry: all HTML overlays, script loading order
├── server.py                    HTTPS server for AR (Python, self-signed cert)
├── certs/                       TLS certificate files (cert.pem, key.pem)
├── favicon.ico
│
├── levels/
│   ├── levels.json              Manifest — ordered file list loaded at startup
│   └── level_1.js … level_20.js
│
├── assets/
│   └── models/                  Optional GLB models (procedural fallback if absent)
│
└── src/
    ├── main.js                  Bootstrap: init subsystems, EventBus routing
    │
    ├── utils/
    │   ├── constants.js         Tile IDs, colours, camera params, speeds
    │   ├── eventBus.js          Minimal pub/sub (on / off / emit)
    │   ├── i18n.js              EN + IT strings, AMICA lines, level dialogue scripts
    │   └── themes.js            Visual themes: dark · lab · neon
    │
    ├── game/
    │   ├── tileTypes.js         Tile metadata for editor and renderer
    │   ├── levels.js            LEVELS[] init + LevelLoader (fetch manifest → inject scripts)
    │   ├── levels_multi.js      LEVELS_MULTI[] — two built-in multi-floor chambers
    │   ├── levelGenerator.js    Procedural single-floor generator
    │   ├── levelGenerator_multi.js  Procedural multi-floor generator
    │   ├── assetLoader.js       GLB loader: InstantiateHierarchy + per-instance AnimationGroups
    │   ├── renderer.js          BabylonJS scene, ArcRotateCamera, mesh factory,
    │   │                        multi-layer TransformNodes, shadows, AR passthrough
    │   ├── physics.js           Grid collision, portal raycast, push validation,
    │   │                        layer transitions, BFS pathfind
    │   ├── player.js            Keyboard/touch/AR input, movement FSM,
    │   │                        classic/tank schemes, click-to-move BFS
    │   ├── portalGun.js         Portal A/B placement, teleport resolution
    │   ├── laser.js             Laser trace (portal-bouncing), receiver detection, mesh lines
    │   ├── particles.js         Particle effects: portal burst/swirl, teleport, hazard, button
    │   │                        ⚠ See Known Issues — particleTexture bug
    │   ├── audio.js             Procedural Web Audio API SFX (no audio files)
    │   ├── amica.js             AMICA TTS + floating subtitle (Web Speech API)
    │   ├── minimap.js           2D canvas overlay: grid tiles, player, portals, laser lines
    │   ├── arManager.js         WebXR immersive-ar lifecycle, hit-test, board anchoring
    │   └── gameLogic.js         Level lifecycle, puzzle state machine, win/fail, event routing
    │
    ├── editor/
    │   └── levelEditor.js       Paint/erase/fill canvas editor, multi-layer,
    │                            door-button link builder, laser direction, export/import
    │
    └── ui/
        ├── styles.css           Industrial UI stylesheet (CSS custom properties)
        ├── dialogue.css         RPG dialogue panel styles
        ├── ar.css               AR HUD: scan ring, transform controls, toast overlays
        ├── uiManager.js         Overlay routing: menus, win, fail, settings, level select
        ├── dialoguePanel.js     Typewriter dialogue box with speaker avatar
        ├── dialogueScript.js    Per-level cues: intro, step-based, event-based triggers
        ├── splashScreen.js      Boot splash with animated aperture logo + progress bar
        └── cutscenePlayer.js    Cutscene system: video / GLB animation / static image
```

---

## Architecture

All modules are **IIFEs** with frozen public APIs. No framework, no bundler, no classes.  
Cross-module communication goes through **EventBus** exclusively.

```
main.js
  │
  ├─ Renderer.init()   → BabylonJS engine, scene, lights, shadow generator
  ├─ AssetLoader.load() → preload GLBs, progress → SplashScreen
  ├─ LevelLoader.load() → fetch levels.json, inject <script> tags
  │
  └─ GameLogic.startFromLevel(n)
       │
       ├─ Physics.init()        build mutable grid copy
       ├─ Renderer.buildLevel() create all tile meshes
       ├─ Player.init()         place player mesh, start input listeners
       ├─ LaserSystem.loadLevel() trace initial beams
       ├─ Minimap.loadLevel()   render grid to 2D canvas
       ├─ DialogueScript.loadLevel()  register step + event triggers
       │
       └─ EventBus subscriptions
            player:step     → AudioEngine, DialogueScript, step counter
            player:landed   → tile checks (exit, hazard, button, stair)
            cube:moved      → button weight tracking, laser update
            portal:placed   → Particles, Minimap, LaserSystem.update()
            portal:used     → Particles.teleportBurst(), audio
            laser:receiver-changed → door open/close
            player:layer-changed   → Renderer.setActiveLayer(), Minimap
```

### Script load order (enforced by index.html tag order)

```
i18n → themes → constants → eventBus   (no deps)
→ tileTypes → levels                   (data; depends on CONSTANTS)
→ audio → amica                        (depends on nothing game-specific)
→ renderer → particles → physics       (depends on CONSTANTS, EventBus)
→ portalGun → player                   (depends on Physics, Renderer)
→ laser → minimap → arManager          (depends on Renderer, Physics)
→ levelEditor                          (depends on TileTypes, CONSTANTS)
→ dialoguePanel → dialogueScript → uiManager
→ assetLoader                          (async; safe to load late)
→ levelGenerator → levelGenerator_multi
→ gameLogic                            (depends on all above)
→ splashScreen → main                  (entry point)
```

---

## Level Format

Single-layer:

```js
if (typeof LEVELS === 'undefined') LEVELS = [];

LEVELS.push({
  id: 5,
  name: { en: 'CHAMBER 05 — BEAM SPLITTER', it: 'CAMERA 05 — ...' },
  hint: { en: 'Redirect the laser to open the door.', it: '...' },
  amica: { en: 'AMICA intro line shown on level load.', it: '...' },
  width: 12, height: 10,

  grid: [
    // 2=wall  1=floor  3=player  4=exit  5=button  6=door
    // 7=cube  8=hazard  9=portal-wall  10=emitter  11=receiver  12=movable
    [2,2,2,2,2,2,2,2,2,2,2,2],
    [2,3,1,1,9,1,1,1,1,1,1,2],
    // ...
    [2,2,2,2,2,2,2,2,2,2,2,2],
  ],

  // Button/receiver → door links
  links: [
    { button:   { x:4, z:3 },  door: { x:7, z:5 } },
    { button:   { x:2, z:6 },  door: { x:9, z:4 }, holdTime: 3 },  // auto-closes after 3s
    { receiver: '8_3',          door: { x:6, z:5 } },
  ],

  // Laser definitions
  lasers: [
    { emitter: { x:1, z:5 }, dir: { dx:1, dz:0 }, receiverId: '8_3' },
  ],
});
```

Multi-layer:

```js
LEVELS.push({
  id: 101,
  name: 'CHAMBER ML-01 — ASCENSION',
  width: 12, height: 10,
  layers: [
    { y: 0.0, grid: [ /* floor 0 */ ] },
    { y: 3.0, grid: [ /* floor 1 — y = WALL_HEIGHT + TILE_HEIGHT */ ] },
  ],
  links: [
    { button: { x:3, z:2, layer:0 }, door: { x:7, z:5, layer:1 } },
  ],
});
```

**Add to manifest:** Edit `levels/levels.json` and append the filename to `"files"`.

---

## Level Editor

**⬡ LEVEL EDITOR** → full canvas editor in the browser.

| Tool | Action |
|------|--------|
| ✎ Paint | Click/drag to place selected tile |
| ◻ Erase | Click/drag to clear to Empty |
| ▣ Fill | Flood-fill from clicked cell |

**Steps:**

1. Set W × H and click **⊞ RESIZE**
2. Select tile in the palette — paint on grid
3. For **Emitter**: pick a laser direction (→ ← ↓ ↑) before placing
4. For **Door**: place the door tile, then click it, then click a Button or Receiver to link
5. Use the **FLOORS** tabs to add/remove layers
6. **▶ TEST** — play immediately in the 3D view
7. **↓ EXPORT** — download as a `.js` level file
8. **⎘ COPY CLIPBOARD** — paste into an existing `level_N.js`
9. **↑ IMPORT** — load a previously exported `.js` file

---

## 3D Models (GLB)

Every tile falls back to procedural BabylonJS geometry if its GLB is absent.  
Drop files into `assets/models/` to override:

| File | Tile | Animations needed |
|------|------|-------------------|
| `floor.glb` | Floor | — |
| `wall.glb` | Wall | — |
| `portal_wall.glb` | Portal wall | — |
| `door.glb` | Door | `open`, `close` |
| `button.glb` | Pressure plate | `press`, `release` |
| `cube.glb` | Weighted Cube | — |
| `movable.glb` | Glass Block | — |
| `exit.glb` | Exit | — |
| `hazard.glb` | Hazard | — |
| `emitter.glb` | Laser emitter | — |
| `receiver.glb` | Laser receiver | — |
| `player.glb` | Player | — |

Animation names are case-insensitive. `AssetLoader` rebuilds `AnimationGroup` targets per-instance via `InstantiateHierarchy()` to prevent null-target crashes.

---

## Dialogue System

AMICA commentary fires at level load, on step milestones, and on game events.

All text lives in `src/utils/i18n.js` under `SCRIPTS`. `DialogueScript` reads via `I18n.getLevelScripts(id)` at each level load so language changes take effect next time.

```js
// In i18n.js SCRIPTS map:
5: {
  intro: {
    speaker: 'amica',
    lines: {
      en: ["First line.", "Second line."],
      it: ["Prima riga.", "Seconda riga."],
    },
  },
  steps: [
    { at: 10, lines: { en: ["You've taken 10 steps."] } },
  ],
  events: {
    'door:opened':  { lines: { en: ["The door opens. How convenient."] } },
    'portal:placed': { lines: { en: ["Portal placed. Physics will follow."] } },
  },
},
```

---

## Augmented Reality (WebXR)

The entire test chamber renders onto a real surface through your camera.

### Requirements

| | |
|--|--|
| **Protocol** | HTTPS — use `server.py` for local dev |
| **Android** | Chrome 81+ · ARCore installed |
| **iOS** | Safari 15.4+ · ARKit device |
| **Desktop testing** | [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator) extension |

### Entering AR

1. Tap **◈ PLAY IN AR** from the main menu
2. Review requirements in the AR panel → tap **▶ ENTER AR**
3. Aim camera at a flat surface; orange reticle appears when detected
4. Tap **◉ PLACE HERE** to anchor the board
5. Play with the on-screen D-pad + portal buttons

### AR Controls

| Control | Action |
|---------|--------|
| D-pad (left) | Move player |
| **A** (blue) | Portal A |
| **B** (orange) | Portal B |
| **+** / **−** | Scale board |
| **↺** / **↻** | Rotate board |
| **↺ REPOSITION** | Re-anchor board |
| **✕ EXIT AR** | End session |

### How it works

A `BABYLON.TransformNode` (`ar_level_root`) is positioned at the WebXR hit-test point. All level meshes are parented under it — scale/rotate the node to scale/rotate the whole board. The WebXR camera replaces the isometric `ArcRotateCamera` for the duration of the session. DOM overlay (`#ar-dom-overlay`) keeps HUD and portal buttons visible over the camera feed.

---

## Visual Themes

Settings → Visual Theme:

| Theme | Description |
|-------|-------------|
| **Dark** (default) | Near-black floors, charcoal walls |
| **Lab** | Bright sterile white — classic Aperture aesthetic |
| **Neon** | Deep purple with cyan/magenta glow |

Themes patch CSS variables and BabylonJS scene colours live. Switching mid-game triggers a level reload to rebuild all tile meshes with the new palette.

---

## Localisation

Supported languages: **English** (`en`) and **Italian** (`it`).

All strings live in `src/utils/i18n.js`: UI labels, AMICA lines, level names, hints, and dialogue scripts. To add a new language:

1. Add `{ code: 'xx', label: 'LANGUAGE NAME' }` to `I18n.SUPPORTED`  
2. Add an `xx` key to every `{ en: '...', it: '...' }` map in the file  
3. The language picker in Settings appears automatically

---

## Browser Compatibility

| Browser | Notes |
|---------|-------|
| Chrome 90+ | Full support, including WebXR AR on Android |
| Firefox 88+ | Full support (no WebXR AR) |
| Safari 15+ | Full support, WebXR AR on iOS |
| Edge 90+ | Full support |

> **TTS:** `window.speechSynthesis` is used for AMICA voice. If no voice is installed, the floating subtitle still displays — speech is optional.

---

## Credits

- **Engine:** [BabylonJS](https://www.babylonjs.com/) (CDN — no install required)
- **Fonts:** [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) · [Rajdhani](https://fonts.google.com/specimen/Rajdhani) via Google Fonts
- **Concept:** Fan project inspired by Valve's Portal — not affiliated with or endorsed by Valve Corporation

---

*"The Weighted Companion Cube will never threaten to stab you."*  
*— Aperture Science Enrichment Center*
