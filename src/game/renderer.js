// ============================================================
// renderer.js — BabylonJS scene, camera, lighting, mesh factory
// Handles all 3D rendering for the isometric game view
// Supports multi-layer levels with animated layer transitions
// ============================================================

const Renderer = (() => {
  let engine, scene, camera, shadowGenerator;

  // Mesh pools keyed by unique cell IDs (include layerIdx suffix for multi-layer)
  const meshMap = {};

  // Shared material cache
  const matCache = {};

  // Per-layer state
  let _levelLayers  = [];   // [y, ...] — world-space Y offset per layer
  let _currentWidth  = 0;
  let _currentHeight = 0;
  let _activeLayer  = 0;
  let _layerRoots   = [];   // TransformNode per layer — controls visibility
  let _orbitUnlocked = false;
  let _cameraAnimObs = null;

  // ── Babylon helpers ──────────────────────────────────────

  /** Convert hex color string to BABYLON.Color3 */
  function hex2color3(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return new BABYLON.Color3(r,g,b);
  }

  /** Get or create a cached StandardMaterial for a given color. */
  function getMaterial(hexColor, emissiveIntensity = 0) {
    const key = hexColor + '_' + emissiveIntensity;
    if (matCache[key]) return matCache[key];

    const mat = new BABYLON.StandardMaterial(key, scene);
    const col = hex2color3(hexColor);
    mat.diffuseColor  = col.scale(0.9);
    mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.12);
    if (emissiveIntensity > 0) mat.emissiveColor = col.scale(emissiveIntensity);
    matCache[key] = mat;
    return mat;
  }

  // ── Scene initialization ─────────────────────────────────

  /**
   * Create the BabylonJS engine, scene, camera, and lights.
   * @param {HTMLCanvasElement} canvas
   */
  function init(canvas) {
    engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.07, 1);
    scene.ambientColor = new BABYLON.Color3(0.15, 0.15, 0.2);

    _setupCamera();
    _setupLights();

    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());

    return scene;
  }

  function _setupCamera() {
    camera = new BABYLON.ArcRotateCamera(
      'iso-cam', CONSTANTS.ISO_ALPHA, CONSTANTS.ISO_BETA,
      CONSTANTS.ISO_RADIUS, BABYLON.Vector3.Zero(), scene
    );
    _lockCamera();
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 80;
    _setupScrollZoom();
    _setupPinchZoom();
  }

  function _setupScrollZoom() {
    const canvas = engine.getRenderingCanvas();
    if (!canvas) return;
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (!camera) return;
      const factor = e.deltaY > 0 ? 1.12 : 0.89;
      camera.radius = Math.max(camera.lowerRadiusLimit,
                      Math.min(camera.upperRadiusLimit, camera.radius * factor));
    }, { passive: false });
  }

  function _setupPinchZoom() {
    const canvas = engine.getRenderingCanvas();
    if (!canvas) return;
    let _pinchDist = null;

    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        _pinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length !== 2 || _pinchDist === null) return;
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = _pinchDist / d;
      _pinchDist = d;
      if (camera) {
        camera.radius = Math.max(camera.lowerRadiusLimit,
                        Math.min(camera.upperRadiusLimit, camera.radius * delta));
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => { _pinchDist = null; }, { passive: true });
  }

  function _lockCamera() {
    camera.lowerAlphaLimit  = camera.upperAlphaLimit  = CONSTANTS.ISO_ALPHA;
    camera.lowerBetaLimit   = camera.upperBetaLimit   = CONSTANTS.ISO_BETA;
    camera.inputs.removeByType('ArcRotateCameraPointersInput');
    _orbitUnlocked = false;
  }

  function _unlockCamera() {
    camera.lowerAlphaLimit  = null;
    camera.upperAlphaLimit  = null;
    camera.lowerBetaLimit   = 0.1;
    camera.upperBetaLimit   = Math.PI / 2 - 0.05;
    try { camera.inputs.addPointers(); } catch(_) {}
    camera.attachControl(engine.getRenderingCanvas(), true);
    _orbitUnlocked = true;
  }

  function toggleOrbit() {
    if (_orbitUnlocked) {
      camera.alpha = CONSTANTS.ISO_ALPHA;
      camera.beta  = CONSTANTS.ISO_BETA;
      _lockCamera();
    } else {
      _unlockCamera();
    }
    return _orbitUnlocked;
  }

  /** Industrial lighting: directional main + ambient fill. */
  function _setupLights() {
    const sun = new BABYLON.DirectionalLight('sun',
      new BABYLON.Vector3(-1, -2, -1), scene);
    sun.intensity = 1.0;
    sun.diffuse   = new BABYLON.Color3(0.95, 0.9, 0.85);

    const hemi = new BABYLON.HemisphericLight('hemi',
      new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity   = 0.4;
    hemi.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 16;
  }

  // ── World-space conversion ───────────────────────────────

  /**
   * Convert grid cell (gx, gz) to world-space position on a given layer Y.
   * @param {number} gx
   * @param {number} gz
   * @param {number} layerY  — vertical world offset for the layer
   */
  function gridToWorld(gx, gz, layerY = 0) {
    return new BABYLON.Vector3(
      gx * CONSTANTS.TILE_SIZE,
      layerY,
      gz * CONSTANTS.TILE_SIZE
    );
  }

  // ── Level build ──────────────────────────────────────────

  /** Dispose all scene meshes and reset layer state. */
  function clearLevel() {
    Object.values(meshMap).forEach(m => {
      try { (Array.isArray(m) ? m : [m]).forEach(x => x.dispose()); } catch(_) {}
    });
    Object.keys(meshMap).forEach(k => delete meshMap[k]);

    Object.values(matCache).forEach(m => { try { m.dispose(); } catch(_) {} });
    Object.keys(matCache).forEach(k => delete matCache[k]);

    _layerRoots.forEach(r => { try { r.dispose(); } catch(_) {} });
    _layerRoots = []; _levelLayers = []; _activeLayer = 0;

    if (_cameraAnimObs) {
      try { scene.onBeforeRenderObservable.remove(_cameraAnimObs); } catch(_) {}
      _cameraAnimObs = null;
    }
  }

  /**
   * Build the 3D scene from a level definition.
   * Supports both single-layer ({grid}) and multi-layer ({layers:[{y, grid}]}) formats.
   * @param {Object} levelData — Level from levels.js
   */
  function buildLevel(levelData) {
    clearLevel();

    // Normalise to multi-layer format
    const layers = levelData.layers
      ? levelData.layers
      : [{ y: 0, grid: levelData.grid }];

    _levelLayers = layers.map(l => l.y ?? 0);
    const { width, height } = levelData;
    _currentWidth  = width;
    _currentHeight = height;

    layers.forEach((layer, li) => {
      // Each layer hangs under a TransformNode — toggling setEnabled shows/hides entire floor
      const root = new BABYLON.TransformNode(`layer_root_${li}`, scene);
      _layerRoots.push(root);
      root.setEnabled(li === 0);  // only the first layer is visible at start

      const layerY = layer.y ?? 0;
      for (let z = 0; z < height; z++)
        for (let x = 0; x < width; x++)
          _buildTile(layer.grid[z][x], x, z, layerY, li, root);
    });

    // Centre camera on level XZ, start at layer 0 Y
    camera.target = new BABYLON.Vector3(
      (width  / 2) * CONSTANTS.TILE_SIZE,
      _levelLayers[0] ?? 0,
      (height / 2) * CONSTANTS.TILE_SIZE
    );
    camera.radius = Math.max(24, Math.max(width, height) * 2.2);
  }

  // ── Layer switching ──────────────────────────────────────

  /**
   * Switch the active layer: camera target interpolates to the new layer Y,
   * old layer is hidden after the camera arrives.
   * @param {number} newLayerIdx
   */
  function setActiveLayer(newLayerIdx) {
    if (newLayerIdx === _activeLayer) return;
    const prevLayer = _activeLayer;
    _activeLayer = newLayerIdx;

    // New layer visible immediately (player is already there)
    _layerRoots[newLayerIdx]?.setEnabled(true);

    _animateCameraToLayer(newLayerIdx, () => {
      _layerRoots[prevLayer]?.setEnabled(false);
    });
  }

  /** Smooth-step camera target Y to a layer's world offset. */
  function _animateCameraToLayer(layerIdx, onDone) {
    if (_cameraAnimObs) {
      scene.onBeforeRenderObservable.remove(_cameraAnimObs);
      _cameraAnimObs = null;
    }
    const startY    = camera.target.y;
    const targetY   = _levelLayers[layerIdx] ?? 0;
    const DURATION  = 400;  // ms
    const startTime = performance.now();
    const ease      = t => t * t * (3 - 2 * t);  // smooth-step

    _cameraAnimObs = scene.onBeforeRenderObservable.add(() => {
      const t = Math.min(1, (performance.now() - startTime) / DURATION);
      camera.target.y = startY + (targetY - startY) * ease(t);
      if (t >= 1) {
        camera.target.y = targetY;
        scene.onBeforeRenderObservable.remove(_cameraAnimObs);
        _cameraAnimObs = null;
        onDone?.();
      }
    });
  }

  // ── Tile builder ─────────────────────────────────────────

  /**
   * Dispatch tile construction for one grid cell.
   * Keys are scoped per layer via the `mk` helper: `<type>_<x>_<z>_<layerIdx>`.
   */
  function _buildTile(tileId, gx, gz, layerY, layerIdx, layerRoot) {
    const T  = CONSTANTS.TILE;
    const pos = gridToWorld(gx, gz, layerY);
    const TS  = CONSTANTS.TILE_SIZE;
    const TH  = CONSTANTS.TILE_HEIGHT;
    const WH  = CONSTANTS.WALL_HEIGHT;

    // Scoped mesh key — avoids collisions across layers
    const mk = suffix => `${suffix}_${gx}_${gz}_${layerIdx}`;

    // Box helper: creates mesh, parents to layer root, enables shadows
    const _box = (name, w, h, d) => {
      const m = BABYLON.MeshBuilder.CreateBox(name, { width:w, height:h, depth:d }, scene);
      m.parent = layerRoot;
      m.receiveShadows = true;
      shadowGenerator?.addShadowCaster(m);
      return m;
    };

    // Metadata tag helper
    const _tag = (m, tid) => {
      m.metadata = { gridX: gx, gridZ: gz, tileId: tid, layerIdx };
      m.getChildMeshes?.().forEach(c => {
        c.metadata = { gridX: gx, gridZ: gz, tileId: tid, layerIdx };
      });
    };

    // GLB clone helper: parents to layer root, positions at layerY, tags metadata
    const _glb = (assetKey, meshName) => {
      if (typeof AssetLoader === 'undefined' || !AssetLoader.isLoaded(assetKey)) return null;
      const inst = AssetLoader.clone(assetKey, meshName);
      if (!inst) return null;
      inst.root.parent      = layerRoot;
      inst.root.position    = pos.clone();
      inst.root.position.y  = layerY;
      inst.root.getChildMeshes(false).forEach(m => {
        if (!(m instanceof BABYLON.InstancedMesh)) m.receiveShadows = true;
        shadowGenerator?.addShadowCaster(m);
      });
      return inst;
    };

    switch (tileId) {

      // ── Floor (and player start) ──────────────────────────
      case T.FLOOR:
      case T.PLAYER: {
        const g = _glb(T.FLOOR, mk('floor'));
        if (g) { _tag(g.root, tileId); meshMap[mk('floor')] = g.root; }
        else {
          const f = _box(mk('floor'), TS - 0.04, TH, TS - 0.04);
          f.position = pos.clone(); f.position.y = layerY - TH / 2;
          f.material = getMaterial(CONSTANTS.COLOR_FLOOR);
          _tag(f, tileId); meshMap[mk('floor')] = f;
        }
        break;
      }

      // ── Wall ─────────────────────────────────────────────
      case T.WALL: {
        const g = _glb(T.WALL, mk('wall'));
        if (g) { _tag(g.root, tileId); meshMap[mk('wall')] = g.root; }
        else {
          const w = _box(mk('wall'), TS, WH, TS);
          w.position = pos.clone(); w.position.y = layerY + WH / 2 - TH;
          w.material = getMaterial(CONSTANTS.COLOR_WALL);
          _tag(w, tileId); meshMap[mk('wall')] = w;
        }
        break;
      }

      // ── Portal wall — wireframe edge highlight ─────────────
      case T.PORTAL_WALL: {
        const g = _glb(T.PORTAL_WALL, mk('pwall'));
        if (g) { _tag(g.root, tileId); meshMap[mk('wall')] = g.root; }
        else {
          const w = _box(mk('wall'), TS, WH, TS);
          w.position = pos.clone(); w.position.y = layerY + WH / 2 - TH;
          w.material = getMaterial(CONSTANTS.COLOR_WALL_ACCENT, 0.08);
          _tag(w, tileId); meshMap[mk('wall')] = w;

          const edge = _box(mk('wedge'), TS + 0.05, WH + 0.05, TS + 0.05);
          edge.position = w.position.clone();
          const em = new BABYLON.StandardMaterial(mk('em'), scene);
          em.wireframe = true; em.emissiveColor = hex2color3('#3355aa'); em.alpha = 0.4;
          edge.material = em; meshMap[mk('wedge')] = edge;
        }
        break;
      }

      // ── Door — GLB stores 'open'/'close' animations ───────
      case T.DOOR: {
        const g = _glb(T.DOOR, mk('door'));
        if (g) {
          _tag(g.root, tileId);
          meshMap[mk('door')]     = g.root;
          meshMap[mk('door_glb')] = g;  // animation handle for setDoorState
        } else {
          const d = _box(mk('door'), TS, WH, TS * 0.18);
          d.position = pos.clone(); d.position.y = layerY + WH / 2 - TH;
          d.material = getMaterial(CONSTANTS.COLOR_DOOR, 0.2);
          _tag(d, tileId); meshMap[mk('door')] = d;
        }
        break;
      }

      // ── Exit — GLB includes floor ─────────────────────────
      case T.EXIT: {
        const g = _glb(T.EXIT, mk('exit'));
        if (g) { _tag(g.root, tileId); meshMap[mk('exit')] = g.root; }
        else {
          const ring = BABYLON.MeshBuilder.CreateTorus(mk('ring'),
            { diameter: TS * 0.42, thickness: 0.07, tessellation: 32 }, scene);
          ring.parent = layerRoot; ring.rotation.x = Math.PI / 2;
          ring.position = pos.clone(); ring.position.y = layerY + 0.04;
          ring.material = getMaterial(CONSTANTS.COLOR_EXIT, 0.4);
          _tag(ring, tileId); meshMap[mk('ring')] = ring;

          const f = _box(mk('exit_floor'), TS - 0.04, TH, TS - 0.04);
          f.position = pos.clone(); f.position.y = layerY - TH / 2;
          f.material = getMaterial(CONSTANTS.COLOR_EXIT, 0.15);
          meshMap[mk('exit_floor')] = f;
        }
        break;
      }

      // ── Button — GLB stores 'press'/'release' animations ──
      case T.BUTTON: {
        const glbKey = mk('btn_glb');
        const g = _glb(T.BUTTON, glbKey);
        if (g) {
          _tag(g.root, tileId);
          meshMap[glbKey]           = g.root;
          meshMap[mk('btn_glb_inst')] = g;  // animation handle for pressButton/releaseButton
        } else {
          const disc = BABYLON.MeshBuilder.CreateCylinder(mk('btn'),
            { diameter: TS * 0.5, height: 0.12, tessellation: 20 }, scene);
          disc.parent = layerRoot;
          disc.position = pos.clone(); disc.position.y = layerY + 0.02;
          disc.material = getMaterial(CONSTANTS.COLOR_BUTTON, 0.3);
          _tag(disc, tileId); meshMap[mk('btn')] = disc;

          const f = _box(mk('btn_floor'), TS - 0.04, TH, TS - 0.04);
          f.position = pos.clone(); f.position.y = layerY - TH / 2;
          f.material = getMaterial(CONSTANTS.COLOR_FLOOR);
          meshMap[mk('btn_floor')] = f;
        }
        break;
      }

      // ── Hazard — GLB includes floor ───────────────────────
      case T.HAZARD: {
        const g = _glb(T.HAZARD, mk('haz'));
        if (g) { _tag(g.root, tileId); meshMap[mk('haz')] = g.root; }
        else {
          const h = _box(mk('haz'), TS - 0.04, TH, TS - 0.04);
          h.position = pos.clone(); h.position.y = layerY - TH / 2;
          h.material = getMaterial(CONSTANTS.COLOR_HAZARD, 0.5);
          _tag(h, tileId); meshMap[mk('haz')] = h;
        }
        break;
      }

      // ── Cube — separate floor slab + object mesh ──────────
      case T.CUBE: {
        // Require a floor
        const f = _glb(T.FLOOR, mk('cube_floor'));
        if (f) { _tag(f.root, tileId); meshMap[mk('cube_floor')] = f.root; }
        else {
          const f = _box(mk('cube_floor'), TS - 0.04, TH, TS - 0.04);
          f.position = pos.clone(); f.position.y = layerY - TH / 2;
          f.material = getMaterial(CONSTANTS.COLOR_FLOOR);
          _tag(f, tileId); meshMap[mk('cube_floor')] = f;
        }

        const g = _glb(T.CUBE, mk('cube'));
        if (g) {
          shadowGenerator?.addShadowCaster(g.root);
          _tag(g.root, tileId);
          g.root.position.y = layerY + CONSTANTS.TILE_SIZE * 0.27;
          meshMap[mk('cube_obj')] = g.root;
          meshMap[mk('cube_glb')] = g;  // stored for potential animation use
        } else {
          const cs = TS * 0.55;
          const cube = _box(mk('cube'), cs, cs, cs);
          cube.position = pos.clone(); cube.position.y = layerY + cs / 2;
          cube.material = getMaterial(CONSTANTS.COLOR_CUBE);
          _tag(cube, tileId); meshMap[mk('cube_obj')] = cube;
        }
        break;
      }

      // ── Movable — separate floor slab + object mesh ───────
      case T.MOVABLE: {
        // Require a floor
        const f = _glb(T.FLOOR, mk('mov_floor'));
        if (f) { _tag(f.root, tileId); meshMap[mk('mov_floor')] = f.root; }
        else {
          const f = _box(mk('mov_floor'), TS - 0.04, TH, TS - 0.04);
          f.position = pos.clone(); f.position.y = layerY - TH / 2;
          f.material = getMaterial(CONSTANTS.COLOR_FLOOR);
          _tag(f, tileId); meshMap[mk('mov_floor')] = f;
        }

        const g = _glb(T.MOVABLE, mk('movable'));
        if (g) {
          _tag(g.root, tileId);
          g.root.position.y = layerY + CONSTANTS.TILE_SIZE * 0.27;
          meshMap[mk('mov_obj')] = g.root;
        } else {
          const m = _box(mk('movable'), TS * 0.8, TS * 0.9, TS * 0.8);
          m.position = pos.clone(); m.position.y = layerY + TS * 0.45;
          m.material = getMaterial(CONSTANTS.COLOR_MOVABLE);
          _tag(m, tileId); meshMap[mk('mov_obj')] = m;
        }
        break;
      }

      // ── Emitter / Receiver ────────────────────────────────
      case T.EMITTER: {
        const g = _glb(T.EMITTER, mk('emit'));
        if (g) { _tag(g.root, tileId); meshMap[mk('wall')] = g.root; }
        else {
          const m = _box(mk('emit'), TS, WH, TS);
          m.position = pos.clone(); m.position.y = layerY + WH / 2 - TH;
          m.material = getMaterial(CONSTANTS.COLOR_EMITTER, 0.4);
          _tag(m, tileId); meshMap[mk('wall')] = m;
        }
        break;
      }
      case T.RECEIVER: {
        const g = _glb(T.RECEIVER, mk('recv'));
        if (g) { _tag(g.root, tileId); meshMap[mk('wall')] = g.root; }
        else {
          const m = _box(mk('recv'), TS, WH, TS);
          m.position = pos.clone(); m.position.y = layerY + WH / 2 - TH;
          m.material = getMaterial('#00ccff', 0.3);
          _tag(m, tileId); meshMap[mk('wall')] = m;
        }
        break;
      }

      // ── Stair — procedural stepped geometry ───────────────
      case T.STAIR_UP:
      case T.STAIR_DOWN: {
        const isUp = tileId === T.STAIR_UP;
        const col  = isUp ? CONSTANTS.COLOR_STAIR_UP : CONSTANTS.COLOR_STAIR_DOWN;
        for (let si = 0; si < 3; si++) {
          const h    = WH * (si + 1) / 3 * 0.6;
          const slab = _box(mk(`ss${si}`), TS * 0.9, h, TS * 0.28);
          const dz   = (isUp ? -1 : 1) * TS * (si - 1) * 0.28;
          slab.position = new BABYLON.Vector3(pos.x, layerY + h / 2, pos.z + dz);
          slab.material = getMaterial(col, 0.15);
          meshMap[mk(`ss${si}`)] = slab;
        }
        const top = _box(mk('stop'), TS * 0.4, 0.08, TS * 0.4);
        top.position = pos.clone(); top.position.y = layerY + 0.06;
        top.material = getMaterial(col, 0.7);
        _tag(top, tileId); meshMap[mk('stop')] = top;
        break;
      }

      // ── Floor hole ────────────────────────────────────────
      case T.FLOOR_HOLE: {
        const frame = _box(mk('hole'), TS, TH, TS);
        frame.position = pos.clone(); frame.position.y = layerY - TH / 2;
        frame.material = getMaterial(CONSTANTS.COLOR_FLOOR_HOLE);
        _tag(frame, tileId); meshMap[mk('hole')] = frame;
        break;
      }

      default: break;  // EMPTY — nothing rendered
    }
  }

  // ── Portal rendering ─────────────────────────────────────

  /**
   * Show or hide a portal ring on a wall face.
   * The ring is parented to the layer root so it appears/disappears with layer switches.
   * @param {'A'|'B'} which
   * @param {{x:number,z:number}|null} cell — null to remove portal
   * @param {number} layerIdx
   */
  function updatePortal(which, cell, layerIdx = 0) {
    const key = `portal_${which}`;
    // Dispose ring and fill if present
    if (meshMap[key])           { try { meshMap[key].dispose(); }           catch(_){} delete meshMap[key]; }
    if (meshMap[`${key}_fill`]) { try { meshMap[`${key}_fill`].dispose(); } catch(_){} delete meshMap[`${key}_fill`]; }
    if (!cell) return;

    const layerY  = _levelLayers[layerIdx] ?? 0;
    const color = which === 'A' ? CONSTANTS.COLOR_PORTAL_A : CONSTANTS.COLOR_PORTAL_B;
    const pos   = gridToWorld(cell.x, cell.z, layerY);

    // Find which face the portal is on by checking which neighbor is walkable.
    // This tells us the direction the player approaches from, so we can push
    // the portal ring to the correct face of the wall.
    const neighbors = [
      { dx:  1, dz:  0 }, { dx: -1, dz:  0 },
      { dx:  0, dz:  1 }, { dx:  0, dz: -1 },
    ];
    let faceDir = { dx: 0, dz: 1 }; // Default: face toward +Z
    for (const n of neighbors) {
      const t = Physics.getTile(cell.x + n.dx, cell.z + n.dz);
      if (!isSolid(t)) { faceDir = n; break; }
    }

    // Offset ring to wall face: half tile toward the open neighbor
    const offset   = CONSTANTS.TILE_SIZE * 0.52;
    const ringPos  = pos.clone();
    ringPos.y      = layerY + CONSTANTS.WALL_HEIGHT * 0.5;
    ringPos.x     += faceDir.dx * offset;
    ringPos.z     += faceDir.dz * offset;

    // Rotation: portal faces the open side
    // faceDir.dx != 0 → wall runs along Z axis → ring faces X direction
    const rotY = faceDir.dx !== 0
      ? 0               // ring faces ±X → no Y rotation needed
      : Math.PI / 2;   // ring faces ±Z → rotate 90°

    // Outer torus ring — vertical, on the wall face
    const ring = BABYLON.MeshBuilder.CreateTorus(`portal_${which}`, {
      diameter:     CONSTANTS.TILE_SIZE * 0.85,
      thickness:    0.14,
      tessellation: 32,
    }, scene);
    ring.position   = ringPos;
    ring.rotation.y = rotY;
    // Torus default is horizontal; rotate to vertical:
    ring.rotation.x = 0;  // torus starts vertical in BabylonJS

    const mat = new BABYLON.StandardMaterial(`pmat_${which}`, scene);
    mat.emissiveColor      = hex2color3(color);
    mat.diffuseColor       = hex2color3(color).scale(0.4);
    mat.disableLighting    = true;
    ring.material = mat;
    meshMap[key] = ring;

    // Inner fill — flat disc on the same face
    const fill = BABYLON.MeshBuilder.CreateDisc(`portal_fill_${which}`, {
      radius:      CONSTANTS.TILE_SIZE * 0.37,
      tessellation: 32,
    }, scene);
    fill.position   = ringPos.clone();
    // Disc default faces +Z; rotate to match wall face
    fill.rotation.y = faceDir.dx !== 0 ? Math.PI / 2 : 0;

    const fmat = new BABYLON.StandardMaterial(`pfill_${which}`, scene);
    fmat.emissiveColor = hex2color3(color).scale(0.25);
    fmat.alpha         = 0.45;
    fmat.backFaceCulling = false;
    fill.material = fmat;
    meshMap[`${key}_fill`] = fill;
  }

  // ── Player mesh ──────────────────────────────────────────

  /**
   * Create or teleport the player mesh to a grid cell on a specific layer.
   * GLB model is used when available; procedural capsule otherwise.
   * @param {number} gx
   * @param {number} gz
   * @param {number} layerIdx
   */
  function setPlayerMesh(gx, gz, layerIdx = 0) {
    const key    = 'player_mesh';
    const layerY = _levelLayers[layerIdx] ?? 0;
    const pos    = gridToWorld(gx, gz, layerY);

    if (!meshMap[key]) {
      // Try GLB model first
      const glb = AssetLoader?.isLoaded('player')
        ? AssetLoader.clone('player', key)
        : null;

      if (glb) {
        glb.root.position = pos.clone();
        shadowGenerator.addShadowCaster(glb.root);
        glb.root.getChildMeshes().forEach(m => shadowGenerator.addShadowCaster(m));
        meshMap[key]           = glb.root;
        meshMap[key + '_glb']  = glb;
        return;
      }

      // Procedural capsule: body + head + visor
      const targetY = layerY + CONSTANTS.TILE_SIZE * 0.45;
      const body = BABYLON.MeshBuilder.CreateCylinder(key + '_body', {
        diameterTop: 0.55, diameterBottom: 0.65,
        height: 1.4, tessellation: 12,
      }, scene);
      body.position = new BABYLON.Vector3(pos.x, targetY, pos.z);
      body.material = getMaterial(CONSTANTS.COLOR_PLAYER);
      shadowGenerator.addShadowCaster(body);
      meshMap[key] = body;

      const head = BABYLON.MeshBuilder.CreateSphere(key + '_head',
        { diameter: 0.55, segments: 8 }, scene);
      head.parent    = body;
      head.position.y = 1.0;
      head.material  = getMaterial(CONSTANTS.COLOR_PLAYER, 0.1);
      // Head and visor are children of body — body parent disposal handles them.
      // Don't store in meshMap to avoid double-dispose on clearLevel().

      // Aperture visor strip
      const visor = BABYLON.MeshBuilder.CreateBox(key + '_visor', { 
        width: 0.4, height: 0.08, depth: 0.35,
      }, scene);
      visor.parent = head;
      visor.position.set(0, 0.05, 0.22);
      visor.material = getMaterial(CONSTANTS.COLOR_PORTAL_A, 0.6);
    } else {
      // Already exists — just reposition
      const targetY = layerY + CONSTANTS.TILE_SIZE * 0.45;
      const isGLB   = !!meshMap[key + '_glb'];
      meshMap[key].position.set(pos.x, isGLB ? layerY : targetY, pos.z);
    }
  }

  /**
   * Hop animation moving the player to a new grid cell on the same layer.
   * Uses an observable-based frame loop for GLB models;
   * BabylonJS animation tracks for the procedural mesh (includes squash/stretch).
   * @param {number} gx
   * @param {number} gz
   * @param {number} layerIdx
   * @param {Function} onDone
   */
  function animatePlayerTo(gx, gz, layerIdx, onDone) {
    const key  = 'player_mesh';
    const mesh = meshMap[key];
    if (!mesh) { onDone?.(); return; }

    const layerY  = _levelLayers[layerIdx] ?? 0;
    const isGLB   = !!meshMap[key + '_glb'];
    const start   = mesh.position.clone();
    const target  = new BABYLON.Vector3(
      gx * CONSTANTS.TILE_SIZE,
      isGLB ? layerY : layerY + CONSTANTS.TILE_SIZE * 0.45,
      gz * CONSTANTS.TILE_SIZE
    );
    const STEPS = 10; let frame = 0;

    const obs = scene.onBeforeRenderObservable.add(() => {
      frame++;
      const t   = frame / STEPS;
      const arc = Math.sin(t * Math.PI) * 0.15;
      mesh.position.x = start.x + (target.x - start.x) * t;
      mesh.position.z = start.z + (target.z - start.z) * t;
      mesh.position.y = start.y + (target.y - start.y) * t + arc;
      if (frame >= STEPS) {
        mesh.position.copyFrom(target);
        scene.onBeforeRenderObservable.remove(obs);
        onDone?.();
      }
    });
  }

  /**
   * Animate the player vertically between layers, then trigger the layer switch.
   * X/Z are snapped immediately to the destination cell.
   * @param {number} gx
   * @param {number} gz
   * @param {number} fromLayer
   * @param {number} toLayer
   * @param {Function} onDone
   */
  function animatePlayerLayerChange(gx, gz, fromLayer, toLayer, onDone) {
    const mesh = meshMap['player_mesh'];
    if (!mesh) { onDone?.(); return; }

    // GLB root sits at layerY; procedural mesh is offset by 0.45 tiles
    const isGLB  = !!meshMap['player_mesh_glb'];
    const offset = isGLB ? 0 : CONSTANTS.TILE_SIZE * 0.45;
    const fromY = (_levelLayers[fromLayer] ?? 0) + offset;
    const toY   = (_levelLayers[toLayer]   ?? 0) + offset;

    // Snap XZ immediately to destination
    mesh.position.x = gx * CONSTANTS.TILE_SIZE;
    mesh.position.z = gz * CONSTANTS.TILE_SIZE;

    _layerRoots[toLayer]?.setEnabled(true);

    const STEPS = 22; let frame = 0;
    const obs = scene.onBeforeRenderObservable.add(() => {
      frame++;
      const t    = frame / STEPS;
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;  // smooth-step
      mesh.position.y = fromY + (toY - fromY) * ease;
      if (frame >= STEPS) {
        mesh.position.y = toY;
        scene.onBeforeRenderObservable.remove(obs);
        setActiveLayer(toLayer);
        onDone?.();
      }
    });
  }

  /**
   * Rotate the player mesh to face a movement direction.
   * Angles compensate for the isometric camera orientation.
   * @param {{dx:number, dz:number}} dir
   */
  function rotatePlayerMesh(dir) {
    try {
      const mesh = meshMap['player_mesh'];
      if (!mesh) return;
      if (mesh.rotationQuaternion) {
        mesh.rotation = mesh.rotationQuaternion.toEulerAngles();
        mesh.rotationQuaternion = null;
      }
      const isGLB = !!meshMap['player_mesh_glb'];
      let angle = 0;
      if (!isGLB) {
        if      (dir.dx ===  1 && dir.dz ===  0) angle =  Math.PI * 0.25;
        else if (dir.dx === -1 && dir.dz ===  0) angle = -Math.PI * 0.75;
        else if (dir.dx ===  0 && dir.dz ===  1) angle =  Math.PI * 0.75;
        else if (dir.dx ===  0 && dir.dz === -1) angle = -Math.PI * 0.25;

        const anim = new BABYLON.Animation('rot', 'rotation.y', 60,
          BABYLON.Animation.ANIMATIONTYPE_FLOAT,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        anim.setKeys([
          { frame: 0, value: mesh.rotation.y },
          { frame: 6, value: angle },
        ]);
        mesh.animations = [anim];
        scene.beginAnimation(mesh, 0, 6, false);
      } else {
        if      (dir.dx ===  1 && dir.dz ===  0) angle =  Math.PI * 0.5;
        else if (dir.dx === -1 && dir.dz ===  0) angle = -Math.PI * 0.5;
        else if (dir.dx ===  0 && dir.dz ===  1) angle =  0;
        else if (dir.dx ===  0 && dir.dz === -1) angle =  Math.PI;
        mesh.rotation.y = angle;
      }
    } catch(_) {}
  }

  // ── Interactive tile state ───────────────────────────────

  /**
   * Open or close a door — plays GLB animation if available,
   * otherwise slides the mesh on the Y axis.
   */
  function setDoorState(gx, gz, open, layerIdx = 0) {
    const key  = `door_${gx}_${gz}_${layerIdx}`;
    const mesh = meshMap[key];
    if (!mesh) return;

    const glb = meshMap[`door_glb_${gx}_${gz}_${layerIdx}`];
    if (glb) {
      glb.stopAllAnims?.();
      glb.playAnim?.(open ? 'open' : 'close', false);
      return;
    }

    const layerY  = _levelLayers[layerIdx] ?? 0;
    const targetY = open
      ? layerY - CONSTANTS.WALL_HEIGHT
      : layerY + CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
    const anim = new BABYLON.Animation('doorAnim', 'position.y', 60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    anim.setKeys([
      { frame: 0,  value: mesh.position.y },
      { frame: 18, value: targetY },
    ]);
    mesh.animations = [anim];
    scene.beginAnimation(mesh, 0, 18, false);
  }

  /** Flash a floor tile with a given color — used for button press feedback. */
  function flashTile(gx, gz, hexColor, layerIdx = 0) {
    const key  = `floor_${gx}_${gz}_${layerIdx}`;
    const mesh = meshMap[key];
    if (!mesh) return;
    const orig = mesh.material;
    mesh.material = getMaterial(hexColor, 0.5);
    setTimeout(() => { mesh.material = orig; }, 300);
  }

  /**
   * Translate a cube mesh and its floor slab to a new cell.
   * Re-keys both entries in meshMap.
   */
  function moveCubeMesh(fromX, fromZ, toX, toZ, layerIdx = 0) {
    const key    = `cube_obj_${fromX}_${fromZ}_${layerIdx}`;
    const mesh   = meshMap[key];
    if (!mesh) return;

    const layerY = _levelLayers[layerIdx] ?? 0;
    const target = gridToWorld(toX, toZ, layerY);
    target.y = layerY + CONSTANTS.TILE_SIZE * 0.27;
    mesh.position = target;
    meshMap[`cube_obj_${toX}_${toZ}_${layerIdx}`] = mesh;
    delete meshMap[key];
  }

  /** Translate a movable mesh to a new cell. Re-keys meshMap entry. */
  function moveMovableMesh(fromX, fromZ, toX, toZ, layerIdx = 0) {
    const key  = `mov_obj_${fromX}_${fromZ}_${layerIdx}`;
    const mesh = meshMap[key];
    if (!mesh) return;

    const layerY = _levelLayers[layerIdx] ?? 0;
    const target = gridToWorld(toX, toZ, layerY);
    target.y = layerY + CONSTANTS.TILE_SIZE * 0.27;
    mesh.position = target;
    meshMap[`mov_obj_${toX}_${toZ}_${layerIdx}`] = mesh;
    delete meshMap[key];
  }

  /** Trigger the 'press' animation on a button GLB. */
  function pressButton(gx, gz, layerIdx = 0) {
    const glb = meshMap[`btn_glb_inst_${gx}_${gz}_${layerIdx}`];
    if (glb) { glb.stopAllAnims?.(); glb.playAnim?.('press', false); }
  }

  /** Trigger the 'release' animation on a button GLB. */
  function releaseButton(gx, gz, layerIdx = 0) {
    const glb = meshMap[`btn_glb_inst_${gx}_${gz}_${layerIdx}`];
    if (glb) { glb.stopAllAnims?.(); glb.playAnim?.('release', false); }
  }

  // ── Public API ───────────────────────────────────────────

  return {
    init, buildLevel, clearLevel,
    gridToWorld,
    setPlayerMesh, animatePlayerTo, animatePlayerLayerChange, rotatePlayerMesh,
    updatePortal,
    setDoorState, flashTile, moveCubeMesh, moveMovableMesh,
    pressButton, releaseButton,
    setActiveLayer,
    getLayerY: li => _levelLayers[li] ?? 0,
    toggleOrbit,
    isOrbitUnlocked: () => _orbitUnlocked,
    getScene:  () => scene,
    getEngine: () => engine,
    getCamera: () => camera,

    /**
     * Returns the world-space centre of the currently loaded level.
     * Used by ARManager to offset the board pivot to the level centre.
     * Returns {x, z} in TILE_SIZE units (same as gridToWorld).
     */
    getLevelCenter() {
      const TS = CONSTANTS.TILE_SIZE;
      return {
        x: (_currentWidth  / 2) * TS,
        z: (_currentHeight / 2) * TS,
      };
    },

    /** Toggle shadow map refresh for performance tuning. */
    setShadowsEnabled(enabled) {
      if (shadowGenerator) {
        shadowGenerator.getShadowMap().refreshRate = enabled ? 1 : 0;
      }
    },

    /**
     * Switch between opaque desktop background and transparent AR passthrough.
     * @param {boolean} transparent
     */
    setARTransparent(transparent) {
      if (transparent) {
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        scene.autoClear  = false;
      } else {
        scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.07, 1);
        scene.autoClear  = true;
      }
    },
  };
})();