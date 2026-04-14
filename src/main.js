// ============================================================
// main.js — Application entry point
//
// Initialises all subsystems in dependency order, shows the
// main menu, and wires top-level EventBus routing.
// AR support is optional — checked asynchronously after boot
// so that a missing / unsupported WebXR device never blocks startup.
// ============================================================

(async function () {
  
  // ── 1. Preferences (must run before Renderer so CONSTANTS
  //       colours are patched before the first mesh is created) ──

  I18n.loadSaved();
  Themes.loadSaved();

  // ── 2. Core engine ────────────────────────────────────────

  const canvas = document.getElementById('game-canvas');
  Renderer.init(canvas);

  const scene = Renderer.getScene();
  Themes.apply(Themes.getCurrent()); // Patch BabylonJS scene colours

  // ── Company intro splash (before loading) ─────────────
  await IntroSplash.show();

  // Preload 3D models if /assets/models/*.glb files are present.
  // Safe to call even if no models exist — silently falls back to procedural geometry.
  // ── Splash + asset loading ───────────────────────────────
  SplashScreen.show();

  try {
    await AssetLoader.load(scene, (loaded, total, path) => {
      SplashScreen.setProgress(loaded, total, path);
    });
  } catch (_) { /* missing models — fallback to procedural */ }

  try {
    await LevelLoader.load((loaded, total, path) => {
      SplashScreen.setProgress(loaded, total, path);
      document.getElementById("chambers-cnt").innerText = loaded;
    });
  } catch (_) { /* missing levels - skip */ }

  SplashScreen.hide();

  // Init AR infrastructure (non-blocking; does not enter XR)
  ARManager.init(scene).catch(e => console.warn('[AR init]', e));

  Particles.init(scene);
  LaserSystem.init(scene);
  Minimap.init();
  AudioEngine.init();
  AMICA.init();
  DialoguePanel.init();

  // ── 3. UI ─────────────────────────────────────────────────

  UIManager.bindButtons();
  UIManager.showMainMenu();

  // Restore saved control scheme preference
  try {
    const saved = localStorage.getItem('portal_iso_scheme');
    if (saved) Player.setScheme(saved);
  } catch(_) {}

  // Resume Web Audio on first gesture (browser autoplay policy)
  const _resumeAudio = () => AudioEngine.resume();
  document.addEventListener('click',   _resumeAudio, { once: true });
  document.addEventListener('keydown', _resumeAudio, { once: true });

  // ── 4. AR — optional, checked asynchronously ─────────────
  // ARManager may not have init(); call it only if it exists.
  // The whole block is try/catch so a WebXR error never freezes the game.

  _initAR();

  async function _initAR() {
    try {
      if (typeof ARManager === 'undefined') return;

      const supported = await ARManager.isSupported();
      const arBtn     = document.getElementById('ar-entry-btn');
      const arNoSupp  = document.getElementById('ar-not-supported');

      if (!supported) {
        if (arBtn)    arBtn.style.display = 'none';
        if (arNoSupp) arNoSupp.style.display = 'block';
        return;
      }

      arBtn?.classList.add('ar-available');

      // "PLAY IN AR" — opens info overlay
      document.getElementById('ar-entry-btn')?.addEventListener('click', () => {
        const arOv = document.getElementById('ar-overlay');
        if (arOv) { arOv.classList.remove('hidden'); arOv.style.display = 'flex'; }
        document.getElementById('main-menu')?.classList.add('hidden');
      });

      document.getElementById('ar-back-btn')?.addEventListener('click', () => {
        const arOvBack = document.getElementById('ar-overlay');
        if (arOvBack) { arOvBack.classList.add('hidden'); arOvBack.style.display = 'none'; }
        document.getElementById('main-menu')?.classList.remove('hidden');
      });

      // "▶ ENTER AR" — THIS is the user gesture.
      // ARManager.enter() calls xrBase.enterXRAsync() which calls requestSession
      // internally, satisfying the browser security requirement in one click.
      document.getElementById('ar-start-btn')?.addEventListener('click', async () => {
        document.getElementById('ar-overlay')?.style.setProperty('display','none');
        await ARManager.enter(0);
      });

      // ar:entered: board is placed automatically 1m ahead — ar:rebuild-level
      // fires from arManager which triggers startFromLevel there. Nothing to do here.
      EventBus.on('ar:entered', () => {
        UIManager.showGame();
      });

      document.getElementById('ar-btn-place')?.addEventListener('click',
        () => ARManager.placeBoardOnTap?.());
      document.getElementById('ar-btn-reset')?.addEventListener('click',
        () => ARManager.resetPlacement?.());
      document.getElementById('ar-btn-scale-up')?.addEventListener('click',
        () => ARManager.rescaleBoard?.(1.15));
      document.getElementById('ar-btn-scale-down')?.addEventListener('click',
        () => ARManager.rescaleBoard?.(0.87));
      document.getElementById('ar-btn-rot-left')?.addEventListener('click',
        () => ARManager.rotateBoard?.(-15));
      document.getElementById('ar-btn-rot-right')?.addEventListener('click',
        () => ARManager.rotateBoard?.(15));
      document.getElementById('ar-btn-exit')?.addEventListener('click',
        async () => ARManager.exit());
      document.getElementById('ar-btn-menu')?.addEventListener('click',
        () => EventBus.emit('ar:menu'));

      // AR pause menu buttons
      document.getElementById('ar-menu-resume')?.addEventListener('click', () => {
        document.getElementById('ar-menu-panel').style.display = 'none';
      });
      document.getElementById('ar-menu-retry')?.addEventListener('click', () => {
        document.getElementById('ar-menu-panel').style.display = 'none';
        GameLogic.retryLevel?.();
      });
      document.getElementById('ar-menu-reset')?.addEventListener('click', () => {
        document.getElementById('ar-menu-panel').style.display = 'none';
        ARManager.resetPlacement?.();
      });
      document.getElementById('ar-menu-exit')?.addEventListener('click', async () => {
        document.getElementById('ar-menu-panel').style.display = 'none';
        ARManager.exit();
      });

      // Enter AR button in HUD (next to fullscreen/orbit)
      document.getElementById('btn-enter-ar')?.addEventListener('click', async () => {
        await ARManager.enter(GameLogic.getCurrentLevelIdx());
      });

      // AR win toast buttons
      function _hideArWinToast() {
        const t = document.getElementById('ar-win-toast');
        if (t) t.style.display = 'none';
      }
      document.getElementById('ar-win-next')?.addEventListener('click', () => {
        _hideArWinToast();
        if (_infiniteMode) _startInfinite();
        else GameLogic.nextLevel?.();
      });
      document.getElementById('ar-win-retry')?.addEventListener('click', () => {
        _hideArWinToast();
        GameLogic.retryLevel?.();
      });
      document.getElementById('ar-win-exit')?.addEventListener('click', async () => {
        _hideArWinToast();
        ARManager.exit();
      });
      // AR fail toast buttons
      function _hideArFailToast() {
        const t = document.getElementById('ar-fail-toast');
        if (t) t.style.display = 'none';
      }
      document.getElementById('ar-fail-retry')?.addEventListener('click', () => {
        _hideArFailToast();
        GameLogic.retryLevel?.();
      });
      document.getElementById('ar-fail-exit')?.addEventListener('click', async () => {
        _hideArFailToast();
        ARManager.exit();
        GameLogic.retryLevel?.();
      });

    } catch (err) {
      console.warn('[AR] Init skipped:', err.message);
    }
  }

  // AR scan hint visibility
  EventBus.on('ar:placed', () =>
    document.getElementById('ar-scan-hint')?.classList.remove('visible'));
  EventBus.on('ar:exited', () =>
    document.getElementById('ar-scan-hint')?.classList.remove('visible'));

  // Resume audio on AR enter (Quest autoplay policy)
  EventBus.on('ar:entered', () => {
    AudioEngine.resume?.();
    try { window.speechSynthesis?.getVoices(); } catch(_) {}
  });

  // AR menu — show pause/exit overlay inside AR dom-overlay
  EventBus.on('ar:menu', () => {
    // Toggle a simple AR pause panel
    const panel = document.getElementById('ar-menu-panel');
    if (!panel) return;
    const visible = panel.style.display !== 'none';
    panel.style.display = visible ? 'none' : 'flex';
  });

  // AR board placed: rebuild level so meshes are created fresh under boardRoot
  EventBus.on('ar:rebuild-level', ({ levelIdx }) => {
    // Hide win toast before rebuild
    const toast = document.getElementById('ar-win-toast');
    if (toast) toast.style.display = 'none';
    GameLogic.unloadLevel();
    UIManager.showGame();
    if (_infiniteMode) _startInfinite();
    else GameLogic.startFromLevel(levelIdx ?? 0);
  });

  // ── 5. Top-level EventBus routing ────────────────────────

  // Multi-layer chambers button
  document.getElementById('btn-play-multi')?.addEventListener('click', () => {
    if (typeof LEVELS_MULTI !== 'undefined' && LEVELS_MULTI.length) {
      UIManager.showGame();
      GameLogic.loadCustomLevel(LEVELS_MULTI[0]);
    }
  });

  // Random multi-floor generator
  document.getElementById('btn-multi-gen')?.addEventListener('click', () => {
    if (typeof LevelGeneratorMulti !== 'undefined') {
      const numLayers = 2 + Math.floor(Math.random() * 3);  // 2-4 floors
      const ld = LevelGeneratorMulti.generate({
        seed: Date.now(), difficulty: 2, numLayers,
        width: 12, height: 10, id: 3000,
      });
      UIManager.showGame();
      GameLogic.loadCustomLevel(ld);
    }
  });

  // Infinite procedural chambers
  let _infiniteDifficulty = 1;
  let _infiniteCount      = 0;
  let _infiniteMode       = false;

  EventBus.on('game:infinite', ({ difficulty }) => {
    _infiniteDifficulty = difficulty || 1;
    _infiniteCount      = 0;
    _infiniteMode       = true;
    _startInfinite();
  });

  function _startInfinite() {
    _infiniteCount++;
    const levelData = LevelGenerator.generate({
      seed:       Date.now() + _infiniteCount,
      difficulty: Math.min(5, Math.ceil(_infiniteCount / 3)),
      width:  14 + Math.min(8, _infiniteCount),
      height: 12 + Math.min(6, _infiniteCount),
      id:     1000 + _infiniteCount,
    });
    UIManager.showGame();
    GameLogic.loadCustomLevel(levelData);
  }

  EventBus.on('game:infinite-next', () => _startInfinite());

  EventBus.on('game:start', (levelIdx) => {
    UIManager.showGame();
    GameLogic.startFromLevel(levelIdx ?? 0);
  });

  EventBus.on('game:next-level', () => {
    UIManager.showGame();
    if (_infiniteMode) _startInfinite();
    else GameLogic.nextLevel();
  });

  EventBus.on('game:retry', () => {
    UIManager.showGame();
    GameLogic.retryLevel();
  });

  EventBus.on('game:to-menu', () => {
    _infiniteMode = false;
    GameLogic.unloadLevel();
    UIManager.showMainMenu();
  });

  EventBus.on('game:to-editor', () => {
    _infiniteMode = false;
    GameLogic.unloadLevel();
    UIManager.showEditor();
  });

  EventBus.on('game:pause', () => UIManager.showMainMenu());

  EventBus.on('game:all-done', () => {
    UIManager.showWin({
      steps:   Player.getStepCount(),
      portals: Player.getPortalUses(),
      isLast:  true,
    });
  });

  EventBus.on('ui:portal-flash', () => {
    const p = PortalGun.getPortals();
    UIManager.portalFlash(p.A ? CONSTANTS.COLOR_PORTAL_A : CONSTANTS.COLOR_PORTAL_B);
  });

  EventBus.on('editor:open',  () => UIManager.showEditor());
  EventBus.on('editor:close', () => UIManager.showMainMenu());
  EventBus.on('editor:test',  (levelData) => {
    UIManager.showGame(true);
    GameLogic.loadCustomLevel(levelData);
  });

  // Rebuild level meshes when theme changes during gameplay
  EventBus.on('theme:rebuild', () => {
    if (!document.getElementById('hud').classList.contains('hidden')) {
      GameLogic.retryLevel?.();
    }
  });

  // ── 6. Global keyboard shortcuts ─────────────────────────

  let _minimapOn = true;

  window.addEventListener('keydown', e => {
    if (e.code === 'F1') { e.preventDefault(); GameLogic.retryLevel?.(); }
    if (e.code === 'KeyM') {
      _minimapOn = !_minimapOn;
      Minimap.setVisible(_minimapOn);
    }
  });

  // ── 7. Console greeting ───────────────────────────────────

  console.log(
    '%c[PORTAL ISO]%c v3.0 — Aperture Isometric Laboratories\n' +
    '  F1=Retry  M=Minimap  ESC=Menu',
    'color:#ff6a00;font-weight:bold;font-family:monospace',
    'color:#666;font-family:monospace'
  );

})();
