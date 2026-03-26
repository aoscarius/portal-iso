// ============================================================
// renderer.js — BabylonJS scene, camera, lighting, mesh factory
// Handles all 3D rendering for the isometric game view
// ============================================================

const Renderer = (() => {
  let engine, scene, camera, shadowGenerator;

  // Mesh pools keyed by unique cell IDs
  const meshMap = {};

  // Shared material cache
  const matCache = {};

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
    mat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.15);
    if (emissiveIntensity > 0) mat.emissiveColor = col.scale(emissiveIntensity);
    mat.freeze(); // Static mats can be frozen for perf
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

    // Render loop
    engine.runRenderLoop(() => scene.render());
    window.addEventListener('resize', () => engine.resize());

    return scene;
  }

  let _orbitUnlocked = false;

  /** Isometric camera setup. Orbit locked by default; unlock via toggleOrbit(). */
  function _setupCamera() {
    camera = new BABYLON.ArcRotateCamera(
      'iso-cam', CONSTANTS.ISO_ALPHA, CONSTANTS.ISO_BETA,
      CONSTANTS.ISO_RADIUS, BABYLON.Vector3.Zero(), scene
    );
    _lockCamera();
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 80;
    // wheelPrecision only works when BabylonJS pointer input is active.
    // In locked mode (no pointer input) we use a direct wheel listener instead.
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
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        _pinchDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length !== 2 || _pinchDist === null) return;
      const dx  = e.touches[0].clientX - e.touches[1].clientX;
      const dy  = e.touches[0].clientY - e.touches[1].clientY;
      const d   = Math.hypot(dx, dy);
      const delta = _pinchDist / d;  // > 1 = pinch in (zoom out), < 1 = spread (zoom in)
      _pinchDist  = d;

      if (camera) {
        const next = Math.max(camera.lowerRadiusLimit,
                     Math.min(camera.upperRadiusLimit, camera.radius * delta));
        camera.radius = next;
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
    try { camera.inputs.addMouseWheel(); } catch(_) {}
    try { camera.inputs.addPointers(); } catch(_) {}
    camera.attachControl(engine.getRenderingCanvas(), true);
    _orbitUnlocked = true;
  }

  function toggleOrbit() {
    if (_orbitUnlocked) {
      // Snap back to iso defaults before locking
      camera.alpha  = CONSTANTS.ISO_ALPHA;
      camera.beta   = CONSTANTS.ISO_BETA;
      _lockCamera();
    } else {
      _unlockCamera();
    }
    return _orbitUnlocked;
  }

  /** Industrial lighting: directional main + ambient fill + point accents. */
  function _setupLights() {
    // Main directional — harsh industrial shadow
    const sun = new BABYLON.DirectionalLight('sun',
      new BABYLON.Vector3(-1, -2, -1), scene);
    sun.intensity = 0.9;
    sun.diffuse   = new BABYLON.Color3(0.95, 0.9, 0.85);

    // Ambient fill — cold blue-grey underlight
    const hemi = new BABYLON.HemisphericLight('hemi',
      new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.3;
    hemi.diffuse   = new BABYLON.Color3(0.6, 0.7, 0.9);
    hemi.groundColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    // Shadow generator from directional light
    shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 8;
  }

  // ── World-space conversion ───────────────────────────────

  /**
   * Convert grid cell (x, z) to world-space position.
   * The Y axis is the vertical axis in BabylonJS.
   */
  function gridToWorld(gx, gz, yOffset = 0) {
    return new BABYLON.Vector3(
      gx * CONSTANTS.TILE_SIZE,
      yOffset,
      gz * CONSTANTS.TILE_SIZE
    );
  }

  // ── Mesh factory ─────────────────────────────────────────

  /**
   * Remove all existing level meshes from the scene.
   */
  function clearLevel() {
    Object.values(meshMap).forEach(m => {
      if (Array.isArray(m)) m.forEach(x => { try { x.dispose(); } catch(_){} });
      else { try { m.dispose(); } catch(_){} }
    });
    Object.keys(meshMap).forEach(k => delete meshMap[k]);
    // Flush material cache so theme color changes take effect on next build
    Object.keys(matCache).forEach(k => {
      try { matCache[k].dispose(); } catch(_) {}
      delete matCache[k];
    });
  }

  /**
   * Build the 3D scene from a level definition.
   * @param {Object} levelData — Level from levels.js
   */
  function buildLevel(levelData) {
    clearLevel();
    const { grid, width, height } = levelData;

    // Centre camera on level
    camera.target = new BABYLON.Vector3(
      (width  / 2) * CONSTANTS.TILE_SIZE,
      0,
      (height / 2) * CONSTANTS.TILE_SIZE
    );

    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const tileId = grid[z][x];
        _buildTile(tileId, x, z);
      }
    }

    // Note: ceiling removed — it blocked the isometric top-down view
  }

  /** Ceiling panel — thin emissive overlay creates industrial ambience. */
  function _buildChamberCeiling(w, h) {
    const ceil = BABYLON.MeshBuilder.CreateBox('ceiling', {
      width:  w * CONSTANTS.TILE_SIZE,
      height: 0.12,
      depth:  h * CONSTANTS.TILE_SIZE,
    }, scene);
    ceil.position = new BABYLON.Vector3(
      (w / 2) * CONSTANTS.TILE_SIZE,
      CONSTANTS.WALL_HEIGHT + 0.06,
      (h / 2) * CONSTANTS.TILE_SIZE
    );
    const mat = new BABYLON.StandardMaterial('ceil_mat', scene);
    mat.diffuseColor  = new BABYLON.Color3(0.08, 0.08, 0.12);
    mat.emissiveColor = new BABYLON.Color3(0.02, 0.02, 0.04);
    mat.alpha         = 0.85;
    ceil.material     = mat;
    meshMap['ceiling'] = ceil;

    // Ceiling grid lines — industrial panel seams
    for (let i = 1; i < w; i++) {
      const strip = BABYLON.MeshBuilder.CreateBox(`cs_x_${i}`, {
        width: 0.04, height: 0.14, depth: h * CONSTANTS.TILE_SIZE,
      }, scene);
      strip.position = new BABYLON.Vector3(i * CONSTANTS.TILE_SIZE, CONSTANTS.WALL_HEIGHT + 0.07, (h / 2) * CONSTANTS.TILE_SIZE);
      strip.material = getMaterial('#1a1a28', 0.05);
      meshMap[`cs_x_${i}`] = strip;
    }
    for (let j = 1; j < h; j++) {
      const strip = BABYLON.MeshBuilder.CreateBox(`cs_z_${j}`, {
        width: w * CONSTANTS.TILE_SIZE, height: 0.14, depth: 0.04,
      }, scene);
      strip.position = new BABYLON.Vector3((w / 2) * CONSTANTS.TILE_SIZE, CONSTANTS.WALL_HEIGHT + 0.07, j * CONSTANTS.TILE_SIZE);
      strip.material = getMaterial('#1a1a28', 0.05);
      meshMap[`cs_z_${j}`] = strip;
    }
  }

  /** Overhead point light at center — warm industrial fill. */
  function _buildAccentLight(w, h) {
    const pt = new BABYLON.PointLight('chamber_fill',
      new BABYLON.Vector3(
        (w / 2) * CONSTANTS.TILE_SIZE,
        CONSTANTS.WALL_HEIGHT - 0.5,
        (h / 2) * CONSTANTS.TILE_SIZE
      ), scene
    );
    pt.diffuse    = new BABYLON.Color3(0.6, 0.55, 0.45);
    pt.specular   = new BABYLON.Color3(0.1, 0.1, 0.1);
    pt.intensity  = 0.45;
    pt.range      = Math.max(w, h) * CONSTANTS.TILE_SIZE * 1.2;
    meshMap['__chamber_fill_light__'] = { dispose: () => pt.dispose() };
  }

  /** Create the mesh(es) for a single grid tile. */
  function _buildTile(tileId, gx, gz) {
    const T = CONSTANTS.TILE;
    const pos = gridToWorld(gx, gz);

    switch (tileId) {
      case T.CUBE:
      case T.PLAYER:      // Player start is also a floor tile
      case T.EXIT:
      case T.HAZARD:
      case T.FLOOR:       _buildFloorTile(tileId, gx, gz, pos); break;
      case T.BUTTON:      _buildButtonFromGlb(gx, gz, pos); break;
      case T.WALL:        _buildWall(tileId, gx, gz, pos, false); break;
      case T.PORTAL_WALL: _buildWall(tileId, gx, gz, pos, true); break;
      case T.DOOR:        _buildDoor(gx, gz, pos); break;
      case T.EMITTER:     _buildEmitRecv(tileId, gx, gz, pos); break;
      case T.RECEIVER:    _buildEmitRecv(tileId, gx, gz, pos); break;
      default: break; // EMPTY — nothing
    }

    // Extra floor under interactive tiles
    if ([T.EXIT, T.BUTTON, T.HAZARD, T.CUBE].includes(tileId)) {
      _buildBasicFloor(gx, gz, pos);
    }
  }

  /** Create a flat floor tile with subtle height variation. */
  function _buildBasicFloor(gx, gz, pos) {
    const key = `floor_${gx}_${gz}`;
    const mesh = BABYLON.MeshBuilder.CreateBox(key, {
      width:  CONSTANTS.TILE_SIZE - 0.04,
      height: CONSTANTS.TILE_HEIGHT,
      depth:  CONSTANTS.TILE_SIZE - 0.04,
    }, scene);
    mesh.position = pos.clone();
    mesh.position.y = -CONSTANTS.TILE_HEIGHT / 2;
    mesh.material = getMaterial(CONSTANTS.COLOR_FLOOR);
    mesh.receiveShadows = true;
    mesh.metadata = { gridX: gx, gridZ: gz, tileId: CONSTANTS.TILE.FLOOR };
  }

  function _buildFloorTile(tileId, gx, gz, pos) {
    const T   = CONSTANTS.TILE;
    const key = `tile_${gx}_${gz}`;

    const colorMap = {
      [T.FLOOR]:  CONSTANTS.COLOR_FLOOR,
      [T.PLAYER]: CONSTANTS.COLOR_FLOOR,
      [T.EXIT]:   CONSTANTS.COLOR_EXIT,
      [T.BUTTON]: CONSTANTS.COLOR_BUTTON,
      [T.HAZARD]: CONSTANTS.COLOR_HAZARD,
      [T.CUBE]:   CONSTANTS.COLOR_CUBE,
    };

    // Try GLB floor model for FLOOR and PLAYER tiles; use procedural for rest
    const useGlbFloor = (tileId === T.FLOOR || tileId === T.PLAYER || tileId === T.EXIT || tileId === T.HAZARD)
                        && AssetLoader.isLoaded(T.FLOOR);
    const useGlb = (tileId === T.EXIT || tileId === T.HAZARD)
                    && AssetLoader.isLoaded(tileId);
    let mesh;
    if (useGlbFloor) {
      const glb = AssetLoader.clone(T.FLOOR, key);
      if (glb) {
        glb.root.position = pos.clone();
        glb.root.position.y = 0;
        glb.root.getChildMeshes().forEach(m => {
          if (!(m instanceof BABYLON.InstancedMesh)) m.receiveShadows = true;
        });
        glb.root.metadata = { gridX: gx, gridZ: gz, tileId };
        meshMap[key] = glb.root;
        mesh = glb.root;
      }
    }

    let mmesh;
    if (useGlb) {
      const glb = AssetLoader.clone(tileId, key);
      if (glb) {
        glb.root.position = pos.clone();
        glb.root.position.y = 0;
        glb.root.getChildMeshes().forEach(m => {
          if (!(m instanceof BABYLON.InstancedMesh)) m.receiveShadows = true;
        });
        glb.root.metadata = { gridX: gx, gridZ: gz, tileId };
        meshMap[key] = glb.root;
        mmesh = glb.root;
      }
    }

    if (!mesh || !mmesh) {
      // Procedural fallback
      mesh = BABYLON.MeshBuilder.CreateBox(key, {
        width:  CONSTANTS.TILE_SIZE - 0.04,
        height: CONSTANTS.TILE_HEIGHT,
        depth:  CONSTANTS.TILE_SIZE - 0.04,
      }, scene);
      mesh.position = pos.clone();
      mesh.position.y = -CONSTANTS.TILE_HEIGHT / 2;
      const emit = (tileId === T.EXIT || tileId === T.HAZARD) ? 0.3 : 0;
      mesh.material = getMaterial(colorMap[tileId] || CONSTANTS.COLOR_FLOOR, emit);
      mesh.receiveShadows = true;
      mesh.metadata = { gridX: gx, gridZ: gz, tileId };
      meshMap[key] = mesh;
    }

    // Companion cube — try GLB first, fall back to procedural
    if (tileId === T.CUBE) {
      const glb = AssetLoader.isLoaded(T.CUBE)
        ? AssetLoader.clone(T.CUBE, `cube_${gx}_${gz}`)
        : null;
      let cubeRoot;
      if (glb) {
        glb.root.position = pos.clone();
        glb.root.position.y = 0;
        shadowGenerator.addShadowCaster(glb.root);
        glb.root.getChildMeshes().forEach(m => shadowGenerator.addShadowCaster(m));
        cubeRoot = glb.root;
        meshMap[`cube_glb_${gx}_${gz}`] = glb;  // store glb handle for animations
      } else {
        const cube = BABYLON.MeshBuilder.CreateBox(`cube_${gx}_${gz}`, {
          width: CONSTANTS.TILE_SIZE * 0.55,
          height: CONSTANTS.TILE_SIZE * 0.55,
          depth: CONSTANTS.TILE_SIZE * 0.55,
        }, scene);
        cube.position = pos.clone();
        cube.position.y = CONSTANTS.TILE_SIZE * 0.27;
        cube.material = getMaterial(CONSTANTS.COLOR_CUBE);
        shadowGenerator.addShadowCaster(cube);
        cubeRoot = cube;
      }
      meshMap[`cube_obj_${gx}_${gz}`] = cubeRoot;
    }

    // Exit gets a glowing ring
    if (tileId === T.EXIT) _addGlowRing(pos, CONSTANTS.COLOR_EXIT);
    // Hazard gets a danger stripe effect via UV animation (simplified: striped mat)
    if (tileId === T.HAZARD) _addHazardStripes(pos);
    // Button gets a disc marker
    if (tileId === T.BUTTON) _addButtonDisc(pos);
  }

  function _buildWall(tileId, gx, gz, pos, isPortalable) {
    const key = `wall_${gx}_${gz}`;
    const T   = CONSTANTS.TILE;

    // Color for different wall types
    const colorMap = {
      [T.WALL]:        CONSTANTS.COLOR_WALL,
      [T.PORTAL_WALL]: CONSTANTS.COLOR_WALL_ACCENT,
    };

    // Try GLB model first
    const glbKey = isPortalable ? T.PORTAL_WALL : tileId;
    const glb    = (tileId === T.WALL || tileId === T.PORTAL_WALL)
                    && AssetLoader.isLoaded(glbKey)
      ? AssetLoader.clone(glbKey, key)
      : null;
    let mesh;
    if (glb) {
      glb.root.position = pos.clone();
      glb.root.position.y = 0;
      glb.root.getChildMeshes().forEach(m => {
        // Skip receiveShadows on InstancedMesh (BabylonJS warning)
        if (!(m instanceof BABYLON.InstancedMesh)) m.receiveShadows = true;
        shadowGenerator.addShadowCaster(m);
      });
      mesh = glb.root;
    } else {
      mesh = BABYLON.MeshBuilder.CreateBox(key, {
        width:  CONSTANTS.TILE_SIZE,
        height: CONSTANTS.WALL_HEIGHT,
        depth:  CONSTANTS.TILE_SIZE,
      }, scene);
      mesh.position = pos.clone();
      mesh.position.y = CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
      const emit = isPortalable ? 0.08 : 0;
      mesh.material = getMaterial(colorMap[tileId] || CONSTANTS.COLOR_WALL, emit);
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh);
    }
    mesh.metadata = { gridX: gx, gridZ: gz, tileId };
    mesh.getChildMeshes?.().forEach(m => { m.metadata = { gridX: gx, gridZ: gz, tileId }; });
    meshMap[key] = mesh;

    // Portal-wall edge highlight lines
    // if (isPortalable) _addPortalWallEdge(pos);
  }

  function _buildEmitRecv(tileId, gx, gz, pos) {
    const key = `wall_${gx}_${gz}`;
    const T   = CONSTANTS.TILE;

    // Color for different wall types
    const colorMap = {
      [T.EMITTER]:     CONSTANTS.COLOR_EMITTER,
      [T.RECEIVER]:    '#00ccff',
    };

    // Try GLB model first
    const glb    = (tileId === T.EMITTER || tileId === T.RECEIVER)
                    && AssetLoader.isLoaded(tileId)
      ? AssetLoader.clone(tileId, key)
      : null;
    let mesh;
    if (glb) {
      glb.root.position = pos.clone();
      glb.root.position.y = 0;
      glb.root.getChildMeshes().forEach(m => {
        // Skip receiveShadows on InstancedMesh (BabylonJS warning)
        if (!(m instanceof BABYLON.InstancedMesh)) m.receiveShadows = true;
        shadowGenerator.addShadowCaster(m);
      });
      mesh = glb.root;
    } else {
      mesh = BABYLON.MeshBuilder.CreateBox(key, {
        width:  CONSTANTS.TILE_SIZE,
        height: CONSTANTS.WALL_HEIGHT,
        depth:  CONSTANTS.TILE_SIZE,
      }, scene);
      mesh.position = pos.clone();
      mesh.position.y = CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
      const emit = (tileId === T.EMITTER ? 0.4 : 0);
      mesh.material = getMaterial(colorMap[tileId] || CONSTANTS.COLOR_WALL, emit);
      mesh.receiveShadows = true;
      shadowGenerator.addShadowCaster(mesh);
    }
    mesh.metadata = { gridX: gx, gridZ: gz, tileId };
    mesh.getChildMeshes?.().forEach(m => { m.metadata = { gridX: gx, gridZ: gz, tileId }; });
    meshMap[key] = mesh;
  }

  function _buildDoor(gx, gz, pos) {
    const key = `door_${gx}_${gz}`;
    const glb = AssetLoader.isLoaded(CONSTANTS.TILE.DOOR)
      ? AssetLoader.clone(CONSTANTS.TILE.DOOR, key)
      : null;
    let mesh;
    if (glb) {
      glb.root.position = pos.clone();
      glb.root.position.y = 0;
      glb.root.getChildMeshes().forEach(m => {
        m.receiveShadows = true;
        shadowGenerator.addShadowCaster(m);
      });
      mesh = glb.root;
      // Store GLB handle so setDoorState can drive animations
      meshMap[`${key}_glb`] = glb;
    } else {
      mesh = BABYLON.MeshBuilder.CreateBox(key, {
        width:  CONSTANTS.TILE_SIZE,
        height: CONSTANTS.WALL_HEIGHT,
        depth:  CONSTANTS.TILE_SIZE * 0.2,
      }, scene);
      mesh.position = pos.clone();
      mesh.position.y = CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
      mesh.material = getMaterial(CONSTANTS.COLOR_DOOR, 0.2);
      shadowGenerator.addShadowCaster(mesh);
    }
    meshMap[key] = mesh;
  }

  // ── Decorative helpers ───────────────────────────────────

  function _addGlowRing(pos, hexColor) {
    const ring = BABYLON.MeshBuilder.CreateTorus(`ring_${pos.x}_${pos.z}`, {
      diameter: CONSTANTS.TILE_SIZE * 0.75,
      thickness: 0.08,
      tessellation: 24,
    }, scene);
    ring.position = pos.clone();
    ring.position.y = 0.02;
    ring.rotation.x = Math.PI / 2;
    const mat = new BABYLON.StandardMaterial(`ring_mat_${pos.x}`, scene);
    mat.emissiveColor = hex2color3(hexColor);
    ring.material = mat;
    meshMap[`ring_${pos.x}_${pos.z}`] = ring;
  }

  function _buildButtonFromGlb(gx, gz, pos) {
    const key = `btn_glb_${gx}_${gz}`;
    const glb = AssetLoader.clone(CONSTANTS.TILE.BUTTON, key);
    if (!glb) return false;
    glb.root.position = pos.clone();
    glb.root.position.y = 0;
    glb.root.getChildMeshes().forEach(m => shadowGenerator.addShadowCaster(m));
    meshMap[key] = glb.root;
    meshMap[`${key}_glb`] = glb;
    return true;
  }

  function _addButtonDisc(pos) {
    const disc = BABYLON.MeshBuilder.CreateCylinder(`btn_${pos.x}_${pos.z}`, {
      diameter: CONSTANTS.TILE_SIZE * 0.5,
      height: 0.12,
      tessellation: 20,
    }, scene);
    disc.position = pos.clone();
    disc.position.y = 0.02;
    disc.material = getMaterial(CONSTANTS.COLOR_BUTTON, 0.3);
    meshMap[`btn_${pos.x}_${pos.z}`] = disc;
  }

  function _addHazardStripes(pos) {
    // Thin warning chevrons as overlay
    for (let i = -1; i <= 1; i++) {
      const stripe = BABYLON.MeshBuilder.CreateBox(`haz_stripe_${pos.x}_${pos.z}_${i}`, {
        width: 0.12, height: 0.05,
        depth: CONSTANTS.TILE_SIZE * 0.8,
      }, scene);
      stripe.position = pos.clone();
      stripe.position.y = 0.03;
      stripe.position.x += i * 0.4;
      stripe.rotation.y = Math.PI / 4;
      stripe.material = getMaterial('#ff2244', 0.5);
    }
  }

  function _addPortalWallEdge(pos) {
    const edge = BABYLON.MeshBuilder.CreateBox(`pedge_${pos.x}_${pos.z}`, {
      width: CONSTANTS.TILE_SIZE + 0.1,
      height: CONSTANTS.WALL_HEIGHT + 0.1,
      depth: CONSTANTS.TILE_SIZE + 0.1,
    }, scene);
    edge.position = pos.clone();
    edge.position.y = CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
    const mat = new BABYLON.StandardMaterial(`pedge_mat`, scene);
    mat.wireframe = true;
    mat.emissiveColor = hex2color3(CONSTANTS.COLOR_WALL_ACCENT);
    mat.alpha = 0.25;
    edge.material = mat;
    meshMap[`pedge_${pos.x}_${pos.z}`] = edge;
  }

  // ── Portal rendering ─────────────────────────────────────

  /**
   * Show or hide a portal ring on a wall face.
   * @param {'A'|'B'} which
   * @param {{x:number,z:number}|null} cell — null to remove portal
   */
  function updatePortal(which, cell) {
    const key = `portal_${which}`;
    // Dispose ring and fill if present
    if (meshMap[key])           { try { meshMap[key].dispose(); }           catch(_){} delete meshMap[key]; }
    if (meshMap[`${key}_fill`]) { try { meshMap[`${key}_fill`].dispose(); } catch(_){} delete meshMap[`${key}_fill`]; }
    if (!cell) return;

    const color = which === 'A' ? CONSTANTS.COLOR_PORTAL_A : CONSTANTS.COLOR_PORTAL_B;
    const pos   = gridToWorld(cell.x, cell.z);

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
    ringPos.y      = CONSTANTS.WALL_HEIGHT * 0.5;
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

  /** Create or move the player mesh to the given grid cell. */
  function setPlayerMesh(gx, gz) {
    const key = 'player_mesh';
    const pos = gridToWorld(gx, gz);
    pos.y = 0;

    if (!meshMap[key]) {
      // Try GLB player model first
      const glb = AssetLoader.isLoaded('player')
        ? AssetLoader.clone('player', key)
        : null;
      if (glb) {
        glb.root.position = pos.clone();
        shadowGenerator.addShadowCaster(glb.root);
        glb.root.getChildMeshes().forEach(m => shadowGenerator.addShadowCaster(m));
        meshMap[key] = glb.root;
        meshMap[key + '_glb'] = glb;
        return;
      }
      pos.y = CONSTANTS.TILE_SIZE * 0.45;
      // Procedural player is a capsule-like composition: body + head
      const body = BABYLON.MeshBuilder.CreateCylinder(key + '_body', {
        diameterTop: 0.55, diameterBottom: 0.65,
        height: 1.4, tessellation: 12,
      }, scene);
      body.position = pos.clone();
      body.material = getMaterial(CONSTANTS.COLOR_PLAYER);
      shadowGenerator.addShadowCaster(body);
      meshMap[key] = body;

      const head = BABYLON.MeshBuilder.CreateSphere(key + '_head', {
        diameter: 0.55, segments: 8,
      }, scene);
      head.parent = body;
      head.position.y = 1.0;
      head.material = getMaterial(CONSTANTS.COLOR_PLAYER, 0.1);
      // Head and visor are children of body — body parent disposal handles them.
      // Don't store in meshMap to avoid double-dispose on clearLevel().

      // Aperture visor strip
      const visor = BABYLON.MeshBuilder.CreateBox(key + '_visor', {
        width: 0.4, height: 0.08, depth: 0.35,
      }, scene);
      visor.parent = head;
      visor.position.z = 0.22;
      visor.position.y = 0.05;
      visor.material = getMaterial(CONSTANTS.COLOR_PORTAL_A, 0.6);
    } else {
      meshMap[key].position = pos.clone();
    }
  }

  /** Smoothly animate player mesh to new position with a subtle hop arc. */
  function animatePlayerTo(gx, gz, onDone) {
    const key   = 'player_mesh';
    const mesh  = meshMap[key];
    if (!mesh) { onDone?.(); return; }

    const start  = mesh.position ? mesh.position.clone() : BABYLON.Vector3.Zero();
    const isGLB  = !!meshMap[key + '_glb'];
    const target = gridToWorld(gx, gz);
    target.y = isGLB ? 0 : CONSTANTS.TILE_SIZE * 0.45;

    const mid = BABYLON.Vector3.Lerp(start, target, 0.5);
    mid.y = start.y + 0.35;  // Hop apex

    // Position animation with arc midpoint
    const animPos = new BABYLON.Animation('move', 'position', 60,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    animPos.setKeys([
      { frame: 0,  value: start  },
      { frame: 5,  value: mid    },
      { frame: 11, value: target },
    ]);

    if (isGLB) {
      // GLB root: position-only animation, no scale squash
      mesh.animations = [animPos];
      scene.beginAnimation(mesh, 0, 11, false, 1, onDone);
    } else {
      const animScale = new BABYLON.Animation('scale', 'scaling', 60,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      animScale.setKeys([
        { frame: 0,  value: new BABYLON.Vector3(1,   1,   1)   },
        { frame: 3,  value: new BABYLON.Vector3(0.88,1.14,0.88) },
        { frame: 5,  value: new BABYLON.Vector3(1.04,0.96,1.04) },
        { frame: 11, value: new BABYLON.Vector3(1,   1,   1)   },
      ]);
      mesh.animations = [animPos, animScale];
      scene.beginAnimation(mesh, 0, 11, false, 1, onDone);
    }
  }

  /** Open or close a door — uses GLB animation if available. */
  function setDoorState(gx, gz, open) {
    const key    = `door_${gx}_${gz}`;
    const glbKey = `${key}_glb`;
    const mesh   = meshMap[key];
    if (!mesh) return;

    // GLB path: play 'open' or 'close' animation
    const glb = meshMap[glbKey];
    if (glb) {
      glb.stopAllAnims();
      glb.playAnim(open ? 'open' : 'close', false);
      return;
    }

    // Procedural path: slide door into / out of floor
    const targetY = open
      ? -(CONSTANTS.WALL_HEIGHT)
      : CONSTANTS.WALL_HEIGHT / 2 - CONSTANTS.TILE_HEIGHT;
    const anim = new BABYLON.Animation('doorAnim', 'position.y', 60,
      BABYLON.Animation.ANIMATIONTYPE_FLOAT,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    anim.setKeys([
      { frame: 0,  value: mesh.position.y },
      { frame: 18, value: targetY },
    ]);
    mesh.animations = [anim];
    scene.beginAnimation(mesh, 0, 18, false);
  }

  /** Flash a tile with a given color (used for button press feedback). */
  function flashTile(gx, gz, hexColor) {
    const key  = `tile_${gx}_${gz}`;
    const mesh = meshMap[key];
    if (!mesh) return;
    const orig = mesh.material;
    mesh.material = getMaterial(hexColor, 0.5);
    setTimeout(() => { mesh.material = orig; }, 300);
  }

  /** Update companion cube position when pushed. */
  function moveCubeMesh(fromX, fromZ, toX, toZ) {
    const key = `cube_obj_${fromX}_${fromZ}`;
    const mesh = meshMap[key];
    if (!mesh) return;
    const target = gridToWorld(toX, toZ);
    target.y = CONSTANTS.TILE_SIZE * 0.27;
    mesh.position = target;
    // Re-key
    meshMap[`cube_obj_${toX}_${toZ}`] = mesh;
    delete meshMap[key];
  }

  /**
   * Rotate the player mesh to face a grid direction.
   * Compensates for the iso camera angle (alpha = -PI/4) so the
   * character visually faces the correct screen direction.
   * @param {{dx:number, dz:number}} dir
   */
  function rotatePlayerMesh(dir) {
    const mesh = meshMap['player_mesh'];
    const glb = meshMap['player_mesh_glb'];
    if (!mesh) return;
    
    let angle = 0;

    if (mesh.rotationQuaternion) {
      mesh.rotation = mesh.rotationQuaternion.toEulerAngles();
      mesh.rotationQuaternion = null;
    }

    if (!glb) {
      if      (dir.dx ===  1 && dir.dz ===  0) angle =  Math.PI * 0.25;
      else if (dir.dx === -1 && dir.dz ===  0) angle = -Math.PI * 0.75;
      else if (dir.dx ===  0 && dir.dz ===  1) angle =  Math.PI * 0.75;
      else if (dir.dx ===  0 && dir.dz === -1) angle = -Math.PI * 0.25;

      const anim = new BABYLON.Animation(
        'rot', 'rotation.y', 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
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
  }

  function pressButton(gx, gz) {
    const key    = `btn_glb_${gx}_${gz}`;
    const glbKey = `${key}_glb`;
    const mesh  = meshMap[key];
    if (!mesh) return;

    // GLB path: play 'press' or 'release' animation
    const glb = meshMap[glbKey];

    if (glb) { 
      glb.stopAllAnims(); 
      glb.playAnim('press', false); 
    }
  }

  function releaseButton(gx, gz) {
    const key    = `btn_glb_${gx}_${gz}`;
    const glbKey = `${key}_glb`;
    const mesh  = meshMap[key];
    if (!mesh) return;

    // GLB path: play 'press' or 'release' animation
    const glb = meshMap[glbKey];

    if (glb) { 
      glb.stopAllAnims(); 
      glb.playAnim('release', false); 
    }
  }

  return {
    init, buildLevel, clearLevel,
    gridToWorld, setPlayerMesh, animatePlayerTo, rotatePlayerMesh,
    updatePortal, setDoorState, flashTile, moveCubeMesh,
    pressButton, releaseButton,
    getScene:  () => scene,
    getEngine: () => engine,
    getCamera: () => camera,
    toggleOrbit,
    isOrbitUnlocked: () => _orbitUnlocked,
    /** Toggle shadow map refresh (performance option). */
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

    /** Expose camera reference (needed by AR session to adjust FOV). */
    getCamera: () => camera,
  };
})();
