// ============================================================
// laser.js — Laser emitter/receiver puzzle system
// Lasers are traced per-frame along grid axes; portals redirect them.
// Each emitter fires in a fixed direction (stored in level data).
// ============================================================

const LaserSystem = (() => {
  let scene     = null;
  let levelData = null;
  let laserMeshes    = [];   // All active laser segment meshes
  let receiverStates = {};   // key: `${x}_${z}` → boolean (active)
  let _laserSegments = [];   // [{from:{x,z}, to:{x,z}, layerIdx}] — grid-space, for minimap
  let stopHum = null;        // Function to stop laser hum sound

  function init(babylonScene) {
    scene = babylonScene;
  }

  // ── Level setup ──────────────────────────────────────────

  /**
   * Load emitter/receiver data from a level definition.
   * level.lasers = [{ emitter:{x,z,layer?}, dir:{dx,dz}, receiverId:'recv_key' }, ...]
   */
  function loadLevel(data) {
    levelData     = data;
    receiverStates = {};
    _clearMeshes();

    // Start laser hum if there are any emitters
    if (data.lasers && data.lasers.length > 0) {
      stopHum = AudioEngine.laserHum(440);
    }
  }

  function unload() {
    _clearMeshes();
    if (stopHum) { stopHum(); stopHum = null; }
    levelData = null;
  }

  // ── Per-frame trace ──────────────────────────────────────

  /**
   * Rebuild all laser beams based on current portal and grid state.
   * Called every time the game state changes (portal placed, cube moved, movable moved).
   */
  function update() {
    if (!levelData?.lasers) return;
    _clearMeshes();

    const prevStates = { ...receiverStates };

    levelData.lasers.forEach(laser => {
      const hit = _traceLaser(laser.emitter, laser.dir, laser.receiverId, laser);
      receiverStates[laser.receiverId] = hit.isTarget;

      // Fire events when receiver state changes
      if (hit !== prevStates[laser.receiverId]) {
        EventBus.emit('laser:receiver-changed', {
          id:     laser.receiverId,
          active: hit.isTarget,
        });
      }
    });
  }

  /**
   * Trace a laser ray from origin, bouncing through portals if hit.
   * Returns true if it reaches the designated receiver.
   * laser.emitter.layer is used to read the correct grid and set beam height.
   */
  function _traceLaser(origin, dir, targetReceiverId, laser = {}) {
    const layerIdx = laser.emitter?.layer ?? 0;
    const layerY   = Renderer.getLayerY ? Renderer.getLayerY(layerIdx) : 0;

    let pos    = { ...origin };
    let curDir = { ...dir };
    const portals = PortalGun.getPortals();
    const MAX_STEPS = 50;
    const MAX_BOUNCES = 3;
    let bounces = 0;

    for (let step = 0; step < MAX_STEPS; step++) {
      const nx = pos.x + curDir.dx;
      const nz = pos.z + curDir.dz;
      const tile = Physics.getTile(nx, nz, layerIdx);

      // Check portal entry
      if (portals.A && portals.A.x === nx && portals.A.z === nz && portals.B && bounces < MAX_BOUNCES) {
        _drawSegment(pos, { x: nx, z: nz }, layerY, layerIdx);
        const exit = Physics.getPortalExit(portals.A, portals.B, curDir);
        pos    = { x: exit.exitX, z: exit.exitZ };
        curDir = exit.exitDir;
        bounces++;
        continue;
      }
      if (portals.B && portals.B.x === nx && portals.B.z === nz && portals.A && bounces < MAX_BOUNCES) {
        _drawSegment(pos, { x: nx, z: nz }, layerY, layerIdx);
        const exit = Physics.getPortalExit(portals.B, portals.A, curDir);
        pos    = { x: exit.exitX, z: exit.exitZ };
        curDir = exit.exitDir;
        bounces++;
        continue;
      }

      // Hit receiver — check if it's the target
      if (tile === CONSTANTS.TILE.RECEIVER) {
        _drawSegment(pos, { x: nx, z: nz }, layerY, layerIdx);
        const key = `${nx}_${nz}`;
        return { key:key, isTarget:(key === targetReceiverId) };
      }

      // Hit any solid or player — stop
      const pPos = Player.getPosition();
      const pLayer = Player.getLayer ? Player.getLayer() : 0;
      if (isSolid(tile) || (pPos.x === nx && pPos.z === nz && pLayer === layerIdx)) {
        _drawSegment(pos, { x: nx, z: nz }, layerY, layerIdx);
        return { key:`null`, isTarget:false };
      }

      _drawSegment(pos, { x: nx, z: nz }, layerY, layerIdx);
      pos = { x: nx, z: nz };
    }
    return { key:`null`, isTarget:false };
  }

  // ── Mesh drawing ─────────────────────────────────────────

  function _drawSegment(from, to, layerY = 0, layerIdx = 0) {
    // Store grid-space segment for minimap rendering
    _laserSegments.push({ from: { x: from.x, z: from.z }, to: { x: to.x, z: to.z }, layerIdx });
    if (!scene) return;

    const fromW = Renderer.gridToWorld(from.x, from.z, layerY);
    const toW   = Renderer.gridToWorld(to.x,   to.z,   layerY);
    fromW.y     = layerY + CONSTANTS.WALL_HEIGHT * 0.55;
    toW.y       = layerY + CONSTANTS.WALL_HEIGHT * 0.55;

    // Create a thin stretched box as the laser beam segment
    const mid = BABYLON.Vector3.Lerp(fromW, toW, 0.5);
    const len = BABYLON.Vector3.Distance(fromW, toW);
    if (len < 0.001) return;

    const seg = BABYLON.MeshBuilder.CreateBox(`laser_seg_${laserMeshes.length}`, {
      width:  len,
      height: 0.06,
      depth:  0.06,
    }, scene);
    seg.position = mid;

    // Orient along the beam direction
    const angle = Math.atan2(toW.z - fromW.z, toW.x - fromW.x);
    seg.rotation.y = -angle;

    const mat = new BABYLON.StandardMaterial(`laser_mat_${laserMeshes.length}`, scene);
    mat.emissiveColor = new BABYLON.Color3(1, 0.1, 0.05);
    mat.disableLighting = true;
    seg.material = mat;

    laserMeshes.push(seg);
  }

  function _clearMeshes() {
    laserMeshes.forEach(m => { try { m.dispose(); } catch(_){} });
    laserMeshes = [];
    _laserSegments = [];
  }

  // ── Receiver query ───────────────────────────────────────

  function isReceiverActive(key) {
    return !!receiverStates[key];
  }

  return { init, loadLevel, unload, update, isReceiverActive,
           getSegments: () => _laserSegments };
})();