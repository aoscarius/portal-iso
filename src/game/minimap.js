// ============================================================
// minimap.js — 2D minimap overlay rendered on a canvas element
// Updates when player moves or level state changes
// ============================================================

const Minimap = (() => {
  const CELL_NORMAL  = 7;   // Pixels per cell — normal size
  const CELL_LARGE   = 14;  // Pixels per cell — enlarged size
  const MARGIN = 16;        // Offset from corner (px)
  let CELL = CELL_NORMAL;   // Active cell size, toggled by double-click
  let canvas, ctx;
  let currentLevel = null;
  let playerPos    = { x: 0, z: 0 };
  let portalA      = null;
  let portalB      = null;
  let visible      = true;
  let _laserSegs   = [];   // [{from:{x,z}, to:{x,z}, layerIdx}] — from LaserSystem
  let _enlarged    = false;


  // ── Init ─────────────────────────────────────────────────

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'minimap-canvas';
    Object.assign(canvas.style, {
      position:      'fixed',
      bottom:        `${MARGIN}px`,
      right:         `${MARGIN}px`,
      zIndex:        '60',
      border:        '1px solid rgba(255,106,0,0.4)',
      borderTop:     '2px solid rgba(255,106,0,0.7)',
      background:    'rgba(10,10,12,0.88)',
      imageRendering:'pixelated',
      pointerEvents: 'auto',
      cursor:        'pointer',
      transition:    'width 0.15s ease, height 0.15s ease',
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Double-click toggles between normal and enlarged size
    canvas.addEventListener('dblclick', () => {
      _enlarged = !_enlarged;
      CELL = _enlarged ? CELL_LARGE : CELL_NORMAL;
      if (currentLevel) {
        canvas.width  = currentLevel.width  * CELL;
        canvas.height = currentLevel.height * CELL;
      }
      render();
    });
  }

  // ── Public API ────────────────────────────────────────────

  function loadLevel(levelData) {
    currentLevel = levelData;
    portalA = portalB = null;
    canvas.width  = levelData.width  * CELL;
    canvas.height = levelData.height * CELL;
    render();
  }

  function setPlayerPosition(x, z) {
    playerPos = { x, z };
    render();
  }

  function setPortal(which, cell) {
    if (which === 'A') portalA = cell;
    else               portalB = cell;
    render();
  }

  // Called by LaserSystem.update() (or gameLogic after update) to refresh laser overlay
  function setLaserSegments(segs) {
    _laserSegs = segs || [];
    render();
  }

  function setVisible(v) {
    visible = v;
    canvas.style.display = v ? 'block' : 'none';
  }

  // ── Render ────────────────────────────────────────────────

  const TILE_COLORS = {
    [CONSTANTS.TILE.EMPTY]:       null,
    [CONSTANTS.TILE.FLOOR]:       '#1e1e28',
    [CONSTANTS.TILE.WALL]:        '#2a2a38',
    [CONSTANTS.TILE.PLAYER]:      '#1e1e28',
    [CONSTANTS.TILE.EXIT]:        '#00ff88',
    [CONSTANTS.TILE.BUTTON]:      '#ffdd00',
    [CONSTANTS.TILE.DOOR]:        '#4457ff',
    [CONSTANTS.TILE.CUBE]:        '#aaaacc',
    [CONSTANTS.TILE.HAZARD]:      '#ff2244',
    [CONSTANTS.TILE.PORTAL_WALL]: '#3a3a50',
    [CONSTANTS.TILE.EMITTER]:     '#ff6a00',
    [CONSTANTS.TILE.RECEIVER]:    '#00ccff',
    [CONSTANTS.TILE.MOVABLE]:     '#5a3a1a',
    [CONSTANTS.TILE.STAIR_UP]:    '#00ff88',
    [CONSTANTS.TILE.STAIR_DOWN]:  '#aa88ff',
    [CONSTANTS.TILE.FLOOR_HOLE]:  '#111118',
  };

  function render() {
    if (!ctx || !currentLevel || !visible) return;
    const { grid, width, height } = currentLevel;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const tileId = grid[z][x];
        const color  = TILE_COLORS[tileId];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x * CELL, z * CELL, CELL - 1, CELL - 1);
      }
    }

    // Draw portals
    if (portalA) {
      ctx.fillStyle = CONSTANTS.COLOR_PORTAL_A;
      ctx.fillRect(portalA.x * CELL + 1, portalA.z * CELL + 1, CELL - 2, CELL - 2);
      _drawLabel('A', portalA.x, portalA.z);
    }
    if (portalB) {
      ctx.fillStyle = CONSTANTS.COLOR_PORTAL_B;
      ctx.fillRect(portalB.x * CELL + 1, portalB.z * CELL + 1, CELL - 2, CELL - 2);
      _drawLabel('B', portalB.x, portalB.z);
    }

    // Draw laser beams
    if (_laserSegs.length > 0) {
      const activeLayer = typeof Player !== 'undefined' && Player.getLayer ? Player.getLayer() : 0;
      ctx.strokeStyle = 'rgba(255,50,50,0.75)';
      ctx.lineWidth   = Math.max(1, CELL * 0.18);
      ctx.lineCap     = 'round';
      _laserSegs.forEach(seg => {
        if ((seg.layerIdx ?? 0) !== activeLayer) return;
        ctx.beginPath();
        ctx.moveTo(seg.from.x * CELL + CELL / 2, seg.from.z * CELL + CELL / 2);
        ctx.lineTo(seg.to.x   * CELL + CELL / 2, seg.to.z   * CELL + CELL / 2);
        ctx.stroke();
      });
    }

    // Draw player — bright dot with pulse ring
    const px = playerPos.x * CELL + CELL / 2;
    const pz = playerPos.z * CELL + CELL / 2;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, pz, CELL * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // Pulse ring
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth   = 0.7;
    ctx.beginPath();
    ctx.arc(px, pz, CELL * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // "MAP" label
    ctx.fillStyle    = 'rgba(255,106,0,0.7)';
    ctx.font         = `bold ${CELL - 1}px "Share Tech Mono"`;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('MAP', 2, 1);
  }

  function _drawLabel(label, gx, gz) {
    ctx.fillStyle    = '#ffffff';
    ctx.font         = `bold ${CELL}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, gx * CELL + CELL / 2, gz * CELL + CELL / 2);
  }

  // Pull the live grid from Physics so cube/movable positions are always current
  function updateGrid(layerIdx = 0) {
    if (!currentLevel) return;
    // Physics owns the authoritative grid — read it directly
    if (typeof Physics !== 'undefined') {
      const liveGrid = [];
      for (let z = 0; z < currentLevel.height; z++) {
        liveGrid.push([]);
        for (let x = 0; x < currentLevel.width; x++) {
          liveGrid[z].push(Physics.getTile(x, z, layerIdx));
        }
      }
      currentLevel = { ...currentLevel, grid: liveGrid };
    }
    render();
  }

  return { init, loadLevel, setPlayerPosition, setPortal, setLaserSegments, setVisible, updateGrid, render, isVisible: () => visible };
})();
