// ============================================================
// cutscenePlayer.js — Intro cutscene system
//
// Supports:
//   type: 'video'  — plays a 2D HTML5 <video> overlay
//   type: 'glb'    — plays a BabylonJS GLB animation on a fullscreen
//                    plane in front of the camera (no gameplay scene)
//   type: 'image'  — static image with optional caption, auto-advances
//
// Level data format:
//   cutscene: {
//     type:     'video' | 'glb' | 'image',
//     src:      'assets/cutscenes/intro.mp4',   // or .glb / .png
//     duration: 6000,   // ms — for image; video uses natural duration
//     caption:  'Year 0. Aperture Science opens.',  // optional
//     skippable: true,  // show SKIP button (default: true)
//   }
//
// API:
//   CutscenePlayer.play(cutsceneDef, onComplete)
//   CutscenePlayer.skip()
// ============================================================

const CutscenePlayer = (() => {

  let _overlay   = null;
  let _onComplete = null;
  let _skipBtn    = null;
  let _active     = false;
  let _glbScene   = null;  // Separate BabylonJS scene for GLB cutscenes
  let _skipTimer  = null;

  // ── Init overlay DOM ──────────────────────────────────────

  function _ensureOverlay() {
    if (_overlay) return;
    _overlay = document.createElement('div');
    Object.assign(_overlay.style, {
      position:    'fixed',
      inset:       '0',
      zIndex:      '9000',
      background:  '#000',
      display:     'none',
      flexDirection: 'column',
      alignItems:  'center',
      justifyContent: 'center',
      fontFamily:  'var(--font-mono, monospace)',
    });
    _overlay.id = 'cutscene-overlay';

    // Skip button
    _skipBtn = document.createElement('button');
    Object.assign(_skipBtn.style, {
      position:    'absolute',
      bottom:      '24px',
      right:       '28px',
      background:  'transparent',
      border:      '1px solid rgba(255,255,255,0.4)',
      color:       'rgba(255,255,255,0.7)',
      fontFamily:  'inherit',
      fontSize:    '10px',
      letterSpacing: '2px',
      padding:     '8px 16px',
      cursor:      'pointer',
      zIndex:      '10',
    });
    _skipBtn.textContent = 'SKIP ▶';
    _skipBtn.addEventListener('click', skip);
    // Also skip on Space/Enter
    document.addEventListener('keydown', _onKeySkip);

    _overlay.appendChild(_skipBtn);
    document.body.appendChild(_overlay);
  }

  function _onKeySkip(e) {
    if (!_active) return;
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') skip();
  }

  // ── Public API ────────────────────────────────────────────

  /**
   * Play a cutscene defined in level.cutscene.
   * @param {object}   def         — cutscene definition object
   * @param {function} onComplete  — called when cutscene ends (or is skipped)
   */
  function play(def, onComplete) {
    if (!def) { onComplete?.(); return; }
    _ensureOverlay();
    _onComplete = onComplete;
    _active     = true;

    _overlay.style.display = 'flex';
    _overlay.innerHTML = '';  // Clear previous content
    _overlay.appendChild(_skipBtn);

    // Hide skip button if not skippable
    _skipBtn.style.display = (def.skippable !== false) ? 'block' : 'none';

    switch (def.type) {
      case 'video':  _playVideo(def);  break;
      case 'glb':    _playGLB(def);    break;
      case 'image':  _playImage(def);  break;
      case 'slides': _playSlides(def); break;
      default:
        // Unknown type — just show a black screen with caption for `duration`
        _playCaption(def.caption ?? '', def.duration ?? 3000);
    }
  }

  function skip() {
    if (!_active) return;
    _cleanup();
    _onComplete?.();
    _onComplete = null;
  }

  // ── Video cutscene ────────────────────────────────────────

  function _playVideo(def) {
    const video = document.createElement('video');
    Object.assign(video.style, {
      width: '100%', height: '100%', objectFit: 'contain',
    });
    video.src     = def.src;
    video.autoplay = true;
    video.muted   = false;
    video.playsInline = true;
    video.controls = false;

    video.addEventListener('ended', () => { _cleanup(); _onComplete?.(); });
    video.addEventListener('error', ()  => {
      console.warn('[Cutscene] Video failed to load:', def.src);
      _cleanup(); _onComplete?.();
    });

    if (def.caption) {
      const cap = _makeCaption(def.caption);
      _overlay.appendChild(cap);
    }
    _overlay.insertBefore(video, _skipBtn);
  }

  // ── GLB cutscene (BabylonJS engine on a hidden canvas) ───

  function _playGLB(def) {
    // Create a secondary canvas for the cutscene GLB
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      width: '100%', height: '100%', display: 'block',
    });
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    _overlay.insertBefore(canvas, _skipBtn);

    if (typeof BABYLON === 'undefined') {
      console.warn('[Cutscene] BABYLON not available for GLB cutscene');
      _playCaption(def.caption ?? '', def.duration ?? 5000);
      return;
    }

    const engine = new BABYLON.Engine(canvas, true);
    _glbScene    = new BABYLON.Scene(engine);
    _glbScene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

    // Simple cinematic camera
    const cam = new BABYLON.ArcRotateCamera('cut-cam', 0, Math.PI/4, 5, BABYLON.Vector3.Zero(), _glbScene);
    new BABYLON.HemisphericLight('cut-light', new BABYLON.Vector3(0, 1, 0), _glbScene).intensity = 1.2;

    engine.runRenderLoop(() => _glbScene.render());
    window.addEventListener('resize', () => engine.resize());

    BABYLON.SceneLoader.ImportMeshAsync('', '', def.src, _glbScene)
      .then(result => {
        // Play all animation groups
        result.animationGroups.forEach(ag => ag.start(true));

        // Auto-advance after duration
        const dur = def.duration ?? (result.animationGroups[0]?.to ?? 100) / 60 * 1000;
        _skipTimer = setTimeout(() => {
          engine.dispose();
          _cleanup();
          _onComplete?.();
        }, dur);
      })
      .catch(err => {
        console.warn('[Cutscene] GLB load failed:', err);
        engine.dispose();
        _cleanup(); _onComplete?.();
      });
  }

  // ── Image cutscene ────────────────────────────────────────

  function _playImage(def) {
    const img = document.createElement('img');
    Object.assign(img.style, {
      maxWidth: '100%', maxHeight: '80%', objectFit: 'contain',
    });
    img.src = def.src;
    img.alt = def.caption ?? 'Cutscene';
    img.addEventListener('error', () => { _cleanup(); _onComplete?.(); });
    _overlay.insertBefore(img, _skipBtn);

    if (def.caption) _overlay.insertBefore(_makeCaption(def.caption), _skipBtn);

    _skipTimer = setTimeout(() => { _cleanup(); _onComplete?.(); }, def.duration ?? 4000);
  }

  // ── Slides cutscene — cinematic text panels ───────────────

  function _playSlides(def) {
    const slides = def.slides || [];
    if (!slides.length) { _cleanup(); _onComplete?.(); return; }

    let idx = 0;

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute', inset: '0',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    });
    _overlay.insertBefore(wrap, _skipBtn);

    const show = () => {
      if (idx >= slides.length) { _cleanup(); _onComplete?.(); return; }
      const s = slides[idx++];

      wrap.innerHTML = '';

      // Optional SVG logo mark
      if (s.logo) {
        const svg = document.createElement('div');
        svg.innerHTML = s.logo;
        Object.assign(svg.style, { marginBottom: '32px', opacity: '0',
          transition: 'opacity 0.6s ease', animation: 'none' });
        wrap.appendChild(svg);
        requestAnimationFrame(() => svg.style.opacity = '1');
      }

      // Year / label
      if (s.year) {
        const y = document.createElement('div');
        y.textContent = s.year;
        Object.assign(y.style, {
          fontFamily: "var(--font-mono,'Share Tech Mono',monospace)",
          fontSize: '11px', letterSpacing: '6px', color: 'rgba(255,106,0,0.8)',
          marginBottom: '16px', opacity: '0', transition: 'opacity 0.5s ease 0.2s',
        });
        wrap.appendChild(y);
        requestAnimationFrame(() => y.style.opacity = '1');
      }

      // Main text
      const txt = document.createElement('div');
      txt.textContent = s.text || '';
      Object.assign(txt.style, {
        fontFamily: "var(--font-display,'Rajdhani',sans-serif)",
        fontSize: s.big ? '36px' : '22px',
        fontWeight: '700',
        letterSpacing: '2px',
        color: s.accent ? '#ff6a00' : 'rgba(255,255,255,0.88)',
        textAlign: 'center', maxWidth: '680px', lineHeight: '1.4',
        opacity: '0', transition: 'opacity 0.7s ease 0.1s',
        padding: '0 32px',
      });
      wrap.appendChild(txt);
      requestAnimationFrame(() => txt.style.opacity = '1');

      // Sub text
      if (s.sub) {
        const sub = document.createElement('div');
        sub.textContent = s.sub;
        Object.assign(sub.style, {
          fontFamily: "var(--font-mono,'Share Tech Mono',monospace)",
          fontSize: '11px', letterSpacing: '3px',
          color: 'rgba(255,255,255,0.35)', marginTop: '16px',
          opacity: '0', transition: 'opacity 0.6s ease 0.5s',
        });
        wrap.appendChild(sub);
        requestAnimationFrame(() => sub.style.opacity = '1');
      }

      // Horizontal rule accent
      const hr = document.createElement('div');
      Object.assign(hr.style, {
        width: '0', height: '1px', marginTop: '24px',
        background: 'linear-gradient(90deg,transparent,rgba(255,106,0,0.6),transparent)',
        transition: `width ${(s.duration||3000)*0.4}ms ease 0.3s`,
      });
      wrap.appendChild(hr);
      requestAnimationFrame(() => hr.style.width = '280px');

      _skipTimer = setTimeout(show, s.duration || 3000);
    };

    show();
  }

  // ── Caption-only ──────────────────────────────────────────

  function _playCaption(text, duration) {
    const el = _makeCaption(text);
    Object.assign(el.style, { fontSize: '18px', maxWidth: '60%', textAlign: 'center' });
    _overlay.insertBefore(el, _skipBtn);
    _skipTimer = setTimeout(() => { _cleanup(); _onComplete?.(); }, duration);
  }

  function _makeCaption(text) {
    const el = document.createElement('div');
    Object.assign(el.style, {
      color: 'rgba(255,255,255,0.85)',
      fontFamily: 'inherit',
      fontSize: '12px',
      letterSpacing: '1.5px',
      lineHeight: '1.8',
      padding: '16px 24px',
      background: 'rgba(0,0,0,0.6)',
      position: 'absolute',
      bottom: '64px', left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '80%',
      textAlign: 'center',
      borderLeft: '2px solid rgba(255,106,0,0.7)',
    });
    el.textContent = text;
    return el;
  }

  // ── Cleanup ───────────────────────────────────────────────

  function _cleanup() {
    _active = false;
    if (_skipTimer) { clearTimeout(_skipTimer); _skipTimer = null; }
    if (_glbScene) { try { _glbScene.getEngine()?.dispose(); _glbScene.dispose(); } catch(_){} _glbScene = null; }
    if (_overlay)  { _overlay.style.display = 'none'; _overlay.innerHTML = ''; _overlay.appendChild(_skipBtn); }
  }

  return { play, skip };

})();
