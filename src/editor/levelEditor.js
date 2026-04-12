// ============================================================
// levelEditor.js — 2D grid-based level editor
// Tools: paint, erase, flood-fill | Import/Export JS | Test in-engine
// ============================================================

const LevelEditor = (() => {
  const CELL = 46;   // Pixels per cell in editor canvas

  let canvas, ctx;
  let gridW = 10, gridH = 10;

  // ── Multi-layer state ─────────────────────────────────────
  let _layers        = [];   // Array of 2D grids, one per floor
  let _lasersByLayer = [];   // Array of laser arrays, one per floor
  let _activeLayer   = 0;

  // Accessors for the currently edited layer
  const _grid   = () => _layers[_activeLayer];
  const _lasers = () => _lasersByLayer[_activeLayer];

  // Door links — explicit, cross-layer capable
  // [{button:{x,z,layer?}, door:{x,z,layer}}] or [{receiver:id, door:{x,z,layer}}]
  let _links           = [];
  let _pendingLinkDoor = null;  // {x,z,layer} awaiting button/receiver click

  // ── Editor state ──────────────────────────────────────────
  let levelId = 'custom';
  let levelName = 'CUSTOM CHAMBER';
  let levelHint = 'Custom level — proceed to the exit.';
  let amicaScript = '';
  let levelDialogue = {};
  let selectedTile  = CONSTANTS.TILE.FLOOR;
  let activeTool    = 'paint';
  let isPainting    = false;
  let hoverCell     = null;
  let laserDir      = { dx: 1, dz: 0 };

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

    if (_layers.length === 0) _resetToEmpty(gridW, gridH);
    _updateLayerTabs();
    _resizeCanvas();
    _render();
  }

  // ── Grid construction ─────────────────────────────────────

  function _resetToEmpty(w = gridW, h = gridH) {
    gridW = w; gridH = h;
    _layers        = [_makeBlankGrid(w, h)];
    _lasersByLayer = [[]];
    _activeLayer   = 0;
    _links         = [];
    _pendingLinkDoor = null;
  }

  function _makeBlankGrid(w, h) {
    const g = [];
    for (let z = 0; z < h; z++) {
      g[z] = [];
      for (let x = 0; x < w; x++) {
        g[z][x] = (x === 0 || x === w-1 || z === 0 || z === h-1)
          ? CONSTANTS.TILE.WALL : CONSTANTS.TILE.FLOOR;
      }
    }
    return g;
  }

  function _resizeCanvas() {
    if (!canvas) return;
    canvas.width  = gridW * CELL;
    canvas.height = gridH * CELL;
  }

  // ── Layer management ──────────────────────────────────────

  function _addLayer() {
    _layers.push(_makeBlankGrid(gridW, gridH));
    _lasersByLayer.push([]);
    _setActiveLayer(_layers.length - 1);
    _setStatus(`Floor ${_activeLayer} added.`);
  }

  function _removeActiveLayer() {
    if (_layers.length <= 1) { _setStatus('Cannot remove the only floor.'); return; }
    _layers.splice(_activeLayer, 1);
    _lasersByLayer.splice(_activeLayer, 1);
    _links = _links.filter(lk =>
      (lk.button?.layer ?? 0) !== _activeLayer &&
      (lk.door?.layer   ?? 0) !== _activeLayer
    );
    _setActiveLayer(Math.max(0, _activeLayer - 1));
    _setStatus('Floor removed.');
  }

  function _setActiveLayer(li) {
    _activeLayer = li;
    _updateLayerTabs();
    _render();
  }

  function _updateLayerTabs() {
    const c = document.getElementById('editor-layer-tabs');
    if (!c) return;
    c.innerHTML = '';
    _layers.forEach((_, li) => {
      const b = document.createElement('button');
      b.className   = 'tool-btn' + (li === _activeLayer ? ' active' : '');
      b.textContent = `F${li}`;
      b.title       = `Edit floor ${li}`;
      b.onclick     = () => _setActiveLayer(li);
      c.appendChild(b);
    });
    const add = document.createElement('button');
    add.className = 'tool-btn'; add.textContent = '+'; add.title = 'Add floor';
    add.onclick = _addLayer;
    c.appendChild(add);
    if (_layers.length > 1) {
      const del = document.createElement('button');
      del.className = 'tool-btn danger'; del.textContent = '✕'; del.title = 'Remove floor';
      del.onclick = _removeActiveLayer;
      c.appendChild(del);
    }
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
        selectedTile     = t.id;
        activeTool       = 'paint';
        _pendingLinkDoor = null;
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
    // Toggle button
    document.getElementById('btn-toggle')?.addEventListener('click', () => {
      document.getElementById('cnt-sidebar').classList.toggle('hidden');
    });
    // Exit button
    document.getElementById('btn-exit')?.addEventListener('click', () => {
      EventBus.emit('editor:close');
    });
    // Tool buttons
    ['paint','erase','fill'].forEach(tool => {
      document.getElementById(`tool-${tool}`)?.addEventListener('click', () => {
        activeTool = tool; _pendingLinkDoor = null; _syncToolButtons();
      });
    });

    // Resize grid
    document.getElementById('btn-resize-grid')?.addEventListener('click', () => {
      const w = Math.max(4, Math.min(24, parseInt(document.getElementById('grid-w').value, 10)));
      const h = Math.max(4, Math.min(24, parseInt(document.getElementById('grid-h').value, 10)));
      _resizeAllLayers(w, h);
      _setStatus(`Grid resized to ${w}×${h}`);
    });

    // Random generator
    document.getElementById('btn-generate-level')?.addEventListener('click', _generateRandom);

    // Clipboard export
    document.getElementById('btn-copy-level')?.addEventListener('click', _copyClipboard);

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
        cell ? `(${cell.x}, ${cell.z}) F${_activeLayer}` : '';
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

  function _resizeAllLayers(newW, newH) {
    _layers = _layers.map(g => {
      const ng = [];
      for (let z = 0; z < newH; z++) {
        ng[z] = [];
        for (let x = 0; x < newW; x++) {
          if (x===0||x===newW-1||z===0||z===newH-1) ng[z][x] = CONSTANTS.TILE.WALL;
          else if (x < gridW && z < gridH)           ng[z][x] = g[z][x];
          else                                        ng[z][x] = CONSTANTS.TILE.FLOOR;
        }
      }
      return ng;
    });
    gridW = newW; gridH = newH;
    _resizeCanvas(); _render();
  }

  // ── Random generator ──────────────────────────────────────

  function _generateRandom() {
    if (typeof LevelGenerator === 'undefined') {
      _setStatus('LevelGenerator not loaded.'); return;
    }
    const diffEl = document.getElementById('gen-difficulty');
    const diff = diffEl ? parseInt(diffEl.value) || 2 : 2;
    const ld = LevelGenerator.generate({
      seed:       Date.now(),
      difficulty: Math.max(1, Math.min(5, diff)),
      width:      gridW,
      height:     gridH,
      id:         9000 + Math.floor(Math.random() * 900),
    });
    gridW = ld.width; gridH = ld.height;
    _layers[_activeLayer] = ld.grid.map(row => [...row]);
    _links = ld.links;
    _lasersByLayer[_activeLayer] = ld.lasers;
    ld.amica
    _resizeCanvas(); _render();
    const wEl = document.getElementById('grid-w');
    const hEl = document.getElementById('grid-h');
    if (wEl) wEl.value = gridW;
    if (hEl) hEl.value = gridH;
    const nameEl = document.getElementById('editor-level-name');
    if (nameEl) nameEl.value = typeof I18n !== 'undefined'
      ? I18n.getLocalized(ld.name) : (ld.name?.en || 'GENERATED');
    _setStatus(`Random stage generated (difficulty ${diff}).`);
  }

  // ── Canvas interaction ────────────────────────────────────

  function _eventCell(e) {
    const rect = canvas.getBoundingClientRect();
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

    // Link-assignment mode: user clicked to pick a button/receiver for pending door
    if (_pendingLinkDoor) {
      const t = _grid()[cell.z][cell.x];
      if (t === CONSTANTS.TILE.BUTTON) {
        _links.push({ button: { x: cell.x, z: cell.z, layer: _activeLayer }, door: _pendingLinkDoor });
        _setStatus(`Door linked to Button (${cell.x},${cell.z}:F${_activeLayer}).`);
      } else if (t === CONSTANTS.TILE.RECEIVER) {
        _links.push({ receiver: `${cell.x}_${cell.z}`, door: _pendingLinkDoor });
        _setStatus(`Door linked to Receiver (${cell.x},${cell.z}:F${_activeLayer}).`);
      } else {
        _setStatus('Click a BUTTON or RECEIVER to link, or paint elsewhere to skip.');
        return;
      }
      _pendingLinkDoor = null;
      _refreshLinkPanel();
      _render();
      return;
    }

    if      (activeTool === 'paint') _paintAt(cell.x, cell.z);
    else if (activeTool === 'erase') _eraseAt(cell);
    else if (activeTool === 'fill') {
      _floodFill(cell.x, cell.z, _grid()[cell.z][cell.x], selectedTile);
      isPainting = false;
    }
    _render();
  }

  function _paintAt(x, z) {
    const T = CONSTANTS.TILE;
    const g = _grid();
    const meta = TileTypes[selectedTile];

    // Unique-tile enforcement (player, exit — only one each per layer)
    if (meta?.unique) {
      for (let zz = 0; zz < gridH; zz++)
        for (let xx = 0; xx < gridW; xx++)
          if (g[zz][xx] === selectedTile) g[zz][xx] = T.FLOOR;
    }

    // Emitter: store laser data; remove old entry if overwriting
    if (selectedTile === T.EMITTER) {
      _lasersByLayer[_activeLayer] = _lasersByLayer[_activeLayer].filter(
        l => !(l.emitter.x === x && l.emitter.z === z));
      _lasersByLayer[_activeLayer].push({ emitter: { x, z }, dir: { ...laserDir }, receiverId: `${x}_${z}` });
      _setStatus(`Emitter placed at (${x},${z}) dir=(${laserDir.dx},${laserDir.dz})`);
    } else if (g[z][x] === T.EMITTER) {
      _lasersByLayer[_activeLayer] = _lasersByLayer[_activeLayer].filter(
        l => !(l.emitter.x === x && l.emitter.z === z));
    }

    g[z][x] = selectedTile;

    // When a DOOR is placed, enter link-assignment mode
    if (selectedTile === T.DOOR) {
      _pendingLinkDoor = { x, z, layer: _activeLayer };
      _setStatus(`Door placed at (${x},${z}:F${_activeLayer}). Click a BUTTON or RECEIVER to link it.`);
    }

    _refreshLinkPanel();
  }

  function _eraseAt(cell) {
    if (!cell) return;
    const { x, z } = cell;
    const g = _grid();
    if (g[z][x] === CONSTANTS.TILE.EMITTER) {
      _lasersByLayer[_activeLayer] = _lasersByLayer[_activeLayer].filter(
        l => !(l.emitter.x === x && l.emitter.z === z));
    }
    // Remove any links involving this cell
    _links = _links.filter(lk =>
      !((lk.button?.x===x && lk.button?.z===z && (lk.button?.layer??0)===_activeLayer) ||
        (lk.door?.x===x   && lk.door?.z===z   && (lk.door?.layer??0)===_activeLayer)));
    g[z][x] = CONSTANTS.TILE.FLOOR;
    _refreshLinkPanel();
    _render();
  }

  // BFS flood fill on the active layer grid
  function _floodFill(sx, sz, targetId, fillId) {
    if (targetId === fillId) return;
    const g = _grid();
    const queue   = [{ x: sx, z: sz }];
    const visited = new Set();
    while (queue.length) {
      const { x, z } = queue.shift();
      const k = `${x}_${z}`;
      if (visited.has(k) || x < 0 || x >= gridW || z < 0 || z >= gridH) continue;
      if (g[z][x] !== targetId) continue;
      visited.add(k);
      g[z][x] = fillId;
      queue.push({ x:x+1,z }, { x:x-1,z }, { x,z:z+1 }, { x,z:z-1 });
    }
  }

  // ── Link panel ────────────────────────────────────────────

  function _refreshLinkPanel() {
    const panel = document.getElementById('editor-link-list');
    if (!panel) return;
    panel.innerHTML = '';
    if (_links.length === 0) {
      panel.innerHTML = '<span style="color:#555;font-size:9px;">No links. Place a DOOR to create one.</span>';
      return;
    }
    _links.forEach((lk, i) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:4px;margin:2px 0;font-size:9px;flex-wrap:wrap;';

      const src = lk.button
        ? `BTN(${lk.button.x},${lk.button.z}:F${lk.button.layer??0})`
        : `RCV(${lk.receiver})`;
      const dst = `DOOR(${lk.door.x},${lk.door.z}:F${lk.door.layer??0})`;

      const label = document.createElement('span');
      label.style.cssText = 'color:#9090a8;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      label.textContent = `${src}→${dst}`;
      row.appendChild(label);

      // holdTime: 0 = permanent, >0 = auto-close after N seconds
      const htLabel = document.createElement('span');
      htLabel.textContent = '⏱';
      htLabel.title = 'Auto-close delay (s). 0 = permanent.';
      htLabel.style.cssText = 'color:#666;cursor:default;';
      row.appendChild(htLabel);

      const htInput = document.createElement('input');
      htInput.type  = 'number';
      htInput.min   = '0'; htInput.max = '99'; htInput.step = '1';
      htInput.value = lk.holdTime ?? 0;
      htInput.title = 'Seconds before door closes again (0 = stays open)';
      htInput.style.cssText = 'width:32px;background:#1a1a28;border:1px solid #383848;color:#ccc;font-size:8px;padding:1px 3px;border-radius:2px;text-align:center;';
      htInput.addEventListener('change', () => {
        _links[i].holdTime = Math.max(0, parseInt(htInput.value, 10) || 0);
      });
      row.appendChild(htInput);

      const del = document.createElement('button');
      del.textContent = '✕';
      del.title = 'Remove link';
      del.style.cssText = 'background:transparent;border:1px solid #383848;color:#ff4444;cursor:pointer;padding:1px 4px;font-size:8px;border-radius:2px;';
      del.onclick = () => { _links.splice(i, 1); _refreshLinkPanel(); _render(); };
      row.appendChild(del);

      panel.appendChild(row);
    });
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
    const g = _grid();
    for (let z = 0; z < gridH; z++)
      for (let x = 0; x < gridW; x++)
        _drawCell(x, z, g[z][x]);

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

    // Pending door link highlight
    if (_pendingLinkDoor && _pendingLinkDoor.layer === _activeLayer) {
      ctx.strokeStyle = '#ffdd00'; ctx.lineWidth = 3;
      ctx.strokeRect(_pendingLinkDoor.x*CELL+2, _pendingLinkDoor.z*CELL+2, CELL-4, CELL-4);
    }

    // Highlight linked cells on active layer
    _links.forEach(lk => {
      [lk.button, lk.door].forEach(c => {
        if (!c || (c.layer ?? 0) !== _activeLayer) return;
        ctx.strokeStyle = 'rgba(0,255,136,0.6)'; ctx.lineWidth = 2;
        ctx.strokeRect(c.x*CELL+1, c.z*CELL+1, CELL-2, CELL-2);
      });
    });
  }

  function _drawCell(x, z, tileId) {
    const T  = CONSTANTS.TILE;
    const px = x * CELL, py = z * CELL;

    // Base fill
    ctx.fillStyle = _getTileColor(tileId);
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);

    // Inner bevel for walls
    if (tileId === T.WALL || tileId === T.PORTAL_WALL) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(px + 2, py + 2, CELL - 4, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(px + 2, py + CELL - 5, CELL - 4, 3);
    }

    // Label for interactive tiles
    if (tileId !== T.EMPTY && tileId !== T.FLOOR && tileId !== T.WALL) {
      const meta  = TileTypes[tileId];
      const label = (meta?.editorLabel || '').replace(/^[^\s]+\s/, '');
      ctx.fillStyle    = 'rgba(255,255,255,0.9)';
      ctx.font         = `bold 9px "Share Tech Mono", monospace`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label.slice(0,6), px + CELL/2, py + CELL/2);

      // Emitter: direction arrow
      if (tileId === T.EMITTER) {
        const laser = _lasers().find(l => l.emitter.x === x && l.emitter.z === z);
        if (laser) {
          ctx.fillStyle = '#ff4444';
          ctx.font      = '14px monospace';
          const arrows  = { '1,0':'→', '-1,0':'←', '0,1':'↓', '0,-1':'↑' };
          ctx.fillText(arrows[`${laser.dir.dx},${laser.dir.dz}`] || '→', px + CELL - 10, py + 10);
        }
      }

      // Stair/hole arrows
      if (tileId === T.STAIR_UP)   { ctx.fillStyle='#00ff88'; ctx.font=`${Math.floor(CELL*0.5)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('▲', px+CELL/2, py+CELL/2); }
      if (tileId === T.STAIR_DOWN) { ctx.fillStyle='#aa88ff'; ctx.font=`${Math.floor(CELL*0.5)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('▼', px+CELL/2, py+CELL/2); }
      if (tileId === T.FLOOR_HOLE) { ctx.fillStyle='#444';    ctx.font=`${Math.floor(CELL*0.5)}px monospace`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⬡', px+CELL/2, py+CELL/2); }
    }
  }

  function _drawLaserPreviews() {
    _lasers().forEach(laser => {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,50,50,0.45)';
      ctx.lineWidth   = 2;
      ctx.beginPath();
      const sx = laser.emitter.x * CELL + CELL/2;
      const sy = laser.emitter.z * CELL + CELL/2;
      ctx.moveTo(sx, sy);
      let cx = laser.emitter.x, cz = laser.emitter.z;
      const g = _grid();
      for (let i = 0; i < 20; i++) {
        cx += laser.dir.dx; cz += laser.dir.dz;
        if (cx < 0 || cx >= gridW || cz < 0 || cz >= gridH) break;
        const tile = g[cz][cx];
        ctx.lineTo(cx * CELL + CELL/2, cz * CELL + CELL/2);
        if (isSolid(tile)) break;
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
    const T       = CONSTANTS.TILE;
    const LAYER_H = CONSTANTS.LAYER_HEIGHT ?? 3.0;

    // Build laser data per layer with resolved receiver IDs
    const allLasers = [];
    _layers.forEach((g, li) => {
      (_lasersByLayer[li] || []).forEach(l => {
        // Check 1 rows upper and 1 rows down the laser direction for a receiver target
        let rx = l.emitter.x, rz = l.emitter.z, rid = l.receiverId, found = false; 
        for (let off = -1; off <= 1 && !found; off++) {
          for (let s = 0; s < 20; s++) {
            const rx = l.emitter.x + l.dir.dx*s + (-l.dir.dz * off);
            const rz = l.emitter.z + l.dir.dz*s + (l.dir.dx * off);
            if (rx < 0 || rx >= gridW || rz < 0 || rz >= gridH) break;
            if (g[rz][rx] === T.RECEIVER) { rid = `${rx}_${rz}`; found=true; break; }
            // if (isSolid(g[rz][rx])) break;
          }
        }
        allLasers.push({ emitter: { ...l.emitter, layer: li }, dir: l.dir, receiverId: rid });
      });
    });

    // Merge explicit links with auto-paired unlinked buttons/doors per layer
    const explicitDoors = new Set(_links.map(lk => `${lk.door.x}_${lk.door.z}_${lk.door.layer??0}`));
    const finalLinks = [..._links];
    _layers.forEach((g, li) => {
      const buttons = [], doors = [], receivers = [];
      for (let z = 0; z < gridH; z++)
        for (let x = 0; x < gridW; x++) {
          const key = `${x}_${z}_${li}`;
          if (g[z][x] === T.BUTTON   && !explicitDoors.has(key)) buttons.push({x,z,layer:li});
          if (g[z][x] === T.DOOR     && !explicitDoors.has(key)) doors.push({x,z,layer:li});
          if (g[z][x] === T.RECEIVER && !explicitDoors.has(key)) receivers.push({x,z,layer:li});
        }
      // Auto-paired links don't carry holdTime (leave doors permanently open by default)
      buttons.forEach((btn, i) => { if (doors[i]) finalLinks.push({ button: btn, door: doors[i] }); });
      const usedDoors = buttons.length;
      receivers.forEach((recv, i) => {
        if (doors[usedDoors + i]) finalLinks.push({ receiver: `${recv.x}_${recv.z}`, door: doors[usedDoors + i] });
      });
    });

    // Always emit layers[] format; also top-level grid (layer 0) for legacy compat
    const layers = _layers.map((g, li) => ({
      y:    li * LAYER_H,
      grid: g.map(row => [...row]),
    }));

    return {
      id:     levelId,
      name:   typeof levelName === 'string' ? { en: levelName, it: levelName } : levelName,
      hint:   typeof levelHint === 'string' ? { en: levelHint, it: levelHint } : levelHint,
      width:  gridW, height: gridH,
      layers,
      grid:   _layers[0].map(row => [...row]),  // legacy single-layer compat
      links:  finalLinks.length > 0 ? finalLinks : undefined,
      lasers: allLasers.length  > 0 ? allLasers  : undefined,
      amica:  typeof amicaScript === 'string' ? { en: amicaScript, it: amicaScript } : amicaScript,
    };
  }

  // Export as JS file — same format as original for level_x.js compatibility
  function _exportLevel() {
    const id   = levelId === 'custom' ? Date.now() : levelId;
    const data = _buildLevelObject();

    const expLevelName = typeof levelName === 'string'
      ? `{ en: '${levelName}', it: '${levelName}' }`
      : JSON.stringify(levelName, null, 4);
    const expLevelHint = typeof levelHint === 'string'
      ? `{ en: '${levelHint}', it: '${levelHint}' }`
      : JSON.stringify(levelHint, null, 4);
    const expAmica = typeof amicaScript === 'string'
      ? `{ en: '${amicaScript.replace(/"/g, '\\"')}', it: '${amicaScript.replace(/"/g, '\\"')}' }`
      : JSON.stringify(amicaScript, null, 4);

    const layersStr = data.layers.map((l, li) =>
      `    { y: ${l.y}, grid: [\n${l.grid.map(row => `      [${row.join(',')}]`).join(',\n')}\n    ] }`
    ).join(',\n');
    const gridStr = `[\n${data.layers[0].grid.map(row => `    [${row.join(',')}]`).join(',\n')}\n  ]`

    const fileContent = `// Level Export

if (typeof LEVELS === 'undefined') LEVELS = [];
LEVELS.push({
    id: '${id}',
    name: ${expLevelName},
    hint: ${expLevelHint},
    width: ${gridW}, height: ${gridH},
    layers: [\n${layersStr}\n],
    grid: ${gridStr},
    lasers: ${JSON.stringify(data.lasers ?? [], null, 4)},
    links: ${JSON.stringify(data.links ?? [], null, 4)},
    amica: ${expAmica}
});

if (typeof DIALOGUE_SCRIPTS === 'undefined') DIALOGUE_SCRIPTS = [];
DIALOGUE_SCRIPTS.push(
    ${JSON.stringify(levelDialogue ?? {}, null, 4)}
);
`;

    const blob = new Blob([fileContent], { type: 'text/javascript' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `level_${id}.js`;
    link.click();
  }

  function _copyClipboard() {
    const js = _exportLevelClipboard(_buildLevelObject());
    navigator.clipboard.writeText(js)
      .then(() => _setStatus('Copied to clipboard.'))
      .catch(err => _setStatus('Copy failed: ' + err.message));
  }
  // Grid-only export for clipboard
  function _exportLevelClipboard(data) {
    const layersStr = data.layers.map((l, li) =>
      `    { y: ${l.y}, grid: [\n${l.grid.map(row => `      [${row.join(',')}]`).join(',\n')}\n    ] }`
    ).join(',\n');
    const gridStr = `[\n${data.grid.map(row => `      [${row.join(',')}]`).join(',\n')}\n    ]`

    return [
    `  width: ${gridW}, height: ${gridH},`,
    `  layers: [\n${layersStr}\n],`,
    `  grid: ${gridStr},`,
    `  lasers: ${JSON.stringify(data.lasers ?? [], null, 4)},`,
    `  links: ${JSON.stringify(data.links ?? [], null, 4)},`,
    ].join('\n');
  }

  // Data Import - Parses JS files by executing them in a sandbox
  function _importLevel(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      try {
        const tempLevels = [];
        const tempDiag = [];
        // Execute the file code to extract data
        const parse = new Function('LEVELS', 'DIALOGUE_SCRIPTS', content);
        parse(tempLevels, tempDiag);

        const data = tempLevels[0] || {};
        const diag = tempDiag[0] || {};
        if (!data.width || !data.height) throw new Error('Invalid format');
        levelId = data.id;
        levelName = data.name;
        levelHint = data.hint || '';
        gridW = data.width; gridH = data.height;
        amicaScript = data.amica || '';
        levelDialogue = diag;

        if (data.layers) {
          _layers        = data.layers.map(l => l.grid.map(row => [...row]));
          _lasersByLayer = _layers.map(() => []);
        } else if (data.grid) {
          _layers        = [data.grid.map(row => [...row])];
          _lasersByLayer = [[]];
        } else {
          throw new Error('No grid data');
        }

        _links       = (data.links || []).map(lk => ({ ...lk }));
        _activeLayer = 0;
        // Distribute laser data to the correct layer
        (data.lasers || []).forEach(l => {
          const li = l.emitter?.layer ?? 0;
          if (_lasersByLayer[li]) _lasersByLayer[li].push(l);
        });

        document.getElementById('grid-w').value = gridW;
        document.getElementById('grid-h').value = gridH;
        _updateLayerTabs();
        _resizeCanvas();
        _render();
        _refreshLinkPanel();
        _setStatus(`Imported: ${data.name?.en || data.name || 'custom level'} (${gridW}×${gridH}, ${_layers.length} floor${_layers.length > 1 ? 's' : ''})`);
      } catch (err) {
        _setStatus('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function _testLevel() {
    let hasPlayer = false, hasExit = false;
    _layers.forEach(g => {
      if (!Array.isArray(g)) return;
      for (let z = 0; z < g.length; z++) {
        const row = g[z];
        if (!Array.isArray(row)) continue;
        for (let x = 0; x < row.length; x++) {
          if (row[x] === CONSTANTS.TILE.PLAYER) hasPlayer = true;
          if (row[x] === CONSTANTS.TILE.EXIT)   hasExit   = true;
        }
      }
    });
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
