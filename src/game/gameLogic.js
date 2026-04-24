// ============================================================
// gameLogic.js — Level lifecycle and puzzle state machine
//
// Responsibilities:
//   - Load / unload levels (grid copy, Physics init, Renderer build)
//   - Track mutable puzzle state: doors, buttons, receiver→door links
//   - Subscribe to EventBus events and route them to the right handler
//   - Trigger win / fail conditions
//   - Delegate to: Physics, Renderer, Player, PortalGun, LaserSystem,
//                  Particles, AudioEngine, Minimap, AMICA, DialoguePanel,
//                  DialogueScript
// ============================================================

const GameLogic = (() => {

  let currentLevel    = null;  // Full level data object (read-only reference)
  let currentLevelIdx = 0;     // Index into LEVELS[] (-1 for custom)
  let currentGrid     = null;  // Deep-copied mutable grid (shared with Physics)

  // Puzzle state maps — keyed by `"x_z_layerIdx"` strings
  let doorStates       = {};  // → boolean (true = open)
  let buttonStates     = {};  // → Set of presser strings ('player' | 'cube_X_Z')
  let buttonHoldTimers = {};  // → setTimeout handle (auto-close after holdTime)
  let receiverDoors    = {};  // receiverId → Array<{x,z,layer?}>

  // Tracks player position across steps for button-release detection
  let _lastPlayerPos   = null;
  let _lastPlayerLayer = 0;

  // EventBus handler references stored for clean removal on unload
  let _handlers = {};

  // ── Level Lifecycle ───────────────────────────────────────

  /**
   * Load a level: copy grid, init subsystems, place player, show intro.
   * Supports both single-layer ({grid}) and multi-layer ({layers:[{y,grid}]}) formats.
   * @param {number} levelIdx  — index into LEVELS[], -1 for custom
   * @param {Object} levelData — entry from LEVELS[] or a custom JSON object
   */
  function loadLevel(levelIdx, levelData) {
    currentLevel = levelData;

    // Multi-layer levels carry no top-level grid — synthesize from layer 0
    // so legacy single-grid code (Particles, legacy Minimap) keeps working
    if (!levelData.grid && levelData.layers?.length) {
      levelData = { ...levelData, grid: levelData.layers[0].grid };
    }
    currentGrid = levelData.grid.map(row => [...row]);

    // Initialise subsystems in dependency order
    Physics.init(levelData);           // multi-layer aware
    Renderer.buildLevel(levelData);    // full levelData incl. layers[]
    // In AR: re-centre the board pivot so rotation uses the level's geometric centre.
    if (typeof ARManager !== 'undefined' && ARManager.isActive?.()) {
      ARManager.centreBoard();
    }
    Particles.clearAll();
    PortalGun.reset();

    // Reset puzzle state
    doorStates   = {};
    buttonStates = {};
    Object.values(buttonHoldTimers).forEach(t => clearTimeout(t));
    buttonHoldTimers = {};
    receiverDoors    = {};

    // Register door positions from level link definitions
    if (levelData.links) {
      levelData.links.forEach(link => {
        if (link.button) {
          doorStates[_bkey(link.door.x, link.door.z, link.door.layer ?? 0)] = false;
        }
        if (link.receiver) {
          if (!receiverDoors[link.receiver]) receiverDoors[link.receiver] = [];
          receiverDoors[link.receiver].push(link.door);
          doorStates[_bkey(link.door.x, link.door.z, link.door.layer ?? 0)] = false;
        }
      });
    }

    // Spawn ambient hazard particles (single-layer grid only — procedural pass)
    for (let z = 0; z < levelData.height; z++) {
      for (let x = 0; x < levelData.width; x++) {
        if (currentGrid[z][x] === CONSTANTS.TILE.HAZARD) {
          Particles.startHazardEmbers(x, z);
        }
      }
    }

    // Laser and minimap setup
    LaserSystem.loadLevel(levelData);
    _validateLevelLinks(levelData);
    LaserSystem.update();
    Minimap.setLaserSegments(LaserSystem.getSegments());
    Minimap.loadLevel({ ...levelData, grid: currentGrid });

    // Dialogue system for this level (skip for custom: -1)
    if (levelIdx !== -1) DialogueScript.loadLevel(levelIdx);

    // Place player at start position (layer-aware)
    const start = findPlayerStart(currentGrid);
    Player.init(start.x, start.z);
    Renderer.setActiveLayer(0);
    Minimap.setPlayerPosition(start.x, start.z);

    // Update HUD labels
    document.getElementById('level-num').textContent =
      String(levelData.id).padStart(2, '0');
    document.getElementById('hud-title').textContent = I18n.getLocalized(levelData.name);

    // AMICA subtitle — use localised first intro line if available
    const i18nScript = (levelIdx !== -1) ? I18n.getLevelScripts(levelIdx) : undefined;
    const amicaText  = i18nScript?.intro?.lines?.[0] || I18n.getLocalized(levelData.amica);
    if (amicaText) AMICA.say(amicaText, 400);
    if (I18n.getLocalized(levelData.hint)) setTimeout(() => UIManager.showHint(I18n.getLocalized(levelData.hint), 3500), 6000);

    AudioEngine.resume();
    AudioEngine.ambientDrone();

    _subscribeEvents();
  }

  /**
   * Unload: remove event listeners, stop subsystems.
   * Always call before loading the next level or returning to menu.
   */
  function unloadLevel() {
    _unsubscribeEvents();
    Player.destroy();
    Particles.clearAll();
    LaserSystem.unload();
    DialogueScript.unload();
    AMICA.clear();
    DialoguePanel.clear();
  }

  // ── EventBus Subscriptions ────────────────────────────────

  function _subscribeEvents() {
    _handlers.landed = ({ x, z, layer: li }) => _onPlayerLanded(x, z, li ?? 0);

    // When player leaves a button tile, remove their weight from it
    _handlers.leftTile = ({ x, z, layer: li }) => {
      if (Physics.getTile(x, z, li ?? 0) === CONSTANTS.TILE.BUTTON) {
        _releaseButton(x, z, li ?? 0, 'player');
      }
    };

    _handlers.cube    = d => _onCubeMoved(d.fromX, d.fromZ, d.toX, d.toZ, d.layer ?? 0, d.origTile);
    _handlers.movable = d => _onMovableMoved(d.fromX, d.fromZ, d.toX, d.toZ, d.layer ?? 0, d.origTile);

    _handlers.escape = () => EventBus.emit('game:pause');

    _handlers.step = ({ x, z, layer: stepLayer }) => {
      // Release player weight from the previous button cell when they step away
      if (_lastPlayerPos) {
        const prevTile = Physics.getTile(_lastPlayerPos.x, _lastPlayerPos.z, _lastPlayerLayer);
        if (prevTile === CONSTANTS.TILE.BUTTON &&
            (x !== _lastPlayerPos.x || z !== _lastPlayerPos.z)) {
          _releaseButton(_lastPlayerPos.x, _lastPlayerPos.z, _lastPlayerLayer, 'player');
        }
      }
      _lastPlayerPos   = { x, z };
      _lastPlayerLayer = stepLayer ?? 0;
      AudioEngine.step();
      DialogueScript.onStep(Player.getStepCount());
    };

    _handlers.bump = () => AudioEngine.bump();

    _handlers.portalSound  = ({ which }) => (which === 'A' ? AudioEngine.portalA() : AudioEngine.portalB());
    _handlers.portalMiss   = ()          => AudioEngine.portalMiss();

    _handlers.portalUsed = ({ exitX, exitZ }) => {
      AudioEngine.teleport();
      // Particles.teleportBurst(exitX, exitZ);
      AMICA.sayLine('teleport', 200);
    };

    _handlers.portalPlaced = ({ which, cell }) => {
      Particles.portalBurst(cell.x, cell.z, which);
      Particles.startPortalSwirl(cell.x, cell.z, which);
      Minimap.setPortal(which, cell);
      LaserSystem.update();
      Minimap.setLaserSegments(LaserSystem.getSegments());
    };

    _handlers.laserChanged = ({ id, active }) => {
      if (active) {
        _onReceiverActivated(id);
        AMICA.sayLine('laser_received', 200);
      } else {
        // Laser lost — close any receiver-linked doors that have holdTime > 0
        receiverDoors[id]?.forEach(d => {
          const dk = _bkey(d.x, d.z, d.layer ?? 0);
          if (doorStates[dk]) _closeDoor(d.x, d.z, d.layer ?? 0);
        });
      }
    };

    // Sync Renderer active layer and Minimap when player crosses a stair/hole
    _handlers.layerChanged = ({ toLayer }) => {
      Renderer.setActiveLayer(toLayer);
      const layers = currentLevel.layers;
      if (layers?.[toLayer]) {
        Minimap.loadLevel({ ...currentLevel, grid: layers[toLayer].grid });
      }
    };

    EventBus.on('player:landed',          _handlers.landed);
    EventBus.on('player:left-tile',       _handlers.leftTile);
    EventBus.on('cube:moved',             _handlers.cube);
    EventBus.on('movable:moved',          _handlers.movable);
    EventBus.on('ui:escape',              _handlers.escape);
    EventBus.on('player:step',            _handlers.step);
    EventBus.on('player:bumped',          _handlers.bump);
    EventBus.on('portal:placed',          _handlers.portalSound);
    EventBus.on('portal:miss',            _handlers.portalMiss);
    EventBus.on('portal:used',            _handlers.portalUsed);
    EventBus.on('portal:placed',          _handlers.portalPlaced);
    EventBus.on('laser:receiver-changed', _handlers.laserChanged);
    EventBus.on('player:layer-changed',   _handlers.layerChanged);
  }

  function _unsubscribeEvents() {
    EventBus.off('player:landed',          _handlers.landed);
    EventBus.off('player:left-tile',       _handlers.leftTile);
    EventBus.off('cube:moved',             _handlers.cube);
    EventBus.off('movable:moved',          _handlers.movable);
    EventBus.off('ui:escape',              _handlers.escape);
    EventBus.off('player:step',            _handlers.step);
    EventBus.off('player:bumped',          _handlers.bump);
    EventBus.off('portal:placed',          _handlers.portalSound);
    EventBus.off('portal:miss',            _handlers.portalMiss);
    EventBus.off('portal:used',            _handlers.portalUsed);
    EventBus.off('portal:placed',          _handlers.portalPlaced);
    EventBus.off('laser:receiver-changed', _handlers.laserChanged);
    EventBus.off('player:layer-changed',   _handlers.layerChanged);
  }

  // ── Player Landing ────────────────────────────────────────

  function _onPlayerLanded(x, z, layerIdx = 0) {
    const tile = Physics.getTile(x, z, layerIdx);

    Minimap.setPlayerPosition(x, z);
    LaserSystem.update();
    Minimap.setLaserSegments(LaserSystem.getSegments());

    switch (tile) {
      case CONSTANTS.TILE.EXIT:
        _triggerWin();
        break;

      case CONSTANTS.TILE.HAZARD: {
        AudioEngine.fail();
        AMICA.sayLine('fail_hazard', 300);
        const failMsg = I18n.getLang() === 'it'
          ? 'Esposizione a zona pericolosa rilevata. Test terminato.'
          : 'Hazard exposure detected. Test terminated.';
        setTimeout(() => _triggerFail(failMsg), 800);
        break;
      }

      case CONSTANTS.TILE.BUTTON:
        _pressButton(x, z, layerIdx, 'player');
        break;

      // STAIR_UP / STAIR_DOWN / FLOOR_HOLE transitions handled in player.js
    }
  }

  // ── Button / Door Logic ───────────────────────────────────

  /** Composite key scoped per layer — avoids collisions across floors. */
  function _bkey(x, z, li) { return `${x}_${z}_${li ?? 0}`; }

  /**
   * Add a weight source to a button.
   * The button activates and opens linked doors only on the first presser.
   * @param {string} presser — 'player' | 'cube_X_Z'
   */
  function _pressButton(bx, bz, li = 0, presser = 'player') {
    const bk = _bkey(bx, bz, li);
    if (!buttonStates[bk]) buttonStates[bk] = new Set();
    const wasActive = buttonStates[bk].size > 0;
    buttonStates[bk].add(presser);

    if (!wasActive) {
      AudioEngine.buttonPress();
      // Particles.buttonFlash(bx, bz);
      AMICA.sayLine('button_pressed', 300);
      Renderer.pressButton?.(bx, bz, li);

      currentLevel.links?.forEach(link => {
        if (!link.button) return;
        if (link.button.x !== bx || link.button.z !== bz) return;
        if ((link.button.layer ?? 0) !== li) return;
        const dli = link.door.layer ?? li;
        const dk  = _bkey(link.door.x, link.door.z, dli);
        // Cancel any pending auto-close timer when button is re-pressed
        if (buttonHoldTimers[dk]) { clearTimeout(buttonHoldTimers[dk]); delete buttonHoldTimers[dk]; }
        _openDoor(link.door.x, link.door.z, dli);
      });
    }
  }

  /**
   * Remove a weight source from a button.
   * When all pressers leave, plays release animation and schedules auto-close
   * for doors with link.holdTime > 0.
   */
  function _releaseButton(bx, bz, li = 0, presser = 'player') {
    const bk = _bkey(bx, bz, li);
    if (!buttonStates[bk]) return;
    buttonStates[bk].delete(presser);

    if (buttonStates[bk].size === 0) {
      Renderer.releaseButton?.(bx, bz, li);
      AudioEngine.buttonRelease?.();

      currentLevel.links?.forEach(link => {
        if (!link.button) return;
        if (link.button.x !== bx || link.button.z !== bz) return;
        if ((link.button.layer ?? 0) !== li) return;
        const holdTime = link.holdTime ?? 0;
        if (holdTime <= 0) return;  // Permanent — door stays open
        const dli = link.door.layer ?? li;
        const dk  = _bkey(link.door.x, link.door.z, dli);
        if (buttonHoldTimers[dk]) clearTimeout(buttonHoldTimers[dk]);
        buttonHoldTimers[dk] = setTimeout(() => {
          delete buttonHoldTimers[dk];
          _closeDoor(link.door.x, link.door.z, dli);
        }, holdTime * 1000);
      });
    }
  }

  /** Open a door: update physics grid, animate mesh, notify subsystems. */
  function _openDoor(dx, dz, li = 0) {
    const dk = _bkey(dx, dz, li);
    if (doorStates[dk]) return;
    doorStates[dk] = true;
    Physics.setTile(dx, dz, CONSTANTS.TILE.FLOOR, li);
    Renderer.setDoorState(dx, dz, true, li);
    AudioEngine.doorOpenClose();
    UIManager.showHint(I18n.t('hud_access'), 2000);
    AMICA.sayLine('door_open', 600);
    Minimap.updateGrid();
    EventBus.emit('door:opened');
  }

  /** Close a door: reverses _openDoor — used by holdTime auto-close and laser-lost. */
  function _closeDoor(dx, dz, li = 0) {
    const dk = _bkey(dx, dz, li);
    if (!doorStates[dk]) return;
    doorStates[dk] = false;
    Physics.setTile(dx, dz, CONSTANTS.TILE.DOOR, li);
    Renderer.setDoorState(dx, dz, false, li);
    AudioEngine.doorOpenClose?.();
    const layerGrid = currentLevel.layers ? currentLevel.layers[li]?.grid : currentGrid;
    Minimap.updateGrid(li);
    EventBus.emit('door:closed');
  }

  /**
   * Called when a laser receiver changes to active.
   * Opens all doors registered as receiver-linked in this level.
   */
  function _onReceiverActivated(receiverId) {
    receiverDoors[receiverId]?.forEach(d => _openDoor(d.x, d.z, d.layer ?? 0));
  }

  // ── Cube Movement ─────────────────────────────────────────

  /**
   * Handle cube arriving at (toX, toZ).
   * Manages button weight for the tiles it leaves and lands on.
   * Re-evaluates lasers and minimap.
   * @param {number} origTile — tile at toX/toZ before the cube moved (from event payload)
   */
  function _onCubeMoved(fromX, fromZ, toX, toZ, layer = 0, origTile) {
    AudioEngine.cubeMovablePush();

    // Cube leaving a button — remove its weight
    if (buttonStates[_bkey(fromX, fromZ, layer)]?.size > 0) {
      _releaseButton(fromX, fromZ, layer, `cube_${fromX}_${fromZ}`);
    }

    // Cube arriving on a button — add its weight
    const arrivedOn = origTile ?? Physics.getTile(toX, toZ, layer);
    if (arrivedOn === CONSTANTS.TILE.BUTTON) {
      AMICA.sayLine('cube_on_button', 800);
      _pressButton(toX, toZ, layer, `cube_${toX}_${toZ}`);
      EventBus.emit('cube:onbutton');
    }

    LaserSystem.update();
    Minimap.setLaserSegments(LaserSystem.getSegments());
    Minimap.updateGrid();
  }

  // ── Movable Movement ─────────────────────────────────────────

  /**
   * Handle movable arriving at (toX, toZ).
   * Manages button weight for the tiles it leaves and lands on.
   * Re-evaluates lasers and minimap.
   * @param {number} origTile — tile at toX/toZ before the movable moved (from event payload)
   */
  function _onMovableMoved(fromX, fromZ, toX, toZ, layer = 0, origTile) {
    AudioEngine.cubeMovablePush();

    // Movable leaving a button — remove its weight
    if (buttonStates[_bkey(fromX, fromZ, layer)]?.size > 0) {
      _releaseButton(fromX, fromZ, layer, `movable_${fromX}_${fromZ}`);
    }

    // Cube arriving on a button — add its weight
    const arrivedOn = origTile ?? Physics.getTile(toX, toZ, layer);
    if (arrivedOn === CONSTANTS.TILE.BUTTON) {
      AMICA.sayLine('movable_on_button', 800);
      _pressButton(toX, toZ, layer, `cube_${toX}_${toZ}`);
      EventBus.emit('movable:onbutton');
    }

    // Movable may not block or unblock a laser path
    LaserSystem.update();
    Minimap.updateGrid();
  }

  // ── Level link validation (dev aid) ──────────────────────

  /**
   * Logs console warnings if any link coordinates don't match expected tile types.
   * No-op in production — purely diagnostic.
   */
  function _validateLevelLinks(ld) {
    if (!ld.links) return;
    const T      = CONSTANTS.TILE;
    const layers = ld.layers ? ld.layers.map(l => l.grid) : [ld.grid];
    const getTileV = (x, z, li = 0) => layers[li]?.[z]?.[x] ?? -1;

    ld.links.forEach((link, i) => {
      if (link.button) {
        const li = link.button.layer ?? 0;
        const t  = getTileV(link.button.x, link.button.z, li);
        if (t !== T.BUTTON)
          console.warn(`[Level] link[${i}] button@(${link.button.x},${link.button.z},L${li}) is tile ${t}, expected BUTTON`);
      }
      if (link.door) {
        const li = link.door.layer ?? 0;
        const t  = getTileV(link.door.x, link.door.z, li);
        if (t !== T.DOOR)
          console.warn(`[Level] link[${i}] door@(${link.door.x},${link.door.z},L${li}) is tile ${t}, expected DOOR`);
      }
      if (link.receiver) {
        const [rx, rz] = link.receiver.split('_').map(Number);
        if (!layers.some(g => g?.[rz]?.[rx] === T.RECEIVER))
          console.warn(`[Level] link[${i}] receiver '${link.receiver}' — no RECEIVER tile found in any layer`);
      }
    });

    ld.lasers?.forEach((laser, i) => {
      const li = laser.emitter?.layer ?? 0;
      const t  = getTileV(laser.emitter.x, laser.emitter.z, li);
      if (t !== T.EMITTER)
        console.warn(`[Level] laser[${i}] emitter@(${laser.emitter.x},${laser.emitter.z},L${li}) is tile ${t}, expected EMITTER`);
      const [rx, rz] = laser.receiverId.split('_').map(Number);
      if (!layers.some(g => g?.[rz]?.[rx] === T.RECEIVER))
        console.warn(`[Level] laser[${i}] receiverId '${laser.receiverId}' — no RECEIVER tile in any layer`);
    });
  }

  // ── Win / Fail ────────────────────────────────────────────

  function _triggerWin() {
    Player.destroy();
    AudioEngine.win();
    const isLast = (currentLevelIdx !== -1) && (currentLevelIdx === LEVELS.length - 1);
    const winText = I18n.getLevelWinScripts(currentLevelIdx);
    if (winText) {
      winText.forEach(l => AMICA.say(l, 200));
    } else {
      AMICA.sayLine(isLast ? 'all_done' : 'win_generic', 200);
    }
    setTimeout(() => {
      UIManager.showWin({
        steps:   Player.getStepCount(),
        portals: Player.getPortalUses(),
        isLast,
      });
    }, 700);
  }

  function _triggerFail(message) {
    Player.destroy();
    UIManager.showFail(message);
  }

  // ── Public API ────────────────────────────────────────────
  function getCurrentLevelIdx() {
    return currentLevelIdx;
  }

  /** Start a built-in level by its index in LEVELS[]. */
  function startFromLevel(index) {
    currentLevelIdx = index;
    loadLevel(index, LEVELS[index]);
  }

  /** Restart the current level (resets all state). */
  function retryLevel() {
    unloadLevel();
    startFromLevel(currentLevelIdx);
  }

  /** Advance to the next built-in level, or fire game:all-done. */
  function nextLevel() {
    unloadLevel();
    const next = currentLevelIdx + 1;
    if (next < LEVELS.length) 
      startFromLevel(next);
    else                       
      EventBus.emit('game:all-done');
  }

  /** Load an arbitrary level object, e.g. from the editor. */
  function loadCustomLevel(levelData) {
    unloadLevel();
    currentLevelIdx = -1;
    LEVELS[currentLevelIdx] = levelData;
    loadLevel(-1, levelData);
  }

  return { getCurrentLevelIdx, startFromLevel, retryLevel, nextLevel, loadCustomLevel, unloadLevel, isRunning: () => !!currentLevel };
})();
