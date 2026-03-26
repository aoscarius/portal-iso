# PORTAL ISO — Aperture Isometric Laboratories

A fan-made isometric puzzle game inspired by Valve's Portal, built with [BabylonJS](https://www.babylonjs.com/).  
No build tools required — open `index.html` with a local HTTP server and play.

---

## Quick Start

```bash
# Option 1: Node.js (recommended)
npx serve .

# Option 2: Python
python3 -m http.server 8080

# Option 3: VS Code
# Install "Live Server" extension → right-click index.html → Open with Live Server
```

Then open `http://localhost:3000` (or `8080`) in your browser.

> **Note:** A local server is required because BabylonJS loads resources via HTTP(s).  
> Opening `index.html` directly as `file://` will not work correctly.

---

## How to Play

| Key | Action |
|-----|--------|
| `W A S D` / Arrow Keys | Move the player |
| `Q` | Fire Portal A (blue) |
| `R` | Fire Portal B (orange) |
| `SPACE` / Click | Advance dialogue |
| `M` | Toggle minimap |
| `F1` | Restart current chamber |
| `ESC` | Return to main menu |

### Mechanics

- **Portals** — Place two portals on glowing portal-walls (teal outline). Walk into one to emerge from the other. The portal gun also redirects laser beams.
- **Pressure Plates** — Step on yellow buttons or push a cube onto them to open linked doors.
- **Weighted Cubes** — Push cubes by walking into them. Cubes hold buttons down permanently.
- **Lasers** — Red beams from emitters must reach circular receivers to unlock doors. Use portals to redirect beams around obstacles.
- **Hazards** — Red tiles are instantly lethal. Use portals to bypass them.

---

## Project Structure

```
portal-iso/
├── index.html                    Entry point — all HTML overlays + script loading
├── README.md                     This file
│
└── src/
    ├── main.js                   Bootstrap: init all modules, wire global events
    │
    ├── utils/
    │   ├── constants.js          Global config: tile IDs, colors, camera angles, speeds
    │   ├── eventBus.js           Pub/sub event system for decoupled module communication
    │   ├── i18n.js               Internationalisation (i18n) system
    │   └── thremes.js            Visual theme system
    │
    ├── game/
    │   ├── assetLoader.js        External GLB asset loader code with cloning and progress bar support
    │   ├── tileTypes.js          Tile metadata: solid, walkable, portalable, editor colors
    │   ├── levels.js             10 built-in chamber definitions (grid arrays + metadata)
    │   ├── levelsGenerator.js    Experimental procedural level generator implementation
    │   ├── renderer.js           BabylonJS 3D scene, isometric camera, mesh factory
    │   ├── physics.js            Grid collision, portal raycast, cube-push validation
    │   ├── player.js             Input handling, movement state machine, step events
    │   ├── portalGun.js          Portal placement, teleportation logic, HUD portal dots
    │   ├── laser.js              Laser trace (with portal bouncing), receiver detection
    │   ├── particles.js          BabylonJS particle systems: portals, teleport, hazards
    │   ├── audio.js              Procedural Web Audio API sounds (no audio files needed)
    │   ├── amica.js              AMICA TTS + subtitle system (Web Speech API fallback)
    │   ├── minimap.js            2D canvas minimap overlay (bottom-right corner)
    │   └── gameLogic.js          Level lifecycle, puzzle state, win/fail, event routing
    │
    ├── editor/
    │   └── levelEditor.js        2D canvas level editor: paint/erase/fill, import/export JSON
    │
    └── ui/
        ├── styles.css            Main industrial UI stylesheet (CSS variables, all components)
        ├── dialogue.css          RPG dialogue panel styles (avatar, typewriter, animations)
        ├── dialoguePanel.js      RPG dialogue box: typewriter, speaker avatar, SPACE-to-advance
        ├── dialogueScript.js     Per-level dialogue cues: intro, step triggers, event triggers
        ├── spalshScreen.js       Initlial loader and splash screen logic implementation
        └── uiManager.js          Overlay management: menu, win, fail, settings, level select
```

---

## Architecture

The project uses a **module pattern** (IIFE) with a central **EventBus** for communication. No framework, no bundler.

```
EventBus  ←────────────────────────────────────────────────┐
    │                                                      │
    ▼                                                      │
Player ──(player:step, player:landed, player:bumped)──────►│
PortalGun ──(portal:placed, portal:used, portal:miss)─────►│
GameLogic ──(coordinates all modules below)                │
    │                                                      │
    ├── Physics      (collision, raycast)                  │
    ├── Renderer     (BabylonJS meshes, animations)        │
    ├── Particles    (visual effects)                      │
    ├── LaserSystem  (beam trace, receiver state)─────────►│
    ├── AudioEngine  (procedural SFX)                      │
    ├── Minimap      (2D canvas overlay)                   │
    ├── AMICA       (TTS + floating subtitles)             │
    └── DialogueScript──► DialoguePanel (RPG box)          │
```

### Adding a New Level

Edit `src/game/levels.js` and add an entry to the `LEVELS` array:

```js
{
  id: 11,
  name: 'CHAMBER 11 — YOUR TITLE',
  hint: 'Shown as HUD tip after AMICA speaks.',
  width: 12, height: 10,
  grid: [
    // 0=empty  1=floor  2=wall   3=player(start)  4=exit
    // 5=button 6=door   7=cube   8=hazard
    // 9=portal-wall  10=emitter  11=receiver
    [2,2,2,2,2,2,2,2,2,2,2,2],
    [2,1,1,1,1,1,1,1,1,1,1,2],
    [2,1,3,1,1,1,1,1,1,1,1,2],
    // ... more rows ...
    [2,2,2,2,2,2,2,2,2,2,2,2],
  ],
  links: [
    { button: {x:5, z:4}, door: {x:5, z:6} },       // button → door
    { receiver: '8_3',    door: {x:9, z:4} },         // laser receiver → door
  ],
  lasers: [
    { emitter: {x:1, z:5}, dir: {dx:1, dz:0}, receiverId: '8_3' },
  ],
  amica: "Your AMICA opening line here.",
},
```

Then add a script entry in `src/ui/dialogueScript.js` under the matching `id`.

### Using the Level Editor

1. From the main menu, click **⬡ LEVEL EDITOR**
2. Select a tile type from the palette (left sidebar)
3. Paint on the canvas (right-click erases)
4. Use **FILL** tool for large areas
5. For **EMITTER** tiles, select a laser direction (→ ← ↓ ↑) before painting
6. Click **▶ TEST** to play your level immediately
7. Click **↓ EXPORT** to save as JSON; **↑ IMPORT** to reload

---

## Feature List

| Feature | Status |
|---------|--------|
| Isometric 3D view (BabylonJS) | ✅ |
| Ortho 3D view (BabylonJS) | ✅ |
| Portal placement & teleportation | ✅ |
| Grid collision (walls, doors) | ✅ |
| Cube push mechanics | ✅ |
| Button → door links | ✅ |
| Laser emitter / receiver system | ✅ |
| Laser redirection through portals | ✅ |
| Hazard tiles (lethal) | ✅ |
| 10 built-in test chambers | ✅ |
| Procedural audio (Web Audio API) | ✅ |
| AMICA TTS dialogue (Web Speech) | ✅ |
| RPG dialogue panel (typewriter) | ✅ |
| Per-level step & event cues | ✅ |
| BabylonJS particle effects | ✅ |
| 2D minimap overlay | ✅ |
| Player hop animation | ✅ |
| Industrial ceiling & lighting | ✅ |
| Level editor (paint/erase/fill) | ✅ |
| Export / import levels as JSON | ✅ |
| Settings panel (audio, TTS, etc.) | ✅ |
| Level select screen | ✅ |
| Win / fail overlays with stats | ✅ |

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full (TTS + Web Audio) |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |

> **TTS Note:** AMICA voice synthesis requires the browser to have installed voices.  
> If no voice is available, the dialogue panel falls back to text-only (subtitles still appear).

---

## Augmented Reality (WebXR) _Experimental_

Portal ISO supports **Mixed Reality on flat surfaces** via the WebXR Device API.

### Requirements

| Platform | Minimum |
|----------|---------|
| Android  | Chrome 81+, ARCore installed |
| iOS      | Safari 15+ (limited) |
| Desktop  | Chrome/Edge with WebXR Emulator extension |
| Protocol | **HTTPS required** (or `localhost`) |

### How it works

1. From the main menu, tap **◈ ENTER AR MODE** (in game you can use upper right button)
2. Point your camera at a flat surface (table, floor)
3. A scanning reticle appears when a surface is detected
4. **Tap** to anchor the game board to that surface
5. The full game plays on your real table at ~30 cm scale

### AR Controls (on-screen)

| Control | Action |
|---------|--------|
| D-pad (left side) | Move player |
| **A** button (blue) | Fire Portal A |
| **B** button (orange) | Fire Portal B |
| **+** / **−** | Scale board up / down |
| **↺** / **↻** | Rotate board left / right |
| **✕ AR** | Exit AR session |

### Architecture

```
src/game/
└── arManager.js    WebXR session lifecycle, hit-test, board anchoring

src/ui/
└── ar.css       AR overlay styles (scan ring, D-pad, portal buttons)
```

**`arManager.js`** requests an `immersive-ar` session with:
- `hit-test` — continuous raycasting against detected planes for the reticle
- `local` reference space — stable origin anchored to the real world
- `dom-overlay` — the `#ar-overlay` div is composited into the XR view

The game board is attached to a `BABYLON.TransformNode` (`ar-board-root`) scaled to `AR_BOARD_METRES / WORLD_UNITS` (≈ 0.015). All level meshes are parented under this node, so moving/scaling the root repositions the entire board.

**`arControls.js`** emits the same EventBus events (`ar:move`, `ar:portal`) that are consumed by the existing `Player` and `PortalGun` modules — no changes to game logic were needed.

### Testing on Desktop

Install the [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator) extension for Chrome or Firefox, then open DevTools → WebXR tab to simulate an AR-capable device.

---

## Credits

- Engine: [BabylonJS](https://www.babylonjs.com/) (CDN, no install needed)
- Fonts: [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) + [Rajdhani](https://fonts.google.com/specimen/Rajdhani) (Google Fonts)
- Concept: inspired by Valve's Portal series (fan project, not affiliated)

---

*"The cake is a lie. The documentation is not."*  
— Aperture Science Technical Writing Division

---

## Augmented Reality (WebXR)

Portal ISO supports **immersive-ar** via the WebXR Device API.  
The entire test chamber is projected onto a real flat surface through your device's camera.

### Requirements

| Requirement | Detail |
|-------------|--------|
| **HTTPS** | WebXR requires a secure context (`https://` or `localhost`) |
| **Browser** | Chrome 81+ on Android · Safari 15.4+ on iOS/iPadOS |
| **Device** | ARCore (Android) or ARKit (iOS) capable device |
| **Feature** | `immersive-ar` + `hit-test` session features |

> On Android, use Chrome. On iOS, use Safari 15.4+ (no Chrome WebXR on iOS).

### AR Controls

| Gesture | Action |
|---------|--------|
| **Single tap** (before placing) | Place level on surface |
| **One-finger drag** | Rotate level around Y axis |
| **Two-finger pinch** | Scale level up/down |
| **Two-finger twist** | Rotate level |
| **◉ PLACE HERE** button | Anchor level at reticle position |
| **↺ REPOSITION** button | Pick up and reposition level |
| **+ / −** buttons | Scale up / down |
| **↺ ↻** buttons | Rotate left / right |
| **✕ EXIT AR** | End session, return to menu |

### How It Works

```
WebXR Session
   │
   ├── hit-test feature → detects real-world planes (floor, table)
   │     └── renders orange reticle ring at detected surface
   │
   ├── dom-overlay feature → keeps HUD + dialogue visible in AR
   │
   └── On placement:
         All level meshes are parented to a TransformNode
         (`ar_level_root`) positioned at the hit-test point.
         Scale = 0.04 (4 cm per world-unit tile).
         The BabylonJS WebXR camera takes over from the
         iso ArcRotateCamera.
```

### Testing AR on Desktop (without a device)

Chrome DevTools has a WebXR emulator:
1. Open DevTools → More tools → Sensors
2. Enable "Emulate XR device"
3. Navigate to the page over HTTPS (use `npx serve --ssl` or `python3 server.py`)

Or use the **WebXR API Emulator** browser extension (Chrome/Firefox).
