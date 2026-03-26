// ============================================================
// player.js — Player state machine + multi-platform input
//
// Platform detection:
//   'desktop' — keyboard + mouse (PC/Mac)
//   'touch'   — touchscreen phone/tablet (virtual D-pad)
//   'ar'      — AR mode: Quest controller ray-cast OR touch D-pad
//
// Control schemes (selectable in Settings on desktop):
//   'classic' — W/A/S/D direct 4-dir movement + Z/X/C/V aim
//   'tank'    — W/S forward/back, A/D rotate 90°
//
// AR / Quest:
//   Right trigger / tap cell → move player to that cell (pathfind 1 step)
//   A button / left-click on portal_wall → Portal A
//   B button / right-click on portal_wall → Portal B
//   Left thumbstick → move in 4 directions
// ============================================================

const Player = (() => {

  // ── State ──────────────────────────────────────────────────
  let position   = { x: 0, z: 0 };
  let facing     = CONSTANTS.DIRS.DOWN;
  let isMoving   = false;
  let stepCount  = 0;
  let portalUses = 0;

  let _scheme   = 'classic';  // 'classic' | 'tank'
  let _platform = 'desktop';  // 'desktop' | 'touch' | 'ar'

  // Path-following queue (click-to-move)
  let _pathQueue  = [];   // [{x,z}, ...] remaining steps
  let _pathTimer  = null; // setInterval handle

  // ── Rotation table ─────────────────────────────────────────
  const TURN_ORDER = [
    CONSTANTS.DIRS.UP, CONSTANTS.DIRS.RIGHT,
    CONSTANTS.DIRS.DOWN, CONSTANTS.DIRS.LEFT,
  ];

  const CLASSIC_MAP = {
    KeyW: CONSTANTS.DIRS.DOWN, ArrowUp:    CONSTANTS.DIRS.DOWN,
    KeyS: CONSTANTS.DIRS.UP,   ArrowDown:  CONSTANTS.DIRS.UP,
    KeyA: CONSTANTS.DIRS.LEFT, ArrowLeft:  CONSTANTS.DIRS.LEFT,
    KeyD: CONSTANTS.DIRS.RIGHT,ArrowRight: CONSTANTS.DIRS.RIGHT,
  };
  const AIM_MAP = {
    KeyZ: CONSTANTS.DIRS.UP,   KeyX: CONSTANTS.DIRS.DOWN,
    KeyC: CONSTANTS.DIRS.LEFT, KeyV: CONSTANTS.DIRS.RIGHT,
  };

  // ── Listeners ───────────────────────────────────────────────
  let _keyHandler   = null;
  let _mouseHandler = null;
  let _arHandlers   = [];
  let _hoverMesh    = null;  // Currently hovered tile mesh in AR

  // ── Lifecycle ───────────────────────────────────────────────

  function init(startX, startZ) {
    position   = { x: startX, z: startZ };
    facing     = CONSTANTS.DIRS.RIGHT;
    isMoving   = false;
    stepCount  = 0;
    portalUses = 0;
    _detectPlatform();
    Renderer.setPlayerMesh(startX, startZ);
    _rotateMesh(facing);
    _startListeners();
  }

  function destroy() { _cancelPath(); _stopListeners(); }

  function setScheme(s) { if (s === 'classic' || s === 'tank') _scheme = s; }
  function getScheme()  { return _scheme; }

  // ── Platform detection ──────────────────────────────────────

  function _detectPlatform() {
    const ua = navigator.userAgent || '';
    // Quest browser: OculusBrowser or Meta in UA, or prefer immersive-ar check
    const isQuest = /OculusBrowser|MetaQuest/i.test(ua);
    const isMobile = /Android|iPhone|iPad/i.test(ua) || (navigator.maxTouchPoints > 1);
    if (ARManager?.isActive?.()) { _platform = 'ar'; }
    else if (isQuest)            { _platform = 'ar'; }
    else if (isMobile)           { _platform = 'touch'; }
    else                         { _platform = 'desktop'; }
  }

  // ── Listeners ───────────────────────────────────────────────

  function _startListeners() {
    // Always listen for keyboard (works on desktop + Quest browser keyboard)
    _keyHandler = e => { if (e.type === 'keydown') _onKey(e.code); };
    window.addEventListener('keydown', _keyHandler);

    // Unified mouse handler (works in all platforms including AR viewer)
    _mouseHandler = e => {
      if (e.button !== 0 && e.button !== 2) return;
      _handleMouseClick(e, e.button === 0 ? 'A' : 'B');
    };
    const canvas = document.getElementById('game-canvas');
    canvas?.addEventListener('mousedown', _mouseHandler);
    canvas?.addEventListener('contextmenu', e => e.preventDefault());

    // AR controller actions
    const arCellHandler = ({ x, z, action }) => {
      if (action === 'move') { _cancelPath(); _moveToCell(x, z); }
    };
    const arActionHandler = ({ action }) => {
      switch(action) {
        case 'portal-a': PortalGun.shoot('A', position, facing); break;
        case 'portal-b': PortalGun.shoot('B', position, facing); break;
        case 'up':    _step(CONSTANTS.DIRS.UP);    break;
        case 'down':  _step(CONSTANTS.DIRS.DOWN);  break;
        case 'left':  _step(CONSTANTS.DIRS.LEFT);  break;
        case 'right': _step(CONSTANTS.DIRS.RIGHT); break;
      }
    };
    const arHoverHandler = ({ mesh }) => { _onARHover(mesh); };

    EventBus.on('ar:cell-picked',      arCellHandler);
    EventBus.on('ar:controller-action', arActionHandler);
    EventBus.on('ar:pointer-hover',    arHoverHandler);
    _arHandlers = [
      ['ar:cell-picked',      arCellHandler],
      ['ar:controller-action', arActionHandler],
      ['ar:pointer-hover',    arHoverHandler],
    ];

    // Touch virtual D-pad (injected by uiManager when platform=touch)
    _setupTouchDpad();

    // Update platform on AR state changes
    EventBus.on('ar:entered', () => { _platform = 'ar'; _setupARHighlight(); });
    EventBus.on('ar:exited',  () => { _detectPlatform(); _clearARHighlight(); });
  }

  function _stopListeners() {
    if (_keyHandler)   window.removeEventListener('keydown', _keyHandler);
    if (_mouseHandler) {
      document.getElementById('game-canvas')
        ?.removeEventListener('mousedown', _mouseHandler);
    }
    _arHandlers.forEach(([ev, fn]) => EventBus.off(ev, fn));
    _arHandlers = [];
    _keyHandler = _mouseHandler = null;
  }

  // ── Touch D-pad ─────────────────────────────────────────────

  function _setupTouchDpad() {
    // Wire all touch buttons — they live in #touch-dpad-arrows and #touch-dpad-portals
    const map = {
      'dpad-up':       () => _step(CONSTANTS.DIRS.DOWN),
      'dpad-down':     () => _step(CONSTANTS.DIRS.UP),
      'dpad-left':     () => _step(CONSTANTS.DIRS.LEFT),
      'dpad-right':    () => _step(CONSTANTS.DIRS.RIGHT),
      'dpad-portal-a': () => PortalGun.shoot('A', position, facing),
      'dpad-portal-b': () => PortalGun.shoot('B', position, facing),
    };
    Object.entries(map).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (!el) return;
      // touchstart for immediate response; also click for desktop testing
      el.addEventListener('touchstart', e => { e.preventDefault(); fn(); }, { passive: false });
      el.addEventListener('mousedown',  e => { e.preventDefault(); fn(); });
    });
  }

  // ── AR tile highlight ────────────────────────────────────────

  function _setupARHighlight() {
    // Allow picking via ray-cast
    const scene = Renderer.getScene();
    if (!scene) return;
    scene.meshes.forEach(m => { m.isPickable = true; });
  }

  function _clearARHighlight() {
    if (_hoverMesh) {
      // Restore original material color
      EventBus.emit('ar:unhover', { mesh: _hoverMesh });
      _hoverMesh = null;
    }
  }

  function _onARHover(mesh) {
    if (_hoverMesh && _hoverMesh !== mesh) {
      EventBus.emit('ar:unhover', { mesh: _hoverMesh });
    }
    _hoverMesh = mesh;
    EventBus.emit('ar:hover', { mesh });
  }

  // ── AR cell navigation ───────────────────────────────────────

  /**
   * Start walking a BFS path from current position to (tx, tz).
   * Steps are executed sequentially; each step waits for the
   * animation to finish before taking the next one.
   */
  function _moveToCell(tx, tz) {
    const path = Physics.findPath(position, { x: tx, z: tz });
    if (!path.length) return;
    _cancelPath();
    _pathQueue = path;
    _drivePathStep();
  }

  function _drivePathStep() {
    if (!_pathQueue.length) return;
    if (isMoving) {
      // Wait briefly and retry (animation not done yet)
      _pathTimer = setTimeout(_drivePathStep, 40);
      return;
    }
    const next = _pathQueue.shift();
    const dx   = next.x - position.x;
    const dz   = next.z - position.z;
    if (Math.abs(dx) + Math.abs(dz) !== 1) {
      // Not an adjacent cell — path got stale (e.g. cube was pushed). Abort.
      _cancelPath();
      return;
    }
    const dir = dx !== 0
      ? (dx > 0 ? CONSTANTS.DIRS.RIGHT : CONSTANTS.DIRS.LEFT)
      : (dz > 0 ? CONSTANTS.DIRS.DOWN  : CONSTANTS.DIRS.UP);
    _step(dir);
    if (_pathQueue.length) _pathTimer = setTimeout(_drivePathStep, 40);
  }

  function _cancelPath() {
    if (_pathTimer) { clearTimeout(_pathTimer); _pathTimer = null; }
    _pathQueue = [];
  }

  // ── Keyboard ─────────────────────────────────────────────────

  function _onKey(code) {
    switch(code) {
      case 'KeyQ': PortalGun.shoot('A', position, facing); return;
      case 'KeyR': PortalGun.shoot('B', position, facing); return;
      case 'Escape': EventBus.emit('ui:escape'); return;
    }
    if (_scheme === 'classic') _handleClassic(code);
    else                       _handleTank(code);
  }

  function _handleClassic(code) {
    if (AIM_MAP[code]) { _aimTo(AIM_MAP[code]); return; }
    const dir = CLASSIC_MAP[code];
    if (dir) _step(dir);
  }

  function _aimTo(dir) {
    if (isMoving) return;
    facing = dir;
    _rotateMesh(dir);
    EventBus.emit('player:turned', { facing });
  }

  function _handleTank(code) {
    switch(code) {
      case 'KeyW': case 'ArrowUp':    _step(facing); break;
      case 'KeyS': case 'ArrowDown':  _step({ dx:-facing.dx, dz:-facing.dz }); break;
      case 'KeyA': case 'ArrowLeft':  _turn(-1); break;
      case 'KeyD': case 'ArrowRight': _turn(+1); break;
    }
  }

  function _turn(delta) {
    if (isMoving) return;
    const idx  = TURN_ORDER.findIndex(d => d.dx===facing.dx && d.dz===facing.dz);
    facing = TURN_ORDER[(idx + delta + 4) % 4];
    _rotateMesh(facing);
    EventBus.emit('player:turned', { facing });
  }

  // ── Core movement ────────────────────────────────────────────

  function _step(dir) {
    if (isMoving) return;
    facing = dir;
    _rotateMesh(dir);
    const nx = position.x + dir.dx;
    const nz = position.z + dir.dz;

    // Teleport check before collision (portal walls are solid)
    const teleport = PortalGun.checkTeleport(position, nx, nz, dir);
    if (teleport) { _doTeleport(teleport); return; }

    const result = Physics.canMoveTo(position.x, position.z, nx, nz);
    if (!result.ok) { EventBus.emit('player:bumped', { x:nx, z:nz }); return; }

    if (result.pushCube) {
      const { fromX, fromZ, toX, toZ } = result.pushCube;
      Physics.setTile(fromX, fromZ, CONSTANTS.TILE.FLOOR);
      Physics.setTile(toX,   toZ,   CONSTANTS.TILE.CUBE);
      Renderer.moveCubeMesh(fromX, fromZ, toX, toZ);
      EventBus.emit('cube:moved', { fromX, fromZ, toX, toZ });
    }
    _commitMove(nx, nz);
  }

  function _commitMove(nx, nz) {
    isMoving = true;
    position = { x:nx, z:nz };
    stepCount++;
    const el = document.getElementById('step-count');
    if (el) el.textContent = stepCount;
    EventBus.emit('player:step', { x:nx, z:nz });
    Renderer.animatePlayerTo(nx, nz, () => {
      isMoving = false;
      EventBus.emit('player:landed', { x:nx, z:nz });
    });
  }

  function _doTeleport({ exitX, exitZ, exitDir }) {
    isMoving   = true;
    portalUses++;
    position   = { x:exitX, z:exitZ };
    facing     = exitDir;
    stepCount++;
    _rotateMesh(exitDir);
    EventBus.emit('portal:used', { exitX, exitZ });
    EventBus.emit('ui:portal-flash');
    Renderer.animatePlayerTo(exitX, exitZ, () => {
      isMoving = false;
      EventBus.emit('player:landed', { x:exitX, z:exitZ });
    });
  }

  // ── Mouse click handler ─────────────────────────────────────
  // Left-click floor → walk there via BFS path
  // Left-click portal_wall → shoot Portal A
  // Right-click portal_wall → shoot Portal B
  // Right-click floor → shoot Portal B in direction of click

  function _handleMouseClick(e, which) {
    try {
      const scene  = Renderer.getScene();
      const canvas = document.getElementById('game-canvas');
      if (!scene || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pick = scene.pick(e.clientX - rect.left, e.clientY - rect.top);
      if (!pick?.hit || !pick.pickedMesh) return;

      // Read grid info from mesh metadata
      const meta   = pick.pickedMesh.metadata;
      const gx     = meta?.gridX ?? Math.round(pick.pickedPoint.x / CONSTANTS.TILE_SIZE);
      const gz     = meta?.gridZ ?? Math.round(pick.pickedPoint.z / CONSTANTS.TILE_SIZE);
      const tileId = meta?.tileId ?? Physics.getTile(gx, gz);

      if (tileId === CONSTANTS.TILE.PORTAL_WALL) {
        // Clicked a portal wall: shoot portal in player→wall direction
        const ddx = Math.sign(gx - position.x);
        const ddz = Math.sign(gz - position.z);
        const dir = Math.abs(gx - position.x) >= Math.abs(gz - position.z)
          ? { dx: ddx || 1, dz: 0 }
          : { dx: 0, dz: ddz || 1 };
        PortalGun.shoot(which, position, dir);
        return;
      }

      if (e.button === 2) {
        // Right-click on non-portal: shoot in click direction
        const ddx = Math.sign(gx - position.x);
        const ddz = Math.sign(gz - position.z);
        const dir = Math.abs(gx - position.x) >= Math.abs(gz - position.z)
          ? { dx: ddx || 1, dz: 0 }
          : { dx: 0, dz: ddz || 1 };
        PortalGun.shoot('B', position, dir);
        return;
      }

      // Left-click on walkable tile: pathfind and walk there
      if (!isSolid(tileId)) {
        _cancelPath();
        _moveToCell(gx, gz);
      }
    } catch(err) {
      console.warn('[Player] click handler:', err);
    }
  }

  // ── Mesh helpers ─────────────────────────────────────────────

  function _rotateMesh(dir) {
    try { Renderer.rotatePlayerMesh(dir); } catch(_) {}
  }

  // ── Public API ───────────────────────────────────────────────

  return {
    init, destroy, setScheme, getScheme,
    getPosition:   () => ({ ...position }),
    getFacing:     () => ({ ...facing }),
    getStepCount:  () => stepCount,
    getPortalUses: () => portalUses,
  };
})();
