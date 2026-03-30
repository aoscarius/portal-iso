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

  // Puzzle state maps (keyed by `"x_z"` strings)
  let doorStates    = {};  // `x_z` → boolean (true = open)
  let buttonStates  = {};  // `x_z` → boolean (true = pressed)
  let receiverDoors = {};  // receiverId → Array<{x,z}> doors it unlocks

  // EventBus handler references stored for clean removal on unload
  let _handlers = {};

  // ── Level Lifecycle ───────────────────────────────────────

  /**
   * Load a level: copy grid, init subsystems, place player, show intro.
   * @param {Object} levelData - Entry from LEVELS[] or a custom JSON object
   */
  function loadLevel(levelData) {
    currentLevel = levelData;

    // Deep-copy grid so mutations (doors opening, cubes moving) don't
    // corrupt the original level definition
    currentGrid = levelData.grid.map(row => [...row]);

    // Initialise subsystems in dependency order
    Physics.init(currentGrid, levelData.width, levelData.height);
    Renderer.buildLevel({ ...levelData, grid: currentGrid });
    Particles.clearAll();
    PortalGun.reset();

    // Reset puzzle state
    doorStates    = {};
    buttonStates  = {};
    receiverDoors = {};

    // Register door positions from level link definitions
    if (levelData.links) {
      levelData.links.forEach(link => {
        if (link.button) {
          doorStates[`${link.door.x}_${link.door.z}`] = false;
        }
        if (link.receiver) {
          if (!receiverDoors[link.receiver]) receiverDoors[link.receiver] = [];
          receiverDoors[link.receiver].push(link.door);
          doorStates[`${link.door.x}_${link.door.z}`] = false;
        }
      });
    }

    // Spawn ambient hazard particles
    for (let z = 0; z < levelData.height; z++) {
      for (let x = 0; x < levelData.width; x++) {
        if (currentGrid[z][x] === CONSTANTS.TILE.HAZARD) {
          Particles.startHazardEmbers(x, z);
        }
      }
    }

    // Laser and minimap setup
    LaserSystem.loadLevel(levelData);
    LaserSystem.update();
    Minimap.loadLevel({ ...levelData, grid: currentGrid });

    // Dialogue system for this level
    DialogueScript.loadLevel(levelData.id);

    // Place player at start position
    const start = findPlayerStart(currentGrid);
    Player.init(start.x, start.z);
    Minimap.setPlayerPosition(start.x, start.z);

    // Update HUD labels
    document.getElementById('level-num').textContent =
      String(levelData.id).padStart(2, '0');
    document.getElementById('hud-title').textContent = levelData.name;

    // AMICA subtitle — use localised first intro line if available
    const i18nScript = I18n.getScripts()[levelData.id];
    const amicaText = i18nScript?.intro?.lines?.[0] || levelData.amica;
    if (amicaText) AMICA.say(amicaText, 400);
    if (levelData.hint)   setTimeout(() => UIManager.showHint(levelData.hint, 3500), 6000);

    // Ambient startup sound
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
    _handlers.landed       = ({ x, z })        => _onPlayerLanded(x, z);
    _handlers.cube         = (d)                => _onCubeMoved(d.fromX, d.fromZ, d.toX, d.toZ);
    _handlers.movable      = (d)                => _onMovableMoved(d.fromX, d.fromZ, d.toX, d.toZ);
    _handlers.escape       = ()                 => EventBus.emit('game:pause');
    _handlers.step         = ()                 => {
      AudioEngine.step();
      DialogueScript.onStep(Player.getStepCount());
    };
    _handlers.bump         = ()                 => AudioEngine.bump();
    _handlers.portalSound  = ({ which })        => (which === 'A' ? AudioEngine.portalA() : AudioEngine.portalB());
    _handlers.portalMiss   = ()                 => AudioEngine.portalMiss();
    _handlers.portalUsed   = ({ exitX, exitZ }) => {
      AudioEngine.teleport();
      Particles.teleportBurst(exitX, exitZ);
      AMICA.sayLine('teleport', 200);
    };
    _handlers.portalPlaced = ({ which, cell })  => {
      Particles.portalBurst(cell.x, cell.z, which);
      Particles.startPortalSwirl(cell.x, cell.z, which);
      Minimap.setPortal(which, cell);
      LaserSystem.update(); // Portal may now redirect a laser beam
    };
    _handlers.laserChanged = ({ id, active })   => {
      if (active) {
        _onReceiverActivated(id);
        AMICA.sayLine('laser_received', 200);
      }
    };

    EventBus.on('player:landed',          _handlers.landed);
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
  }

  function _unsubscribeEvents() {
    EventBus.off('player:landed',          _handlers.landed);
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
  }

  // ── Player Landing ────────────────────────────────────────

  function _onPlayerLanded(x, z) {
    const tile = Physics.getTile(x, z);

    // Always update minimap and laser (player body can block beams)
    Minimap.setPlayerPosition(x, z);
    LaserSystem.update();

    switch (tile) {
      case CONSTANTS.TILE.EXIT:
        _triggerWin();
        break;

      case CONSTANTS.TILE.HAZARD:
        AudioEngine.fail();
        AMICA.sayLine('fail_hazard', 300);
        const failMsg = I18n.getLang() === 'it'
          ? 'Esposizione a zona pericolosa rilevata. Test terminato.'
          : 'Hazard exposure detected. Test terminated.';
        setTimeout(() => _triggerFail(failMsg), 800);
        break;

      case CONSTANTS.TILE.BUTTON:
        _pressButton(x, z);
        break;
    }
  }

  // ── Button / Door Logic ───────────────────────────────────

  /**
   * Activate a pressure plate at (bx, bz).
   * Opens all doors linked to this button via level.links[].
   */
  function _pressButton(bx, bz) {
    const bk = `${bx}_${bz}`;
    if (buttonStates[bk]) return; // Already pressed — idempotent

    buttonStates[bk] = true;
    AudioEngine.buttonPress();
    Particles.buttonFlash(bx, bz);
    AMICA.sayLine('button_pressed', 300);
    Renderer.pressButton?.(bx, bz);

    currentLevel.links?.forEach(link => {
      if (link.button && link.button.x === bx && link.button.z === bz) {
        _openDoor(link.door.x, link.door.z);
      }
    });
  }

  /**
   * Called when a laser receiver changes to active.
   * Opens all doors registered as receiver-linked in this level.
   */
  function _onReceiverActivated(receiverId) {
    receiverDoors[receiverId]?.forEach(d => _openDoor(d.x, d.z));
  }

  /**
   * Open a door: update physics grid, animate mesh, notify subsystems.
   */
  function _openDoor(dx, dz) {
    const dk = `${dx}_${dz}`;
    if (doorStates[dk]) return; // Already open

    doorStates[dk] = true;
    Physics.setTile(dx, dz, CONSTANTS.TILE.FLOOR); // Now walkable
    Renderer.setDoorState(dx, dz, true);
    AudioEngine.doorOpen();
    UIManager.showHint(I18n.t('hud_access'), 2000);
    AMICA.sayLine('door_open', 600);
    Minimap.updateGrid(currentGrid); // Refresh minimap door colour
  }

  // ── Cube Movement ─────────────────────────────────────────

  /**
   * Handle cube arriving at (toX, toZ).
   * Checks if it lands on a button; re-evaluates lasers.
   */
  function _onCubeMoved(fromX, fromZ, toX, toZ) {
    AudioEngine.cubeMovablePush();

    // Cube landing on a button activates it
    if (Physics.getTile(toX, toZ) === CONSTANTS.TILE.BUTTON) {
      buttonStates[`${toX}_${toZ}`] = false; // Allow re-trigger
      _pressButton(toX, toZ);
      AMICA.sayLine('cube_on_button', 800);
    }

    // Cube may now block or unblock a laser path
    LaserSystem.update();
    Minimap.updateGrid(currentGrid);
  }

  /**
   * Handle movable arriving at (toX, toZ).
   * Checks if it lands on a button; re-evaluates lasers.
   */
  function _onMovableMoved(fromX, fromZ, toX, toZ) {
    AudioEngine.cubeMovablePush();

    // Cube landing on a button activates it
    if (Physics.getTile(toX, toZ) === CONSTANTS.TILE.BUTTON) {
      buttonStates[`${toX}_${toZ}`] = false; // Allow re-trigger
      _pressButton(toX, toZ);
      AMICA.sayLine('movable_on_button', 800);
    }

    // Cube may now block or unblock a laser path
    LaserSystem.update();
    Minimap.updateGrid(currentGrid);
  }

  // ── Win / Fail ────────────────────────────────────────────

  function _triggerWin() {
    Player.destroy();
    AudioEngine.win();
    const isLast = (currentLevelIdx !== -1) && (currentLevelIdx === LEVELS.length - 1);
    AMICA.sayLine(isLast ? 'all_done' : 'win_generic', 200);
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
    loadLevel(LEVELS[index]);
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
    if (next < LEVELS.length) startFromLevel(next);
    else                       EventBus.emit('game:all-done');
  }

  /** Load an arbitrary level object, e.g. from the editor. */
  function loadCustomLevel(levelData) {
    unloadLevel();
    currentLevelIdx = -1;
    loadLevel(levelData);
  }

  return { getCurrentLevelIdx, startFromLevel, retryLevel, nextLevel, loadCustomLevel, unloadLevel, isRunning: () => !!currentLevel };
})();
