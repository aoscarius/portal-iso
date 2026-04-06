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

  // ── State ─────────────────────────────────────────────────
  let position     = { x: 0, z: 0 };
  let currentLayer = 0;
  let facing       = CONSTANTS.DIRS.DOWN;
  let isMoving     = false;
  let stepCount    = 0;
  let portalUses   = 0;

  let _scheme   = 'classic';  // 'classic' | 'tank'
  let _platform = 'desktop';  // 'desktop' | 'touch' | 'ar'

  // Path-following queue (click-to-move)
  let _pathQueue = [];
  let _pathTimer = null;

  // ── Rotation table ────────────────────────────────────────
  const TURN_ORDER = [
    CONSTANTS.DIRS.UP, CONSTANTS.DIRS.RIGHT,
    CONSTANTS.DIRS.DOWN, CONSTANTS.DIRS.LEFT,
  ];
  const CLASSIC_MAP = {
    KeyW: CONSTANTS.DIRS.DOWN,  ArrowUp:    CONSTANTS.DIRS.DOWN,
    KeyS: CONSTANTS.DIRS.UP,    ArrowDown:  CONSTANTS.DIRS.UP,
    KeyA: CONSTANTS.DIRS.LEFT,  ArrowLeft:  CONSTANTS.DIRS.LEFT,
    KeyD: CONSTANTS.DIRS.RIGHT, ArrowRight: CONSTANTS.DIRS.RIGHT,
  };
  const AIM_MAP = {
    KeyZ: CONSTANTS.DIRS.UP,   KeyX: CONSTANTS.DIRS.DOWN,
    KeyC: CONSTANTS.DIRS.LEFT, KeyV: CONSTANTS.DIRS.RIGHT,
  };

  // ── Listeners ─────────────────────────────────────────────
  let _keyHandler   = null;
  let _mouseHandler = null;
  let _arHandlers   = [];
  let _hoverMesh    = null;

  // ── Lifecycle ─────────────────────────────────────────────

  function init(startX, startZ, startLayer = 0) {
    position     = { x: startX, z: startZ };
    currentLayer = startLayer;
    facing       = CONSTANTS.DIRS.RIGHT;
    isMoving     = false;
    stepCount    = 0;
    portalUses   = 0;
    _cancelPath();
    _detectPlatform();
    Renderer.setPlayerMesh(startX, startZ, startLayer);
    _rotateMesh(facing);
    _startListeners();
  }

  function destroy() { _cancelPath(); _stopListeners(); }

  function setScheme(s) { if (s === 'classic' || s === 'tank') _scheme = s; }
  function getScheme()  { return _scheme; }
  function getLayer()   { return currentLayer; }

  // ── Platform detection ─────────────────────────────────────

  function _detectPlatform() {
    const ua      = navigator.userAgent || '';
    const isQuest  = /OculusBrowser|MetaQuest/i.test(ua);
    const isMobile = /Android|iPhone|iPad/i.test(ua) || (navigator.maxTouchPoints > 1);
    if      (ARManager?.isActive?.()) _platform = 'ar';
    else if (isQuest)                 _platform = 'ar';
    else if (isMobile)                _platform = 'touch';
    else                              _platform = 'desktop';
  }

  // ── Listeners ─────────────────────────────────────────────

  function _startListeners() {
    _keyHandler = e => { if (e.type === 'keydown') _onKey(e.code); };
    window.addEventListener('keydown', _keyHandler);

    _mouseHandler = e => {
      if (e.button !== 0 && e.button !== 2) return;
      _handleMouseClick(e, e.button === 0 ? 'A' : 'B');
    };
    const canvas = document.getElementById('game-canvas');
    canvas?.addEventListener('mousedown', _mouseHandler);
    canvas?.addEventListener('contextmenu', e => e.preventDefault());

    const arCellHandler    = ({ x, z, action }) => {
      if (action === 'move') { _cancelPath(); _moveToCell(x, z); }
    };
    const arActionHandler  = ({ action }) => {
      switch (action) {
        case 'portal-a': PortalGun.shoot('A', position, facing, currentLayer); break;
        case 'portal-b': PortalGun.shoot('B', position, facing, currentLayer); break;
        case 'up':    _step(CONSTANTS.DIRS.UP);    break;
        case 'down':  _step(CONSTANTS.DIRS.DOWN);  break;
        case 'left':  _step(CONSTANTS.DIRS.LEFT);  break;
        case 'right': _step(CONSTANTS.DIRS.RIGHT); break;
      }
    };
    const arHoverHandler   = ({ mesh }) => _onARHover(mesh);

    EventBus.on('ar:cell-picked',       arCellHandler);
    EventBus.on('ar:controller-action', arActionHandler);
    EventBus.on('ar:pointer-hover',     arHoverHandler);
    _arHandlers = [
      ['ar:cell-picked',       arCellHandler],
      ['ar:controller-action', arActionHandler],
      ['ar:pointer-hover',     arHoverHandler],
    ];

    _setupTouchDpad();

    EventBus.on('ar:entered', () => { _platform = 'ar'; _setupARHighlight(); });
    EventBus.on('ar:exited',  () => { _detectPlatform(); _clearARHighlight(); });
  }

  function _stopListeners() {
    if (_keyHandler)   window.removeEventListener('keydown', _keyHandler);
    if (_mouseHandler) document.getElementById('game-canvas')?.removeEventListener('mousedown', _mouseHandler);
    _arHandlers.forEach(([ev, fn]) => EventBus.off(ev, fn));
    _arHandlers   = [];
    _keyHandler   = _mouseHandler = null;
  }

  // ── Touch D-pad ───────────────────────────────────────────

  function _setupTouchDpad() {
    const map = {
      'dpad-up':       () => _step(CONSTANTS.DIRS.DOWN),
      'dpad-down':     () => _step(CONSTANTS.DIRS.UP),
      'dpad-left':     () => _step(CONSTANTS.DIRS.LEFT),
      'dpad-right':    () => _step(CONSTANTS.DIRS.RIGHT),
      'dpad-portal-a': () => PortalGun.shoot('A', position, facing, currentLayer),
      'dpad-portal-b': () => PortalGun.shoot('B', position, facing, currentLayer),
    };
    Object.entries(map).forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', e => { e.preventDefault(); fn(); }, { passive: false });
      el.addEventListener('mousedown',  e => { e.preventDefault(); fn(); });
    });
  }

  // ── AR tile highlight ─────────────────────────────────────

  function _setupARHighlight() {
    const scene = Renderer.getScene();
    if (!scene) return;
    scene.meshes.forEach(m => { m.isPickable = true; });
  }

  function _clearARHighlight() {
    if (_hoverMesh) {
      EventBus.emit('ar:unhover', { mesh: _hoverMesh });
      _hoverMesh = null;
    }
  }

  function _onARHover(mesh) {
    if (_hoverMesh && _hoverMesh !== mesh) EventBus.emit('ar:unhover', { mesh: _hoverMesh });
    _hoverMesh = mesh;
    EventBus.emit('ar:hover', { mesh });
  }

  // ── BFS path following ────────────────────────────────────

  /**
   * Walk a BFS path from current position to (tx, tz) within currentLayer.
   */
  function _moveToCell(tx, tz) {
    const path = Physics.findPath(position, { x: tx, z: tz }, currentLayer);
    if (!path.length) return;
    _cancelPath();
    _pathQueue = path;
    _drivePathStep();
  }

  function _drivePathStep() {
    if (!_pathQueue.length) return;
    if (isMoving) { _pathTimer = setTimeout(_drivePathStep, 40); return; }
    const next = _pathQueue.shift();
    const dx = next.x - position.x, dz = next.z - position.z;
    if (Math.abs(dx) + Math.abs(dz) !== 1) { _cancelPath(); return; }
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

  // ── Keyboard ──────────────────────────────────────────────

  function _onKey(code) {
    switch (code) {
      case 'KeyQ':   PortalGun.shoot('A', position, facing, currentLayer); return;
      case 'KeyR':   PortalGun.shoot('B', position, facing, currentLayer); return;
      case 'Escape': EventBus.emit('ui:escape'); return;
    }
    _cancelPath();
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
    switch (code) {
      case 'KeyW': case 'ArrowUp':    _step(facing); break;
      case 'KeyS': case 'ArrowDown':  _step({ dx: -facing.dx, dz: -facing.dz }); break;
      case 'KeyA': case 'ArrowLeft':  _turn(-1); break;
      case 'KeyD': case 'ArrowRight': _turn(+1); break;
    }
  }

  function _turn(delta) {
    if (isMoving) return;
    const idx = TURN_ORDER.findIndex(d => d.dx === facing.dx && d.dz === facing.dz);
    facing = TURN_ORDER[(idx + delta + 4) % 4];
    _rotateMesh(facing);
    EventBus.emit('player:turned', { facing });
  }

  // ── Core movement ─────────────────────────────────────────

  function _step(dir) {
    if (isMoving) return;
    facing = dir;
    _rotateMesh(dir);
    const nx = position.x + dir.dx;
    const nz = position.z + dir.dz;

    // Portal teleport check (layer-aware — portal walls are solid so must run first)
    const tp = PortalGun.checkTeleport(position, nx, nz, dir, currentLayer);
    if (tp) { _doTeleport(tp); return; }

    const result = Physics.canMoveTo(position.x, position.z, nx, nz, currentLayer);
    if (!result.ok) { EventBus.emit('player:bumped', { x: nx, z: nz }); return; }

    // Push cube
    if (result.pushCube) {
      const { fromX, fromZ, toX, toZ } = result.pushCube;
      const origTile = Physics.getTile(toX, toZ, currentLayer);
      Physics.setTile(fromX, fromZ, CONSTANTS.TILE.FLOOR, currentLayer);
      Renderer.moveCubeMesh(fromX, fromZ, toX, toZ, currentLayer);
      EventBus.emit('cube:moved', { fromX, fromZ, toX, toZ, layer: currentLayer, origTile });
      Physics.setTile(toX, toZ, CONSTANTS.TILE.CUBE, currentLayer);
    }

    // Push movable
    if (result.pushMovable) {
      const { fromX, fromZ, toX, toZ } = result.pushMovable;
      const origTile = Physics.getTile(toX, toZ, currentLayer);
      Physics.setTile(fromX, fromZ, CONSTANTS.TILE.FLOOR, currentLayer);
      Physics.setTile(toX, toZ, CONSTANTS.TILE.MOVABLE, currentLayer);
      Renderer.moveMovableMesh(fromX, fromZ, toX, toZ, currentLayer);
      EventBus.emit('movable:moved', { fromX, fromZ, toX, toZ, layer: currentLayer, origTile });
    }

    _commit(nx, nz);
  }

  function _commit(nx, nz) {
    isMoving = true;
    position = { x: nx, z: nz };
    stepCount++;
    const el = document.getElementById('step-count');
    if (el) el.textContent = stepCount;
    EventBus.emit('player:step', { x: nx, z: nz, layer: currentLayer });

    Renderer.animatePlayerTo(nx, nz, currentLayer, () => {
      isMoving = false;
      // Check for stair/hole transition after landing
      const transition = Physics.getLayerTransition(nx, nz, currentLayer);
      if (transition) {
        _doLayerTransition(transition);
      } else {
        EventBus.emit('player:landed', { x: nx, z: nz, layer: currentLayer });
      }
    });
  }

  /**
   * Animate the player vertically between layers after stepping on a stair/hole.
   * Fires player:layer-changed then player:landed on arrival.
   */
  function _doLayerTransition(dest) {
    const prevLayer = currentLayer;
    currentLayer    = dest.layerIdx;
    position        = { x: dest.x, z: dest.z };

    Renderer.animatePlayerLayerChange(dest.x, dest.z, prevLayer, dest.layerIdx, () => {
      isMoving = false;
      EventBus.emit('player:layer-changed', {
        x: dest.x, z: dest.z,
        fromLayer: prevLayer, toLayer: dest.layerIdx,
      });
      EventBus.emit('player:landed', { x: dest.x, z: dest.z, layer: currentLayer });
    });
  }

  /**
   * Teleport the player to the portal exit.
   * Cross-layer portals use the layer-change animation; same-layer portals use the hop.
   */
  function _doTeleport({ exitX, exitZ, exitDir, exitLayer = currentLayer }) {
    isMoving     = true;
    portalUses++;
    const prevLayer = currentLayer;
    position        = { x: exitX, z: exitZ };
    currentLayer    = exitLayer;
    facing          = exitDir;
    stepCount++;
    _rotateMesh(exitDir);
    EventBus.emit('portal:used', { exitX, exitZ });
    EventBus.emit('ui:portal-flash');

    const onArrived = () => {
      isMoving = false;
      if (exitLayer !== prevLayer) {
        EventBus.emit('player:layer-changed', {
          x: exitX, z: exitZ,
          fromLayer: prevLayer, toLayer: exitLayer,
        });
      }
      EventBus.emit('player:landed', { x: exitX, z: exitZ, layer: currentLayer });
    };

    if (exitLayer !== prevLayer) {
      Renderer.animatePlayerLayerChange(exitX, exitZ, prevLayer, exitLayer, onArrived);
    } else {
      Renderer.animatePlayerTo(exitX, exitZ, exitLayer, onArrived);
    }
  }

  // ── Mouse click handler ───────────────────────────────────
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

      const meta   = pick.pickedMesh.metadata;
      const gx     = meta?.gridX    ?? Math.round(pick.pickedPoint.x / CONSTANTS.TILE_SIZE);
      const gz     = meta?.gridZ    ?? Math.round(pick.pickedPoint.z / CONSTANTS.TILE_SIZE);
      const layer  = meta?.layerIdx ?? currentLayer;
      const tileId = meta?.tileId   ?? Physics.getTile(gx, gz, layer);

      if (tileId === CONSTANTS.TILE.PORTAL_WALL) {
        const ddx = Math.sign(gx - position.x), ddz = Math.sign(gz - position.z);
        const dir = Math.abs(gx - position.x) >= Math.abs(gz - position.z)
          ? { dx: ddx || 1, dz: 0 } : { dx: 0, dz: ddz || 1 };
        PortalGun.shoot(which, position, dir, currentLayer);
        return;
      }

      if (e.button === 2) {
        const ddx = Math.sign(gx - position.x), ddz = Math.sign(gz - position.z);
        const dir = Math.abs(gx - position.x) >= Math.abs(gz - position.z)
          ? { dx: ddx || 1, dz: 0 } : { dx: 0, dz: ddz || 1 };
        PortalGun.shoot('B', position, dir, currentLayer);
        return;
      }

      // Left-click walkable tile on same layer → pathfind
      if (layer === currentLayer && !Physics.isSolidTile(tileId)) {
        _cancelPath();
        _moveToCell(gx, gz);
      }
    } catch (err) {
      console.warn('[Player] click handler:', err);
    }
  }

  // ── Mesh helpers ──────────────────────────────────────────

  function _rotateMesh(dir) { try { Renderer.rotatePlayerMesh(dir); } catch(_) {} }

  // ── Public API ────────────────────────────────────────────

  return {
    init, destroy, setScheme, getScheme, getLayer,
    getPosition:   () => ({ ...position }),
    getFacing:     () => ({ ...facing }),
    getStepCount:  () => stepCount,
    getPortalUses: () => portalUses,
  };
})();