// ============================================================
// levelEditor.js — 2D grid-based level editor
// Tools: paint, erase, flood-fill | Import/Export JSON | Test in-engine
// ============================================================

const LevelEditor = (() => {
  const CELL = 46;   // Pixels per cell in editor canvas

  let canvas, ctx;
  let gridW = 10, gridH = 10;
  let editorGrid = [];
  let laserData  = [];      // [{emitter:{x,z}, dir:{dx,dz}, receiverId}]
  let selectedTile  = CONSTANTS.TILE.FLOOR;
  let activeTool    = 'paint';
  let isPainting    = false;
  let hoverCell     = null;  // {x,z} cell under cursor
  let laserDir      = { dx: 1, dz: 0 };  // Current laser direction for emitter placement

  let initialized = false;

  // ── Init (called once per editor open) ────────────────────

  function init() {
    canvas = document.getElementById('editor-canvas');
    ctx    = canvas.getContext('2d');

    if (!initialized) {
      _buildPalette();
      _attachSidebarEvents();
      initialized = true;
    }

    _buildEmptyGrid(gridW, gridH);
    _render();
  }

  // ── Grid construction ─────────────────────────────────────

  function _buildEmptyGrid(w, h) {
    gridW = w; gridH = h;
    editorGrid = [];
    for (let z = 0; z < h; z++) {
      editorGrid[z] = [];
      for (let x = 0; x < w; x++) {
        editorGrid[z][x] = (x === 0 || x === w-1 || z === 0 || z === h-1)
          ? CONSTANTS.TILE.WALL : CONSTANTS.TILE.FLOOR;
      }
    }
    laserData = [];
    _resizeCanvas();
  }

  function _resizeCanvas() {
    canvas.width  = gridW * CELL;
    canvas.height = gridH * CELL;
  }

  // ── Sidebar / toolbar events ──────────────────────────────

  function _buildPalette() {
    const container = document.getElementById('tile-palette');
    if (!container) return;
    container.innerHTML = '';

    Object.values(TileTypes).forEach(t => {
      const btn = document.createElement('button');
      btn.className   = 'tile-btn' + (t.id === selectedTile ? ' selected' : '');
      btn.textContent = t.editorLabel;
      btn.dataset.tileId = t.id;

      // Color-coded border
      btn.style.borderColor = t.id === selectedTile
        ? 'var(--portal-b)' : t.editorColor + '88';

      btn.addEventListener('click', () => {
        selectedTile = t.id;
        activeTool   = 'paint';
        _syncToolButtons();
        document.querySelectorAll('.tile-btn').forEach(b => {
          const tid = parseInt(b.dataset.tileId);
          b.classList.toggle('selected', tid === selectedTile);
          b.style.borderColor = tid === selectedTile
            ? 'var(--portal-b)' : (TileTypes[tid]?.editorColor || '#333') + '88';
        });
      });
      container.appendChild(btn);
    });
  }

  function _attachSidebarEvents() {
    // Toogle button
    document.getElementById('btn-toggle')?.addEventListener('click', () => {
        document.getElementById('cnt-sidebar').classList.toggle('hidden');
    });
    // Tool buttons
    ['paint','erase','fill'].forEach(tool => {
      document.getElementById(`tool-${tool}`)?.addEventListener('click', () => {
        activeTool = tool; _syncToolButtons();
      });
    });

    // Resize grid
    document.getElementById('btn-resize-grid')?.addEventListener('click', () => {
      const w = Math.max(4, Math.min(24, parseInt(document.getElementById('grid-w').value, 10)));
      const h = Math.max(4, Math.min(24, parseInt(document.getElementById('grid-h').value, 10)));
      _buildEmptyGrid(w, h);
      _render();
      _setStatus(`Grid resized to ${w}×${h}`);
    });

    // Clear grid
    document.getElementById('btn-clear-level')?.addEventListener('click', () => {
      _buildEmptyGrid(gridW, gridH); _render();
      _setStatus('Grid cleared.');
    });

    // File operations
    document.getElementById('btn-export-level')?.addEventListener('click', _exportLevel);
    document.getElementById('btn-import-level')?.addEventListener('click', () => {
      document.getElementById('import-file-input').click();
    });
    document.getElementById('import-file-input')?.addEventListener('change', _importLevel);
    document.getElementById('btn-test-level')?.addEventListener('click',    _testLevel);
    document.getElementById('btn-close-editor')?.addEventListener('click',  () => {
      EventBus.emit('editor:close');
    });

    // Laser direction picker
    document.querySelectorAll('.dir-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        laserDir = { dx: parseInt(btn.dataset.dx), dz: parseInt(btn.dataset.dz) };
        document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _setStatus(`Laser direction set: dx=${laserDir.dx} dz=${laserDir.dz}`);
      });
    });

    // Canvas events
    canvas.addEventListener('mousedown', e => { isPainting = true; _handlePaint(e); });
    canvas.addEventListener('mousemove', e => {
      const cell = _eventCell(e);
      hoverCell  = cell;
      if (isPainting) _handlePaint(e);
      _render();
      document.getElementById('editor-cursor-pos').textContent =
        cell ? `(${cell.x}, ${cell.z})` : '';
    });
    canvas.addEventListener('mouseup',    () => { isPainting = false; });
    canvas.addEventListener('mouseleave', () => { isPainting = false; hoverCell = null; _render(); });
    canvas.addEventListener('contextmenu', e => { e.preventDefault(); _eraseAt(_eventCell(e)); });
  }

  function _syncToolButtons() {
    ['paint','erase','fill'].forEach(t => {
      document.getElementById(`tool-${t}`)?.classList.toggle('active', activeTool === t);
    });
  }

  // ── Canvas interaction ────────────────────────────────────

  function _eventCell(e) {
    const rect = canvas.getBoundingClientRect();
    // Scale for CSS-vs-canvas pixel ratio
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top)  * scaleY;
    const x  = Math.floor(mx / CELL);
    const z  = Math.floor(my / CELL);
    if (x < 0 || x >= gridW || z < 0 || z >= gridH) return null;
    return { x, z };
  }

  function _handlePaint(e) {
    const cell = _eventCell(e);
    if (!cell) return;

    if      (activeTool === 'paint') _paintAt(cell.x, cell.z);
    else if (activeTool === 'erase') _eraseAt(cell);
    else if (activeTool === 'fill') {
      _floodFill(cell.x, cell.z, editorGrid[cell.z][cell.x], selectedTile);
      isPainting = false;
    }
    _render();
  }

  function _paintAt(x, z) {
    const meta = TileTypes[selectedTile];

    // Unique-tile enforcement (player, exit — only one each)
    if (meta?.unique) {
      for (let zz = 0; zz < gridH; zz++)
        for (let xx = 0; xx < gridW; xx++)
          if (editorGrid[zz][xx] === selectedTile)
            editorGrid[zz][xx] = CONSTANTS.TILE.FLOOR;
    }

    editorGrid[z][x] = selectedTile;

    // Auto-attach laser metadata for emitter tiles
    if (selectedTile === CONSTANTS.TILE.EMITTER) {
      // Remove any existing emitter at this spot
      laserData = laserData.filter(l => !(l.emitter.x === x && l.emitter.z === z));
      // Find first receiver key as placeholder (user can link manually via export)
      laserData.push({ emitter: { x, z }, dir: { ...laserDir }, receiverId: `auto_${x}_${z}` });
      _setStatus(`Emitter placed at (${x},${z}) dir=(${laserDir.dx},${laserDir.dz})`);
    }
  }

  function _eraseAt(cell) {
    if (!cell) return;
    if (editorGrid[cell.z][cell.x] === CONSTANTS.TILE.EMITTER) {
      laserData = laserData.filter(l => !(l.emitter.x === cell.x && l.emitter.z === cell.z));
    }
    editorGrid[cell.z][cell.x] = CONSTANTS.TILE.FLOOR;
    _render();
  }

  // BFS flood fill
  function _floodFill(sx, sz, targetId, fillId) {
    if (targetId === fillId) return;
    const queue   = [{ x: sx, z: sz }];
    const visited = new Set();
    while (queue.length) {
      const { x, z } = queue.shift();
      const k = `${x}_${z}`;
      if (visited.has(k) || x < 0 || x >= gridW || z < 0 || z >= gridH) continue;
      if (editorGrid[z][x] !== targetId) continue;
      visited.add(k);
      editorGrid[z][x] = fillId;
      queue.push({ x:x+1,z }, { x:x-1,z }, { x,z:z+1 }, { x,z:z-1 });
    }
  }

  // ── Rendering ─────────────────────────────────────────────

  // Cached tile colors for fast render
  const _TILE_COLORS = {};
  function _getTileColor(tileId) {
    if (!_TILE_COLORS[tileId]) _TILE_COLORS[tileId] = TileTypes[tileId]?.editorColor || '#0a0a0c';
    return _TILE_COLORS[tileId];
  }

  function _render() {
    if (!ctx) return;
    _resizeCanvas();

    // Background
    ctx.fillStyle = '#07070a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tiles
    for (let z = 0; z < gridH; z++) {
      for (let x = 0; x < gridW; x++) {
        _drawCell(x, z);
      }
    }

    // Laser preview beams
    _drawLaserPreviews();

    // Grid lines
    _drawGridLines();

    // Hover highlight
    if (hoverCell) {
      ctx.strokeStyle = 'rgba(255,106,0,0.7)';
      ctx.lineWidth   = 2;
      ctx.strokeRect(hoverCell.x * CELL + 1, hoverCell.z * CELL + 1, CELL - 2, CELL - 2);
    }
  }

  function _drawCell(x, z) {
    const tileId = editorGrid[z][x];
    const meta   = TileTypes[tileId];
    const px = x * CELL, py = z * CELL;

    // Base fill
    ctx.fillStyle = _getTileColor(tileId);
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);

    // Inner bevel for walls
    if (tileId === CONSTANTS.TILE.WALL || tileId === CONSTANTS.TILE.PORTAL_WALL) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 2, py + 2, CELL - 4, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(px + 2, py + CELL - 5, CELL - 4, 3);
    }

    // Label for interactive tiles
    if (tileId !== CONSTANTS.TILE.EMPTY &&
        tileId !== CONSTANTS.TILE.FLOOR &&
        tileId !== CONSTANTS.TILE.WALL) {
      const label = (meta?.editorLabel || '').replace(/^[^\s]+\s/, '');
      ctx.fillStyle    = 'rgba(255,255,255,0.9)';
      ctx.font         = `bold 9px "Share Tech Mono", monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.slice(0,6), px + CELL/2, py + CELL/2);

      // Emitter: draw direction arrow
      if (tileId === CONSTANTS.TILE.EMITTER) {
        const laser = laserData.find(l => l.emitter.x === x && l.emitter.z === z);
        if (laser) {
          ctx.fillStyle = '#ff4444';
          ctx.font      = '14px monospace';
          const arrows  = { '1,0':'→', '-1,0':'←', '0,1':'↓', '0,-1':'↑' };
          const key     = `${laser.dir.dx},${laser.dir.dz}`;
          ctx.fillText(arrows[key] || '→', px + CELL - 10, py + 10);
        }
      }
    }
  }

  function _drawLaserPreviews() {
    // Draw dotted lines from each emitter in its direction
    laserData.forEach(laser => {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,50,50,0.45)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      const sx = laser.emitter.x * CELL + CELL/2;
      const sy = laser.emitter.z * CELL + CELL/2;
      ctx.moveTo(sx, sy);
      // Trace up to 20 cells
      let cx = laser.emitter.x, cz = laser.emitter.z;
      for (let i = 0; i < 20; i++) {
        cx += laser.dir.dx; cz += laser.dir.dz;
        if (cx < 0 || cx >= gridW || cz < 0 || cz >= gridH) break;
        const tile = editorGrid[cz][cx];
        ctx.lineTo(cx * CELL + CELL/2, cz * CELL + CELL/2);
        if (isSolid(tile) && tile !== CONSTANTS.TILE.PORTAL_WALL) break;
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  function _drawGridLines() {
    ctx.strokeStyle = 'rgba(255,106,0,0.09)';
    ctx.lineWidth   = 1;
    for (let x = 0; x <= gridW; x++) {
      ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, gridH*CELL); ctx.stroke();
    }
    for (let z = 0; z <= gridH; z++) {
      ctx.beginPath(); ctx.moveTo(0, z*CELL); ctx.lineTo(gridW*CELL, z*CELL); ctx.stroke();
    }
  }

  // ── Import / Export ───────────────────────────────────────

  function _buildLevelObject() {
    // Build button/door links from grid scan
    const links = [];
    const buttons   = [];
    const doors     = [];
    const receivers = [];

    for (let z = 0; z < gridH; z++) {
      for (let x = 0; x < gridW; x++) {
        if (editorGrid[z][x] === CONSTANTS.TILE.BUTTON)   buttons.push({x,z});
        if (editorGrid[z][x] === CONSTANTS.TILE.DOOR)     doors.push({x,z});
        if (editorGrid[z][x] === CONSTANTS.TILE.RECEIVER) receivers.push({x,z});
      }
    }
    // Auto-pair buttons → doors (1:1 sequential)
    buttons.forEach((btn, i) => {
      if (doors[i]) links.push({ button: btn, door: doors[i] });
    });
    // Auto-pair receivers → remaining doors
    const usedDoors = buttons.length;
    receivers.forEach((recv, i) => {
      if (doors[usedDoors + i]) {
        const recvId = `${recv.x}_${recv.z}`;
        links.push({ receiver: recvId, door: doors[usedDoors + i] });
      }
    });

    // Build laser data with proper receiver IDs
    const lasers = laserData.map(l => {
      // Find nearest receiver in laser direction from emitter
      let rx = l.emitter.x, rz = l.emitter.z;
      for (let s = 0; s < 20; s++) {
        rx += l.dir.dx; rz += l.dir.dz;
        if (rx < 0 || rx >= gridW || rz < 0 || rz >= gridH) break;
        if (editorGrid[rz][rx] === CONSTANTS.TILE.RECEIVER) {
          return { emitter: l.emitter, dir: l.dir, receiverId: `${rx}_${rz}` };
        }
      }
      return { emitter: l.emitter, dir: l.dir, receiverId: l.receiverId };
    });

    return {
      id:     'custom',
      name:   'CUSTOM CHAMBER',
      hint:   'Custom level — proceed to the exit.',
      width:  gridW, height: gridH,
      grid:   editorGrid.map(row => [...row]),
      links:  links.length > 0 ? links : undefined,
      lasers: lasers.length > 0 ? lasers : undefined,
      amica: "I see you've been creative. Whether that is good or bad remains to be seen.",
    };
  }

  function _exportLevel() {
    const data = _buildLevelObject();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'chamber_custom.json' });
    a.click();
    URL.revokeObjectURL(url);
    _setStatus('Level exported.');
  }

  function _importLevel(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.grid || !data.width || !data.height) throw new Error('Invalid format');
        editorGrid = data.grid.map(row => [...row]);
        gridW = data.width; gridH = data.height;
        laserData = data.lasers ? [...data.lasers] : [];
        document.getElementById('grid-w').value = gridW;
        document.getElementById('grid-h').value = gridH;
        _render();
        _setStatus(`Imported: ${data.name || 'custom level'} (${gridW}×${gridH})`);
      } catch (err) {
        _setStatus('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function _testLevel() {
    let hasPlayer = false, hasExit = false;
    for (let z = 0; z < gridH; z++)
      for (let x = 0; x < gridW; x++) {
        if (editorGrid[z][x] === CONSTANTS.TILE.PLAYER) hasPlayer = true;
        if (editorGrid[z][x] === CONSTANTS.TILE.EXIT)   hasExit   = true;
      }
    if (!hasPlayer) { _setStatus('⚠ No PLAYER start placed.'); return; }
    if (!hasExit)   { _setStatus('⚠ No EXIT placed.'); return; }
    EventBus.emit('editor:test', _buildLevelObject());
  }

  function _setStatus(msg) {
    const el = document.getElementById('editor-status');
    if (el) el.textContent = msg;
  }

  return { init };
})();
