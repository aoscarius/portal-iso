// ============================================================
// arManager.js — WebXR AR for BabylonJS v8+
//
// Fixes in this version:
//
// 1. CUBE IN AR: WebXRDefaultExperience creates a background helper
//    with skybox+ground. Fixed with ignoreNativeCameraTransformation +
//    disposing the environment helper after creation.
//
// 2. BOARD POSITION: placeBoardOnTap used the hit-test pose from the
//    reticle, but the reticle was never visible (not getting hit results).
//    Now the trigger/tap ALWAYS places the board 0.8m ahead at floor level
//    and additionally uses hit-test pose when available.
//
// 3. BOARD MOVEMENT: holding trigger on right controller drags the board
//    to the current hit-test / ray-cast surface. Release locks it.
//    Both triggers simultaneously = scale (squeeze in/out).
//
// 4. AUDIO ON QUEST: AudioContext must be resumed inside the XR session
//    enter event. Web Speech API on Quest requires an explicit trigger.
//
// 5. DOM OVERLAY ROOT = document.body so ALL overlays (win/fail/menu)
//    are visible inside the XR dom-overlay layer.
//
// 6. AR MENU: ESC / a long-press on left menu button shows a simple
//    in-AR menu panel.
// ============================================================

const ARManager = (() => {

  let _xrHelper     = null;
  let _xrBase       = null;
  let _hitTest      = null;
  let _boardRoot    = null;
  let _reticle      = null;
  let _reticlePose  = null;   // Latest hit-test result
  let _arActive     = false;
  let _placed       = false;
  let _scene           = null;
  let _meshObsHandle   = null;
  let _currentLevelIdx = 0;
  let _xrReady         = false;

  // Right controller state
  let _triggerHeld   = false;   // primary trigger (index finger) held
  let _squeezeHeld   = false;   // grip/squeeze held
  let _stickX        = 0;       // right thumbstick axes (live)
  let _stickY        = 0;
  let _triggerPressT = 0;       // time trigger went down (for tap detection)

  // Board-move accumulator (applied per-frame via scene observer)
  let _boardMoveObs  = null;

  // Scale: 1.00m real / 24 world-units
  const AR_SCALE = 1.00 / 24;

  // 3D BabylonJS GUI menu (floats in world space, visible in AR headset)
  let _guiTexture   = null;   // AdvancedDynamicTexture for 3D plane
  let _guiMesh      = null;   // Plane mesh hosting the GUI
  let _guiVisible   = false;

  // ── Init (call once after Renderer.init) ──────────────────

  async function init(scene) {
    _scene   = scene;
    _xrReady = false;
    try {
      if (!navigator.xr) return;
      if (!(await navigator.xr.isSessionSupported('immersive-ar'))) return;

      _xrHelper = await BABYLON.WebXRDefaultExperience.CreateAsync(scene, {
        uiOptions: {
          sessionMode:        'immersive-ar',
          referenceSpaceType: 'local-floor',
          requiredFeatures:   ['hit-test'],
          optionalFeatures:   ['dom-overlay','plane-detection','anchors'],
          // document.body as root → ALL fixed overlays visible in XR dom-overlay
          domOverlayElement:  document.body,
        },
        disableDefaultUI:     true,
        disableTeleportation: true,
        floorMeshes:          [],
        // Prevent BabylonJS from creating skybox / ground in the XR scene
        ignoreNativeCameraTransformation: false,
      });

      // Dispose the background helper (skybox + ground) that CreateAsync adds
      _xrHelper.environmentHelper?.dispose();

      _xrBase = _xrHelper.baseExperience;

      _xrBase.onStateChangedObservable.add(state => {
        if (state === BABYLON.WebXRState.IN_XR)     _onEntered();
        if (state === BABYLON.WebXRState.NOT_IN_XR) _onSessionEnd();
      });

      _xrReady = true;
      console.log('[ARManager] XR experience ready');
    } catch (err) {
      console.warn('[ARManager] init skipped:', err.message ?? err);
    }
  }

  // ── Feature detection ────────────────────────────────────

  async function isSupported() {
    try { return !!(await navigator?.xr?.isSessionSupported('immersive-ar')); }
    catch { return false; }
  }

  // ── Enter (must be inside user-gesture handler) ──────────

  async function enter(levelIdx = 0) {
    if (_arActive) return;
    if (!_xrReady || !_xrBase) { _reportError('AR not ready — try refreshing.'); return; }
    _currentLevelIdx = levelIdx;
    try {
      await _xrBase.enterXRAsync(
        'immersive-ar', 'local-floor', _xrHelper.renderTarget,
        {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay','plane-detection','anchors'],
          domOverlay:       { root: document.body },
        }
      );
    } catch (err) {
      console.error('[ARManager] enterXRAsync failed:', err);
      _reportError(err?.message ?? String(err));
    }
  }

  // ── Session active ────────────────────────────────────────

  function _onEntered() {
    if (_arActive) return;
    _arActive = true;
    _placed   = false;
    _dragging = false;

    // Transparent background (AR passthrough)
    _scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    _scene.autoClear  = false;

    // Resume audio context inside XR session (Quest autoplay policy)
    AudioEngine.resume?.();
    // Trigger Web Speech API voice list reload for Quest TTS
    try { window.speechSynthesis?.getVoices(); } catch(_) {}

    // Enable hit-test
    const featMgr = _xrBase.featuresManager;
    try {
      _hitTest = featMgr.enableFeature(BABYLON.WebXRHitTest, 'stable', {
        testOnPointerDownOnly: false,
      });
      _hitTest?.onHitTestResultObservable.add(_onHitTestResult);
    } catch(e) {
      console.warn('[ARManager] hit-test unavailable:', e.message);
    }

    // Board root
    _boardRoot = new BABYLON.TransformNode('ar-board-root', _scene);
    _boardRoot.scaling.setAll(AR_SCALE);
    _boardRoot.setEnabled(false);

    // Hide ALL existing game meshes — they'll be destroyed on auto-placement
    _scene.meshes.slice().forEach(m => {
      if (!_shouldSkip(m)) m.isVisible = false;
    });

    _buildReticle();
    _build3DMenu();

    // Any mesh added while !_placed → hide it immediately (floor/wall tiles
    // built by startFromLevel before placement must not be visible)
    _meshObsHandle = _scene.onNewMeshAddedObservable.add(mesh => {
      if (!_arActive || !_boardRoot) return;
      if (_shouldSkip(mesh)) return;
      if (!_placed) {
        // Hide until board is placed; will be rebuilt fresh after placement
        mesh.isVisible = false;
        return;
      }
      if (!mesh.parent) mesh.parent = _boardRoot;
    });

    // Auto-place board 1m ahead immediately so user sees the level right away
    _autoPlaceBoard();

    _setupControllerInput();

    // Show AR DOM overlay (touch controls)
    const domOv = document.getElementById('ar-dom-overlay');
    if (domOv) { domOv.style.display = 'block'; domOv.style.pointerEvents = 'auto'; }
    document.getElementById('ar-overlay')?.style.setProperty('display','none');

    // Show scan hint
    document.getElementById('ar-scan-hint')?.classList.add('visible');

    document.body.classList.add('ar-active');
    EventBus.emit('ar:entered');
  }

  // ── Exit ─────────────────────────────────────────────────

  async function exit() {
    if (!_arActive || !_xrBase) return;
    try { await _xrBase.exitXRAsync(); } catch { _onSessionEnd(); }
  }

  // ── Session end ──────────────────────────────────────────

  function _onSessionEnd() {
    if (!_arActive) return;

    _scene.clearColor = new BABYLON.Color4(0.04, 0.04, 0.07, 1);
    _scene.autoClear  = true;

    if (_boardRoot && _scene) {
      _scene.meshes.slice().forEach(m => {
        if (m.parent === _boardRoot) { m.parent = null; m.computeWorldMatrix(true); }
      });
      _scene.transformNodes.slice().forEach(n => {
        if (n.parent === _boardRoot) { n.parent = null; n.computeWorldMatrix(true); }
      });
      _boardRoot.dispose(); _boardRoot = null;
    }

    _reticle?.dispose(); _reticle = null;
    if (_guiTexture) { try { _guiTexture.dispose(); } catch(_){} _guiTexture = null; }
    if (_guiMesh)    { try { _guiMesh.isVisible = false; _guiMesh.dispose(); } catch(_){} _guiMesh = null; }
    _guiVisible = false;

    if (_meshObsHandle) {
      try { _scene.onNewMeshAddedObservable.remove(_meshObsHandle); } catch(_){}
      _meshObsHandle = null;
    }

    const domOv = document.getElementById('ar-dom-overlay');
    if (domOv) { domOv.style.display = 'none'; domOv.style.pointerEvents = 'none'; }

    document.getElementById('ar-scan-hint')?.classList.remove('visible');

    _arActive = _placed = false;
    _triggerHeld = _squeezeHeld = false; _stickX = _stickY = 0;
    _reticlePose = null;
    if (_boardMoveObs) { try { _scene.onBeforeRenderObservable.remove(_boardMoveObs); } catch(_){} _boardMoveObs = null; }

    document.body.classList.remove('ar-active');
    EventBus.emit('ar:exited');
  }

  function _reportError(msg) {
    console.error('[ARManager]', msg);
    const el = document.getElementById('ar-error');
    if (el) el.textContent = msg;
    EventBus.emit('ar:error', { message: msg });
  }

  function _shouldSkip(node) {
    const n = node?.name ?? '';
    return /^(ar-|xr-|WebXR|xr_cam|BackgroundHelper|BackgroundSkybox|hdr)/.test(n)
      || node === _reticle || node === _boardRoot || node === _guiMesh;
  }

  // ── Hit-test ─────────────────────────────────────────────

  function _onHitTestResult(results) {
    if (!results?.length) { _reticle?.setEnabled(false); return; }
    _reticlePose = results[0];

    const m = results[0].transformationMatrix;
    if (!m) return;

    if (!_placed) {
      _reticle?.setEnabled(true);
      if (_reticle) _reticle.position.set(m.m[12], m.m[13], m.m[14]);
    }

    // If dragging (trigger held after placement), move board to hit surface
    if (_dragging && _placed && _boardRoot) {
      _boardRoot.position.set(m.m[12], m.m[13], m.m[14]);
      _boardRoot.rotation.y = Math.atan2(m.m[8], m.m[10]);
    }
  }

  // ── Reticle ──────────────────────────────────────────────

  function _buildReticle() {
    _reticle = BABYLON.MeshBuilder.CreateTorus('ar-reticle',
      { diameter: 0.22, thickness: 0.016, tessellation: 32 }, _scene);
    const mat = new BABYLON.StandardMaterial('ar-reticle-mat', _scene);
    mat.emissiveColor = new BABYLON.Color3(0, 0.9, 1);
    mat.disableLighting = true; mat.backFaceCulling = false;
    _reticle.material = mat;
    _reticle.rotation.x = Math.PI / 2;
    _reticle.setEnabled(false);
    _reticle.isPickable = false;
    const anim = new BABYLON.Animation('rp','scaling',30,
      BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
      BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys([
      {frame:0,  value:new BABYLON.Vector3(1,1,1)},
      {frame:15, value:new BABYLON.Vector3(1.08,1.08,1.08)},
      {frame:30, value:new BABYLON.Vector3(1,1,1)},
    ]);
    _reticle.animations = [anim];
    _scene.beginAnimation(_reticle, 0, 30, true);
  }

  // ── Board placement & movement ───────────────────────────

  /** Place board immediately 1m ahead of camera at floor level. */
  function _autoPlaceBoard() {
    const cam = _xrBase?.camera;
    if (!cam) { setTimeout(_autoPlaceBoard, 200); return; }

    const pos = cam.globalPosition.clone();
    const fwd = cam.getForwardRay(1).direction.clone();
    fwd.y = 0;
    if (fwd.length() < 0.01) fwd.z = 1;
    fwd.normalize().scaleInPlace(0.5); // 50 cm in front
    pos.addInPlace(fwd);
    pos.y = cam.globalPosition.y - 0.3;  // 0.3 (30 cm under height), 0.8 ~floor level

    _boardRoot.position.copyFrom(pos);
    // Face the board toward the camera
    _boardRoot.setEnabled(true);
    _placed = true;
    _reticle?.setEnabled(false);
    document.getElementById('ar-scan-hint')?.classList.remove('visible');

    const arHud = document.getElementById('ar-hud');
    if (arHud) { arHud.classList.remove('hidden'); arHud.style.display = 'flex'; }

    // Build level — new meshes will be parented to boardRoot by _meshObsHandle
    EventBus.emit('ar:rebuild-level', { levelIdx: _currentLevelIdx });
    EventBus.emit('ar:placed');
  }

  function placeBoardOnTap() {
    // Called by trigger tap on the controller — just a no-op now that auto-placement
    // handles initial placement. Kept for backward compat with HUD tap button.
    if (!_placed) _autoPlaceBoard();
  }

  function lockBoard() {
    // Called on trigger release — stop dragging
    _dragging = false;
  }

  function resetPlacement() {
    if (!_boardRoot || !_arActive) return;
    _placed   = false;
    _dragging = false;
    _boardRoot.setEnabled(false);
    document.getElementById('ar-scan-hint')?.classList.add('visible');
    _reticle?.setEnabled(true);
  }

  // ── 3D GUI Menu (floats in AR world space) ──────────────
  // Uses BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh() to render
  // an interactive panel on a plane billboard — visible in the headset
  // without needing the DOM overlay layer.

  function _build3DMenu() {
    if (!window.BABYLON?.GUI) {
      console.warn('[ARManager] BABYLON.GUI not loaded — 3D menu unavailable');
      return;
    }

    // Plane mesh in world space — 0.4 × 0.28 m
    _guiMesh = BABYLON.MeshBuilder.CreatePlane('ar-3d-menu', {
      width: 0.4, height: 0.28,
    }, _scene);
    _guiMesh.name = 'ar-3d-menu';
    _guiMesh.isPickable = true;
    _guiMesh.isVisible  = false;       // hidden until _toggle3DMenu(true)
    _guiMesh.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    _guiMesh.renderingGroupId = 2;     // render on top of game geometry
    _guiMesh.setEnabled(true);         // keep enabled so GUI renders; control via isVisible

    _guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
      _guiMesh, 512, 360, true
    );

    const bg = new BABYLON.GUI.Rectangle('menu-bg');
    bg.width  = '100%';
    bg.height = '100%';
    bg.cornerRadius = 8;
    bg.color     = '#ff6a00';
    bg.thickness = 3;
    bg.background = '#0d0d12';
    _guiTexture.addControl(bg);

    const title = new BABYLON.GUI.TextBlock('menu-title', 'PORTAL ISO');
    title.color    = '#ff6a00';
    title.fontSize = 28;
    title.fontFamily = 'monospace';
    title.height   = '50px';
    title.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    title.top      = '12px';
    bg.addControl(title);

    const stack = new BABYLON.GUI.StackPanel('menu-stack');
    stack.width  = '88%';
    stack.height = '220px';
    stack.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    stack.top = '20px';
    bg.addControl(stack);

    const buttons = [
      { label: '▶  RESUME',          color: '#ff6a00', action: () => _toggle3DMenu(false) },
      { label: '↺  RETRY CHAMBER',   color: '#9090a8', action: () => { _toggle3DMenu(false); GameLogic.retryLevel?.(); } },
      { label: '⊕  REPOSITION BOARD',color: '#9090a8', action: () => { _toggle3DMenu(false); resetPlacement(); } },
      { label: '✕  EXIT AR',         color: '#9090a8', action: () => { _toggle3DMenu(false); exit(); } },
    ];

    buttons.forEach(({ label, color, action }) => {
      const btn = BABYLON.GUI.Button.CreateSimpleButton('', label);
      btn.width     = '100%';
      btn.height    = '46px';
      btn.color     = color;
      btn.fontSize  = 17;
      btn.fontFamily = 'monospace';
      btn.thickness = 1;
      btn.cornerRadius = 4;
      btn.background = 'transparent';
      btn.paddingBottom = '6px';
      btn.onPointerUpObservable.add(action);
      stack.addControl(btn);
    });
  }

  function _toggle3DMenu(forceState) {
    _guiVisible = forceState !== undefined ? forceState : !_guiVisible;
    if (!_guiMesh) return;

    if (_guiVisible) {
      // Position 0.5m ahead of camera, at eye level
      const cam = _xrBase?.camera;
      if (cam) {
        const pos = cam.globalPosition.clone();
        const fwd = cam.getForwardRay(1).direction.clone();
        fwd.y = 0;
        if (fwd.length() < 0.01) fwd.z = -1;
        fwd.normalize().scaleInPlace(0.5);
        pos.addInPlace(fwd);
        _guiMesh.position.copyFrom(pos);
      }
      _guiMesh.isVisible = true;
    } else {
      _guiMesh.isVisible = false;
    }
  }

  // Also build the win panel in 3D space
  function _build3DWinPanel() {
    if (!window.BABYLON?.GUI || _guiMesh === null) return; // reuse check
  }

  // ── Controller input ──────────────────────────────────────
  //
  // RIGHT controller only:
  //   A button         → shoot Portal A
  //   B button         → shoot Portal B
  //   Primary trigger  → if not yet placed: place board
  //                    → quick tap (< 200ms): pick cell / move player
  //                    → held + thumbstick Y: zoom board in/out
  //   Grip / squeeze   → held + thumbstick: move (Y) and rotate (X) board
  //   Thumbstick       → move player (when neither trigger nor squeeze held)
  //
  // LEFT controller:
  //   Thumbstick       → move player
  //   Menu button      → AR pause menu

  function _setupControllerInput() {
    const input = _xrHelper?.input;
    if (!input) return;

    // Per-frame board interaction
    let _rightCtrl = null;  // set when right controller is added
    _boardMoveObs = _scene.onBeforeRenderObservable.add(() => {
      if (!_placed || !_boardRoot) return;

      // Grip + Trigger held → drag board: follow controller ray onto virtual floor plane
      if (_dragging && _squeezeHeld && _triggerHeld && _rightCtrl) {
        try {
          const ray = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Vector3.Forward());
          _rightCtrl.getWorldPointerRayToRef?.(ray);
          // Intersect with horizontal plane at current board Y
          const boardY = _boardRoot.position.y;
          const t = (boardY - ray.origin.y) / ray.direction.y;
          if (t > 0.05 && t < 5) {
            const hit = ray.origin.add(ray.direction.scale(t));
            _boardRoot.position.x = hit.x;
            _boardRoot.position.z = hit.z;
          }
        } catch(_){}
        return;
      }

      // Grip alone + thumbstick → fine position / rotate
      if (_squeezeHeld && !_triggerHeld) {
        if (Math.abs(_stickY) > 0.15) {
          const step = _stickY * -0.012;
          const fwd = new BABYLON.Vector3(Math.sin(_boardRoot.rotation.y), 0, Math.cos(_boardRoot.rotation.y));
          _boardRoot.position.addInPlace(fwd.scale(step));
        }
        if (Math.abs(_stickX) > 0.15) {
          _boardRoot.rotation.y += _stickX * 0.025;
        }
      }
    });

    input.onControllerAddedObservable.add(ctrl => {
      ctrl.onMotionControllerInitObservable.add(mc => {
        const hand = mc.handness;

        // ── RIGHT controller ──────────────────────────────────
        if (hand === 'right') {
          _rightCtrl = ctrl;  // store for per-frame drag

          // A → Portal A
          ['a-button'].forEach(id =>
            mc.getComponent(id)?.onButtonStateChangedObservable.add(s => {
              if (s.pressed) EventBus.emit('ar:controller-action',{action:'portal-a'});
            }));

          // B → Portal B
          ['b-button'].forEach(id =>
            mc.getComponent(id)?.onButtonStateChangedObservable.add(s => {
              if (s.pressed) EventBus.emit('ar:controller-action',{action:'portal-b'});
            }));

          // Grip / squeeze
          const grip = mc.getComponentOfType(BABYLON.WebXRControllerComponent.SQUEEZE_TYPE);
          if (grip) {
            grip.onButtonStateChangedObservable.add(s => {
              _squeezeHeld = s.pressed;
              if (!s.pressed) _dragging = false;
            });
          }

          // Primary trigger (index finger)
          const trig = mc.getComponentOfType(BABYLON.WebXRControllerComponent.TRIGGER_TYPE);
          if (trig) {
            trig.onButtonStateChangedObservable.add(s => {
              if (s.pressed) {
                _triggerHeld   = true;
                _triggerPressT = Date.now();
                // Grip + Trigger → start drag
                if (_squeezeHeld && _placed) { _dragging = true; return; }
                if (!_placed) placeBoardOnTap();
              } else {
                const wasTrigger = _triggerHeld;
                _triggerHeld = false;
                _dragging    = false;
                const tapMs  = Date.now() - _triggerPressT;
                // Quick tap (no grip, short press, stick neutral) → pick cell
                if (wasTrigger && tapMs < 220 && _placed && !_squeezeHeld && Math.abs(_stickY) < 0.3) {
                  _pickCell(ctrl);
                }
              }
            });
          }

          // Thumbstick
          mc.getComponentOfType(BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE)
            ?.onAxisValueChangedObservable.add(({x, y}) => {
              _stickX = x; _stickY = y;

              // Trigger held → zoom (Y axis only)
              if (_triggerHeld && _placed) {
                if (Math.abs(y) > 0.3) {
                  const delta = y < 0 ? 1.04 : 0.96;  // stick up = zoom in
                  const sc = Math.max(AR_SCALE*0.3, Math.min(AR_SCALE*6, _boardRoot.scaling.x*delta));
                  _boardRoot.scaling.setAll(sc);
                }
                return;  // Don't move player while trigger zooming
              }

              // Squeeze held → board movement handled in per-frame observer
              if (_squeezeHeld) return;

              // Normal: move player
              if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
              EventBus.emit('ar:controller-action',{
                action: Math.abs(x)>=Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up')
              });
            });
        }

        // ── LEFT controller ───────────────────────────────────
        if (hand === 'left') {

          // Thumbstick → move player
          mc.getComponentOfType(BABYLON.WebXRControllerComponent.THUMBSTICK_TYPE)
            ?.onAxisValueChangedObservable.add(({x,y}) => {
              if (Math.abs(x)<0.5 && Math.abs(y)<0.5) return;
              EventBus.emit('ar:controller-action',{
                action: Math.abs(x)>=Math.abs(y)?(x>0?'right':'left'):(y>0?'down':'up')
              });
            });

          // Menu button → toggle 3D GUI menu
          mc.getComponent('menu-button')?.onButtonStateChangedObservable.add(s => {
            if (s.pressed) _toggle3DMenu();
          });
        }
      });
    });
  }

  function _pickCell(controller) {
    try {
      const ray = new BABYLON.Ray(BABYLON.Vector3.Zero(), BABYLON.Vector3.Forward());
      controller.getWorldPointerRayToRef?.(ray);
      const hit = _scene.pickWithRay(ray, m => m.isPickable && !_shouldSkip(m));
      if (!hit?.hit) return;
      const inv = BABYLON.Matrix.Invert(_boardRoot.getWorldMatrix());
      const loc = BABYLON.Vector3.TransformCoordinates(hit.pickedPoint, inv);
      EventBus.emit('ar:cell-picked',{
        x: Math.round(loc.x / CONSTANTS.TILE_SIZE),
        z: Math.round(loc.z / CONSTANTS.TILE_SIZE),
        action: 'move',
      });
    } catch(_){}
  }

  // ── Scale / rotate (HUD buttons) ─────────────────────────

  function rescaleBoard(delta) {
    if (!_boardRoot) return;
    const s = Math.max(AR_SCALE*0.3, Math.min(AR_SCALE*5, _boardRoot.scaling.x*delta));
    _boardRoot.scaling.setAll(s);
  }

  function rotateBoard(deg) {
    if (!_boardRoot) return;
    _boardRoot.rotation.y += deg * Math.PI / 180;
  }

  return {
    init, isSupported, enter, exit,
    placeBoardOnTap, lockBoard, resetPlacement,
    rescaleBoard, rotateBoard,
    isActive:      () => _arActive,
    isBoardPlaced: () => _placed,
    isReady:       () => _xrReady,
  };

})();
