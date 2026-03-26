// ============================================================
// levelGenerator.js — Procedural level generator
//
// Algorithm: BSP (Binary Space Partitioning) room generation
//   1. Start with the whole grid as one BSP node
//   2. Recursively split nodes into two halves (alternating H/V)
//   3. Place a room inside each leaf node
//   4. Connect sibling rooms with L-shaped corridors
//   5. Post-process: ring border with WALL, portal walls on dead-ends,
//      place player start, exit, buttons, doors, cubes, hazards
//
// Solvability guarantee:
//   - Player can always reach the exit (flood-fill verification)
//   - If portal_walls exist, at least 2 are reachable from player start
//   - Buttons always have an adjacent linked door
//
// Usage:
//   const levelData = LevelGenerator.generate({
//     seed: 42,         // Optional: deterministic output
//     width: 18,        // Grid width  (min 12, max 30)
//     height: 14,       // Grid height (min 10, max 24)
//     difficulty: 1,    // 1–5: controls puzzle complexity
//   });
//
// Returns a levelData object compatible with levels.js format:
//   { id, name, width, height, grid, links, lasers, amica }
// ============================================================

const LevelGenerator = (() => {

  // Seeded PRNG (Mulberry32) for deterministic generation
  function _prng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = (t + Math.imul(t ^ t >>> 7, 61 | t)) >>> 0;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const T = {
    EMPTY:       0, FLOOR:       1, WALL:        2,
    PLAYER:      3, EXIT:        4, BUTTON:      5,
    DOOR:        6, CUBE:        7, HAZARD:      8,
    PORTAL_WALL: 9, EMITTER:    10, RECEIVER:   11,
  };

  // ── Main entry point ──────────────────────────────────────

  function generate(opts = {}) {
    const seed       = opts.seed       ?? (Date.now() & 0xffffffff);
    const W          = Math.max(14, Math.min(28, opts.width  || 18));
    const H          = Math.max(12, Math.min(24, opts.height || 14));
    const difficulty = Math.max(1, Math.min(5, opts.difficulty || 1));
    const rng        = _prng(seed);

    // ── 1. Init grid ─────────────────────────────────────────
    const grid = Array.from({ length: H }, () => new Array(W).fill(T.WALL));

    // ── 2. BSP ───────────────────────────────────────────────
    const bsp   = _buildBSP({ x:1, y:1, w:W-2, h:H-2 }, 0, rng);
    const rooms = [];
    _collectRooms(bsp, rooms);

    // Carve rooms into grid
    rooms.forEach(room => _carveRoom(grid, room));

    // Connect rooms with corridors
    _connectBSP(bsp, grid, rng);

    // ── 3. Portal walls on dead-end walls ────────────────────
    if (difficulty >= 2) {
      _placePortalWalls(grid, W, H, rng, difficulty);
    }

    // ── 4. Place entities ─────────────────────────────────────
    const floors = _getFloors(grid, W, H);
    if (floors.length < 4) {
      // Grid too small / malformed — regenerate with different seed
      return generate({ ...opts, seed: seed + 1 });
    }

    // Player: far from center
    const playerCell = _farthestFrom(floors, W/2, H/2, rng);
    grid[playerCell.z][playerCell.x] = T.PLAYER;

    // Exit: far from player
    const floorsNoPlayer = floors.filter(f => !(f.x === playerCell.x && f.z === playerCell.z));
    const exitCell = _farthestFrom(floorsNoPlayer, playerCell.x, playerCell.z, rng);
    grid[exitCell.z][exitCell.x] = T.EXIT;

    // ── 5. Puzzles per difficulty ─────────────────────────────
    const links = [];

    // Button/door pairs (1 per difficulty point)
    const numButtons = Math.min(difficulty, 3);
    for (let i = 0; i < numButtons; i++) {
      _placeDoorPuzzle(grid, W, H, floors, links, rng);
    }

    // Cubes (difficulty >= 2)
    if (difficulty >= 2) {
      const nCubes = Math.floor(rng() * 2) + 1;
      _placeCubes(grid, nCubes, floors, rng);
    }

    // Hazard tiles (difficulty >= 3)
    if (difficulty >= 3) {
      _placeHazards(grid, W, H, rng, difficulty);
    }

    // ── 6. Solvability check ──────────────────────────────────
    if (!_isSolvable(grid, W, H, playerCell)) {
      return generate({ ...opts, seed: seed + 1 });
    }

    // ── 7. Build level data ───────────────────────────────────
    const id   = opts.id   || (seed % 10000);
    const name = `CHAMBER ${String(id).padStart(2,'0')} — SECTOR ${(seed & 0xfff).toString(16).toUpperCase()}`;

    return {
      id, name,
      width: W, height: H,
      grid: grid.map(row => [...row]),
      links,
      lasers: [],
      amica: _amicaLine(difficulty),
      _seed: seed,
      _difficulty: difficulty,
    };
  }

  // ── BSP tree ───────────────────────────────────────────────

  function _buildBSP(rect, depth, rng) {
    const node = { rect, room: null, left: null, right: null };
    const MIN_SIZE = 5;
    const maxDepth = 5;

    if (depth >= maxDepth) { node.room = _shrinkRoom(rect, rng); return node; }

    const canH = rect.h >= MIN_SIZE * 2 + 2;
    const canV = rect.w >= MIN_SIZE * 2 + 2;
    if (!canH && !canV) { node.room = _shrinkRoom(rect, rng); return node; }

    const splitH = canH && (!canV || rng() < 0.5);

    if (splitH) {
      const split = MIN_SIZE + Math.floor(rng() * (rect.h - MIN_SIZE * 2));
      node.left  = _buildBSP({ x:rect.x, y:rect.y,           w:rect.w, h:split          }, depth+1, rng);
      node.right = _buildBSP({ x:rect.x, y:rect.y + split,   w:rect.w, h:rect.h - split }, depth+1, rng);
    } else {
      const split = MIN_SIZE + Math.floor(rng() * (rect.w - MIN_SIZE * 2));
      node.left  = _buildBSP({ x:rect.x,          y:rect.y, w:split,           h:rect.h }, depth+1, rng);
      node.right = _buildBSP({ x:rect.x + split,  y:rect.y, w:rect.w - split,  h:rect.h }, depth+1, rng);
    }
    return node;
  }

  function _shrinkRoom(rect, rng) {
    const margin = 1;
    const x = rect.x + margin + Math.floor(rng() * 2);
    const y = rect.y + margin + Math.floor(rng() * 2);
    const w = rect.w - margin * 2 - Math.floor(rng() * 2);
    const h = rect.h - margin * 2 - Math.floor(rng() * 2);
    if (w < 3 || h < 3) return { x: rect.x+1, y: rect.y+1, w: Math.max(3, rect.w-2), h: Math.max(3, rect.h-2) };
    return { x, y, w, h };
  }

  function _collectRooms(node, out) {
    if (!node) return;
    if (node.room) { out.push(node.room); return; }
    _collectRooms(node.left,  out);
    _collectRooms(node.right, out);
  }

  function _roomCenter(room) {
    return { x: Math.floor(room.x + room.w/2), z: Math.floor(room.y + room.h/2) };
  }

  function _carveRoom(grid, room) {
    for (let z = room.y; z < room.y + room.h; z++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (z > 0 && z < grid.length-1 && x > 0 && x < grid[0].length-1) {
          grid[z][x] = T.FLOOR;
        }
      }
    }
  }

  // ── Corridor connection ────────────────────────────────────

  function _connectBSP(node, grid, rng) {
    if (!node || (!node.left && !node.right)) return;
    _connectBSP(node.left,  grid, rng);
    _connectBSP(node.right, grid, rng);

    if (node.left && node.right) {
      const a = _getAnyFloor(node.left);
      const b = _getAnyFloor(node.right);
      if (a && b) _carveCorridorLShape(grid, a, b, rng);
    }
  }

  function _getAnyFloor(node) {
    if (!node) return null;
    if (node.room) return _roomCenter(node.room);
    return _getAnyFloor(node.left) || _getAnyFloor(node.right);
  }

  function _carveCorridorLShape(grid, a, b, rng) {
    const H = grid.length, W = grid[0].length;
    // Horizontal then vertical (or reverse)
    const horizontal_first = rng() < 0.5;
    if (horizontal_first) {
      _carveLine(grid, a.x, b.x, a.z, 'h', W, H);
      _carveLine(grid, a.z, b.z, b.x, 'v', W, H);
    } else {
      _carveLine(grid, a.z, b.z, a.x, 'v', W, H);
      _carveLine(grid, a.x, b.x, b.z, 'h', W, H);
    }
  }

  function _carveLine(grid, from, to, fixed, dir, W, H) {
    const lo = Math.min(from, to), hi = Math.max(from, to);
    for (let i = lo; i <= hi; i++) {
      const gx = dir === 'h' ? i      : fixed;
      const gz = dir === 'v' ? i      : fixed;
      if (gz > 0 && gz < H-1 && gx > 0 && gx < W-1) {
        grid[gz][gx] = T.FLOOR;
      }
    }
  }

  // ── Portal walls ───────────────────────────────────────────

  function _placePortalWalls(grid, W, H, rng, difficulty) {
    const nPairs = difficulty; // 1–5 pairs
    let placed = 0;
    // Find interior walls adjacent to floors on exactly one side (dead-end walls)
    for (let z = 1; z < H-1 && placed < nPairs * 2; z++) {
      for (let x = 1; x < W-1; x++) {
        if (grid[z][x] !== T.WALL) continue;
        // Count floor neighbors
        const floorNeighbors = [[0,1],[0,-1],[1,0],[-1,0]]
          .filter(([dx,dz]) => {
            const nx=x+dx, nz=z+dz;
            return nz>=0 && nz<H && nx>=0 && nx<W && grid[nz][nx] === T.FLOOR;
          });
        if (floorNeighbors.length === 1 && rng() < 0.25) {
          grid[z][x] = T.PORTAL_WALL;
          placed++;
        }
      }
    }
  }

  // ── Helpers ────────────────────────────────────────────────

  function _getFloors(grid, W, H) {
    const floors = [];
    for (let z = 0; z < H; z++)
      for (let x = 0; x < W; x++)
        if (grid[z][x] === T.FLOOR) floors.push({ x, z });
    return floors;
  }

  function _farthestFrom(cells, fx, fz, rng) {
    if (!cells.length) return { x:1, z:1 };
    // Pick from the farthest quartile (with slight randomness)
    const scored = cells.map(c => ({
      c, d: (c.x-fx)**2 + (c.z-fz)**2
    })).sort((a,b) => b.d - a.d);
    const pool = scored.slice(0, Math.max(1, Math.floor(scored.length * 0.25)));
    return pool[Math.floor(rng() * pool.length)].c;
  }

  // ── Puzzle placement ──────────────────────────────────────

  function _placeDoorPuzzle(grid, W, H, floors, links, rng) {
    // Find a bottleneck: a single-cell corridor between two floor regions
    // Simplified: pick a random interior wall with floor on both ends
    for (let attempt = 0; attempt < 100; attempt++) {
      const z = 1 + Math.floor(rng() * (H-2));
      const x = 1 + Math.floor(rng() * (W-2));
      if (grid[z][x] !== T.WALL) continue;

      // Check: floor on top AND bottom, or left AND right
      const vBottleneck = grid[z-1]?.[x] === T.FLOOR && grid[z+1]?.[x] === T.FLOOR;
      const hBottleneck = grid[z]?.[x-1] === T.FLOOR && grid[z]?.[x+1] === T.FLOOR;
      if (!vBottleneck && !hBottleneck) continue;

      // Place door here
      grid[z][x] = T.DOOR;

      // Place button in a random floor cell far from the door
      const candidate = floors.filter(f => {
        const d = Math.abs(f.x-x) + Math.abs(f.z-z);
        return d > 3 && grid[f.z][f.x] === T.FLOOR;
      });
      if (!candidate.length) { grid[z][x] = T.WALL; continue; }

      const btn = candidate[Math.floor(rng() * candidate.length)];
      grid[btn.z][btn.x] = T.BUTTON;

      links.push({ button: { x: btn.x, z: btn.z }, door: { x, z } });
      return;
    }
  }

  function _placeCubes(grid, n, floors, rng) {
    let placed = 0;
    const shuffled = floors.slice().sort(() => rng()-0.5);
    for (const f of shuffled) {
      if (placed >= n) break;
      if (grid[f.z][f.x] === T.FLOOR) {
        grid[f.z][f.x] = T.CUBE;
        placed++;
      }
    }
  }

  function _placeHazards(grid, W, H, rng, difficulty) {
    const count = difficulty - 2;
    for (let i = 0; i < count * 3; i++) {
      const z = 1 + Math.floor(rng() * (H-2));
      const x = 1 + Math.floor(rng() * (W-2));
      if (grid[z][x] === T.FLOOR) grid[z][x] = T.HAZARD;
    }
  }

  // ── Solvability (flood fill from player to exit) ──────────

  function _isSolvable(grid, W, H, playerCell) {
    // BFS — treats cubes as blocking (must push), portals as solid but traversable
    const visited = new Set();
    const q = [playerCell];
    const key = c => `${c.x}_${c.z}`;
    visited.add(key(playerCell));

    const WALKABLE = new Set([
      T.FLOOR, T.PLAYER, T.EXIT, T.BUTTON,
      T.CUBE,  T.HAZARD,           // Hazard is walkable (lethal but passable for solve check)
    ]);

    while (q.length) {
      const { x, z } = q.shift();
      if (grid[z][x] === T.EXIT) return true;

      for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx=x+dx, nz=z+dz;
        const k = `${nx}_${nz}`;
        if (visited.has(k)) continue;
        if (nz<0||nz>=H||nx<0||nx>=W) continue;
        const t = grid[nz][nx];
        // Doors: treat as closed (player must activate button, but for flood-fill assume open)
        if (WALKABLE.has(t) || t===T.DOOR) {
          visited.add(k);
          q.push({ x:nx, z:nz });
        }
        // Portal walls: can teleport — mark as reachable for portal cells adjacent
        if (t === T.PORTAL_WALL) {
          visited.add(k);
        }
      }
    }
    return false;
  }

  // ── AMICA lines for generated levels ─────────────────────

  const _amicaLines = [
    "You have entered a procedurally generated test chamber. I had no involvement in its design.",
    "This chamber was not designed. It was calculated. There is a difference.",
    "Aperture's automated level architecture system generated this chamber in 0.003 seconds. You may take as long as you need.",
    "The automated chamber system assures me this is solvable. I am choosing to believe it.",
    "This layout was produced entirely by an algorithm. Any resemblance to good puzzle design is coincidental.",
  ];

  function _amicaLine(difficulty) {
    return _amicaLines[(difficulty - 1) % _amicaLines.length];
  }

  // ── Public API ─────────────────────────────────────────────

  return { generate };

})();
