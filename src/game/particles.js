// ============================================================
// particles.js — BabylonJS particle systems for visual effects
// Portal sparks, teleport burst, hazard embers, button flash
// ============================================================

const Particles = (() => {
  let scene = null;

  // Active particle systems stored by key for lifecycle management
  const systems = {};

  function init(babylonScene) {
    scene = babylonScene;
  }

  // ── Helper: create emitter anchor mesh ───────────────────

  function _emitter(name, pos) {
    const m = BABYLON.MeshBuilder.CreateBox(name, { size: 0.01 }, scene);
    m.position = pos.clone();
    m.isVisible = false;
    return m;
  }

  // ── Portal arrival burst ─────────────────────────────────

  /**
   * Emit a short particle burst at a grid position.
   * @param {number} gx
   * @param {number} gz
   * @param {'A'|'B'} which
   */
  function portalBurst(gx, gz, which) {
    if (!scene) return;
    const color = which === 'A'
      ? new BABYLON.Color4(0, 0.6, 1, 1)
      : new BABYLON.Color4(1, 0.42, 0, 1);

    const pos  = Renderer.gridToWorld(gx, gz);
    pos.y      = CONSTANTS.WALL_HEIGHT * 0.5;
    const emit = _emitter(`pe_${which}_${Date.now()}`, pos);

    const ps = new BABYLON.ParticleSystem(`ps_burst_${which}`, 80, scene);
    ps.emitter              = emit;
    ps.minEmitBox           = new BABYLON.Vector3(-0.3, -0.3, -0.1);
    ps.maxEmitBox           = new BABYLON.Vector3( 0.3,  0.3,  0.1);
    ps.color1               = color;
    ps.color2               = color.scale(0.5);
    ps.colorDead            = new BABYLON.Color4(0, 0, 0, 0);
    ps.minSize              = 0.06;
    ps.maxSize              = 0.22;
    ps.minLifeTime          = 0.3;
    ps.maxLifeTime          = 0.7;
    ps.emitRate             = 400;
    ps.minEmitPower         = 3;
    ps.maxEmitPower         = 6;
    ps.updateSpeed          = 0.015;
    ps.gravity              = new BABYLON.Vector3(0, -3, 0);
    ps.direction1           = new BABYLON.Vector3(-1, 1, -1);
    ps.direction2           = new BABYLON.Vector3( 1, 2,  1);
    ps.start();

    // Auto-stop after burst
    setTimeout(() => {
      ps.stop();
      setTimeout(() => { ps.dispose(); emit.dispose(); }, 1000);
    }, 120);
  }

  // ── Persistent portal swirl ──────────────────────────────

  /**
   * Continuous swirling particles on an active portal.
   * Call stopPortalSwirl to remove.
   */
  function startPortalSwirl(gx, gz, which) {
    stopPortalSwirl(which);
    if (!scene) return;

    const color = which === 'A'
      ? new BABYLON.Color4(0, 0.6, 1, 0.8)
      : new BABYLON.Color4(1, 0.42, 0, 0.8);

    const pos  = Renderer.gridToWorld(gx, gz);
    pos.y      = CONSTANTS.WALL_HEIGHT * 0.5;
    const emit = _emitter(`swirl_emit_${which}`, pos);

    const ps = new BABYLON.ParticleSystem(`swirl_${which}`, 60, scene);
    ps.emitter    = emit;
    ps.minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.05);
    ps.maxEmitBox = new BABYLON.Vector3( 0.5,  0.5,  0.05);
    ps.color1     = color;
    ps.color2     = color.clone();
    ps.colorDead  = new BABYLON.Color4(0, 0, 0, 0);
    ps.minSize    = 0.04; ps.maxSize   = 0.14;
    ps.minLifeTime = 0.5;  ps.maxLifeTime = 1.2;
    ps.emitRate   = 30;
    ps.minEmitPower = 0.2; ps.maxEmitPower = 0.6;
    ps.direction1 = new BABYLON.Vector3(-0.3, -0.3, 0);
    ps.direction2 = new BABYLON.Vector3( 0.3,  0.3, 0.1);
    ps.gravity    = new BABYLON.Vector3(0, 0, 0);
    ps.start();

    systems[`swirl_${which}`] = { ps, emit };
  }

  function stopPortalSwirl(which) {
    const key = `swirl_${which}`;
    if (systems[key]) {
      systems[key].ps.stop();
      setTimeout(() => {
        systems[key]?.ps.dispose();
        systems[key]?.emit.dispose();
      }, 1200);
      delete systems[key];
    }
  }

  // ── Teleport burst at player ─────────────────────────────

  function teleportBurst(gx, gz) {
    if (!scene) return;
    const pos = Renderer.gridToWorld(gx, gz);
    pos.y     = CONSTANTS.TILE_SIZE * 0.8;
    const emit = _emitter(`tele_${Date.now()}`, pos);

    const ps = new BABYLON.ParticleSystem('tele_burst', 120, scene);
    ps.emitter    = emit;
    ps.minEmitBox = new BABYLON.Vector3(-0.4, 0, -0.4);
    ps.maxEmitBox = new BABYLON.Vector3( 0.4, 0.2, 0.4);
    ps.color1     = new BABYLON.Color4(0.5, 0.8, 1, 1);
    ps.color2     = new BABYLON.Color4(1, 0.5, 0.1, 1);
    ps.colorDead  = new BABYLON.Color4(0, 0, 0, 0);
    ps.minSize    = 0.05; ps.maxSize   = 0.2;
    ps.minLifeTime = 0.3;  ps.maxLifeTime = 0.8;
    ps.emitRate   = 600;
    ps.minEmitPower = 2; ps.maxEmitPower = 5;
    ps.direction1 = new BABYLON.Vector3(-1, 1, -1);
    ps.direction2 = new BABYLON.Vector3( 1, 3,  1);
    ps.gravity    = new BABYLON.Vector3(0, -4, 0);
    ps.start();

    setTimeout(() => { ps.stop(); setTimeout(() => { ps.dispose(); emit.dispose(); }, 1000); }, 150);
  }

  // ── Hazard embers (persistent ambient) ──────────────────

  function startHazardEmbers(gx, gz) {
    const key = `hazard_${gx}_${gz}`;
    if (systems[key] || !scene) return;

    const pos = Renderer.gridToWorld(gx, gz);
    pos.y = 0.1;
    const emit = _emitter(key + '_emit', pos);

    const ps = new BABYLON.ParticleSystem(key, 40, scene);
    ps.emitter    = emit;
    ps.minEmitBox = new BABYLON.Vector3(-0.8, 0, -0.8);
    ps.maxEmitBox = new BABYLON.Vector3( 0.8, 0,  0.8);
    ps.color1     = new BABYLON.Color4(1, 0.2, 0.1, 0.9);
    ps.color2     = new BABYLON.Color4(1, 0.5, 0,   0.6);
    ps.colorDead  = new BABYLON.Color4(0.2, 0.2, 0.2, 0);
    ps.minSize    = 0.04; ps.maxSize   = 0.12;
    ps.minLifeTime = 0.4;  ps.maxLifeTime = 1.0;
    ps.emitRate   = 15;
    ps.minEmitPower = 0.5; ps.maxEmitPower = 1.5;
    ps.direction1 = new BABYLON.Vector3(-0.2, 1, -0.2);
    ps.direction2 = new BABYLON.Vector3( 0.2, 2,  0.2);
    ps.gravity    = new BABYLON.Vector3(0, -1, 0);
    ps.start();
    systems[key] = { ps, emit };
  }

  // ── Button press flash ───────────────────────────────────

  function buttonFlash(gx, gz) {
    if (!scene) return;
    const pos = Renderer.gridToWorld(gx, gz);
    pos.y = 0.15;
    const emit = _emitter(`btn_flash_${Date.now()}`, pos);

    const ps = new BABYLON.ParticleSystem('btn_flash', 60, scene);
    ps.emitter    = emit;
    ps.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    ps.maxEmitBox = new BABYLON.Vector3( 0.5, 0.1, 0.5);
    ps.color1     = new BABYLON.Color4(1, 0.9, 0.2, 1);
    ps.color2     = new BABYLON.Color4(1, 0.6, 0,   0.8);
    ps.colorDead  = new BABYLON.Color4(0, 0, 0, 0);
    ps.minSize    = 0.05; ps.maxSize   = 0.18;
    ps.minLifeTime = 0.2;  ps.maxLifeTime = 0.5;
    ps.emitRate   = 300;
    ps.minEmitPower = 1; ps.maxEmitPower = 3;
    ps.direction1 = new BABYLON.Vector3(-0.5, 1, -0.5);
    ps.direction2 = new BABYLON.Vector3( 0.5, 2,  0.5);
    ps.gravity    = new BABYLON.Vector3(0, -3, 0);
    ps.start();
    setTimeout(() => { ps.stop(); setTimeout(() => { ps.dispose(); emit.dispose(); }, 600); }, 100);
  }

  // ── Cleanup ──────────────────────────────────────────────

  function clearAll() {
    Object.keys(systems).forEach(k => {
      systems[k]?.ps?.dispose();
      systems[k]?.emit?.dispose();
      delete systems[k];
    });
  }

  return {
    init, clearAll,
    portalBurst, startPortalSwirl, stopPortalSwirl,
    teleportBurst, startHazardEmbers, buttonFlash,
  };
})();
