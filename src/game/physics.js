// ============================================================
// physics.js — Grid-based collision detection
// Multi-layer aware: all methods accept an optional layerIdx (default 0).
// Single-layer levels work unchanged — layer 0 is used throughout.
// ============================================================

const Physics = (() => {

  let _layers = [];   // Array of grid arrays, one per layer
  let _width  = 0;
  let _height = 0;

  // ── Init ─────────────────────────────────────────────────

  /**
   * Initialize physics from level data.
   * Accepts both legacy {grid, width, height} and multi-layer {layers[], width, height}.
   */
  function init(levelData) {
    _width  = levelData.width;
    _height = levelData.height;

    if (levelData.layers) {
      _layers = levelData.layers.map(l => l.grid.map(row => [...row]));
    } else {
      _layers = [levelData.grid.map(row => [...row])];
    }
  }

  // ── Tile access ───────────────────────────────────────────

  /**
   * Get the tile ID at (x, z) on a given layer.
   * Returns WALL if out of bounds or layer missing.
   */
  function getTile(x, z, layerIdx = 0) {
    const grid = _layers[layerIdx];
    if (!grid) return CONSTANTS.TILE.WALL;
    if (x < 0 || x >= _width || z < 0 || z >= _height) return CONSTANTS.TILE.WALL;
    return grid[z][x];
  }

  /**
   * Set a tile in the mutable grid (used when cubes move, doors open, etc.).
   */
  function setTile(x, z, tileId, layerIdx = 0) {
    const grid = _layers[layerIdx];
    if (!grid || x < 0 || x >= _width || z < 0 || z >= _height) return;
    grid[z][x] = tileId;
  }

  function getLayerCount() { return _layers.length; }

  // ── Solid check ───────────────────────────────────────────

  function isSolidTile(tileId) {
    const T = CONSTANTS.TILE;
    return tileId === T.WALL     || tileId === T.DOOR ||
           tileId === T.PORTAL_WALL ||
           tileId === T.EMITTER  || tileId === T.RECEIVER;
  }

  // ── Movement validation ───────────────────────────────────

  /**
   * Check whether the player can move to (nx, nz) on layerIdx.
   * Stairs and floor holes are walkable — the layer transition is
   * resolved by the player after landing.
   * @returns {{ ok: boolean, pushCube: {fromX,fromZ,toX,toZ}|null }}
   */
  function canMoveTo(px, pz, nx, nz, layerIdx = 0) {
    const tile = getTile(nx, nz, layerIdx);
    const T    = CONSTANTS.TILE;

    if (isSolidTile(tile)) return { ok: false, pushCube: null, pushMovable: null };

    // Cube or movable: check if pushable
    if (tile === T.CUBE || tile === T.MOVABLE) {
      const dx = nx - px, dz = nz - pz;
      const cx = nx + dx, cz = nz + dz;
      const behind = getTile(cx, cz, layerIdx);
      if (!isSolidTile(behind) && behind !== T.CUBE && behind !== T.MOVABLE) {
        if (tile === T.CUBE) {
          return { ok: true, pushCube: { fromX: nx, fromZ: nz, toX: cx, toZ: cz }, pushMovable: null };
        } else {
          return { ok: true, pushCube: null, pushMovable: { fromX: nx, fromZ: nz, toX: cx, toZ: cz } };
        }
      }
      return { ok: false, pushCube: null, pushMovable: null };
    }

    return { ok: true, pushCube: null, pushMovable: null };
  }

  // ── Layer transition ─────────────────────────────────────

  /**
   * If the tile at (x, z, layerIdx) is a stair or floor hole,
   * return the destination {x, z, layerIdx} on the adjacent layer.
   * Returns null if not a transition tile.
   */
  function getLayerTransition(x, z, layerIdx) {
    const tile = getTile(x, z, layerIdx);
    const T    = CONSTANTS.TILE;

    if (tile === T.STAIR_UP   && layerIdx + 1 < _layers.length) return { x, z, layerIdx: layerIdx + 1 };
    if (tile === T.STAIR_DOWN && layerIdx > 0)                   return { x, z, layerIdx: layerIdx - 1 };
    if (tile === T.FLOOR_HOLE && layerIdx > 0)                   return { x, z, layerIdx: layerIdx - 1 };
    return null;
  }

  // ── Portal ray-cast ───────────────────────────────────────

  /**
   * Cast a portal ray from (startX, startZ) along dir within layerIdx.
   * Returns the first PORTAL_WALL hit with faceDir, or null.
   */
  function castPortalRay(startX, startZ, dir, layerIdx = 0) {
    let x = startX + dir.dx;
    let z = startZ + dir.dz;

    for (let step = 0; step < CONSTANTS.PORTAL_RANGE; step++) {
      const tile = getTile(x, z, layerIdx);

      if (tile === CONSTANTS.TILE.PORTAL_WALL) {
        return {
          x, z, layerIdx,
          // faceDir: inward normal of the hit face (opposite to ray direction)
          faceDir: { dx: -dir.dx, dz: -dir.dz },
        };
      }
      if (isSolidTile(tile)) return null;

      x += dir.dx;
      z += dir.dz;
    }
    return null;
  }

  // ── Portal exit calculation ───────────────────────────────

  /**
   * Find all cells between two portal positions for teleportation.
   * Returns the exit direction to apply after teleporting.
   *
   * @param {{x:number,z:number}} portalIn
   * @param {{x:number,z:number}} portalOut
   * @param {{dx:number,dz:number}} entryDir — Direction player was travelling
   * @returns {{exitX:number, exitZ:number, exitDir:{dx,dz}, exitLayer:number}}
   */
   /**
   * Calculate exit position and direction for a portal teleport.
   * Prefers the faceDir stored when the portal was shot; falls back
   * to an open-face heuristic aligned with entryDir.
   * 
   * The exit cell is always the open (walkable) face of the exit portal wall —
   * not dependent on entryDir. In a well-formed level a portal wall has exactly
   * one walkable neighbour; we find it by scanning all 4 sides.
   *
   * entryDir is kept as a parameter so the player's facing direction after
   * teleporting feels consistent (they continue moving the same way).
   */
  function getPortalExit(portalIn, portalOut, entryDir) {
    const layerIdx = portalOut.layerIdx ?? 0;
    const ORTHO    = [
      { dx:  1, dz:  0 }, 
      { dx: -1, dz:  0 },
      { dx:  0, dz:  1 }, 
      { dx:  0, dz: -1 },
    ];

    // // Primary: use faceDir (wall normal stored at shoot time)
    // const fd = portalOut.faceDir;
    // if (fd) {
    //   const ex = portalOut.x + fd.dx, ez = portalOut.z + fd.dz;
    //   if (!isSolidTile(getTile(ex, ez, layerIdx))) {
    //     return { exitX: ex, exitZ: ez, exitDir: fd, exitLayer: layerIdx };
    //   }
    // }

    // Fallback: open-face heuristic, prefer face most aligned with entryDir
    const openFaces = ORTHO.filter(d => {
      const t = getTile(portalOut.x + d.dx, portalOut.z + d.dz, layerIdx);
      return !isSolidTile(t) && t !== CONSTANTS.TILE.PORTAL_WALL;
    });

    if (openFaces.length > 0) {
      // Prefer the open face closest to entryDir to feel natural
      const best = openFaces.sort((a, b) =>
        (b.dx * entryDir.dx + b.dz * entryDir.dz) -
        (a.dx * entryDir.dx + a.dz * entryDir.dz)
      )[0];
      return {
        exitX:    portalOut.x + best.dx,
        exitZ:    portalOut.z + best.dz,
        exitDir:  best,
        exitLayer: layerIdx,
      };
    }

    // Fallback: any non-solid neighbour (including portal walls)
    for (const d of ORTHO) {
      const ex = portalOut.x + d.dx;
      const ez = portalOut.z + d.dz;
      if (!isSolidTile(getTile(ex, ez, layerIdx))) {
        return { exitX: ex, exitZ: ez, exitDir: d, exitLayer: layerIdx };
      }
    }

    // Malformed level — stay at portal center
    return { exitX: portalOut.x, exitZ: portalOut.z, exitDir: entryDir, exitLayer: layerIdx };
  }

  // ── BFS pathfind ─────────────────────────────────────────

  /**
   * BFS pathfind on the grid from (sx,sz) to (tx,tz), within layerIdx.
   * Returns an array of {x,z} steps (not including the start cell).
   * Walkable = not solid and not PORTAL_WALL (can't walk through walls).
   * Returns [] if no path found or already at target.
   *
   * @param {{x:number,z:number}} from
   * @param {{x:number,z:number}} to
   * @param {layerIdx:number}
   * @returns {{x:number,z:number}[]}
   */
  function findPath(from, to, layerIdx = 0) {
    if (from.x === to.x && from.z === to.z) return [];
    if (isSolidTile(getTile(to.x, to.z, layerIdx))) return [];

    const DIRS4   = [[1,0],[-1,0],[0,1],[0,-1]];
    const visited = new Set([`${from.x}_${from.z}`]);
    const queue   = [{ x: from.x, z: from.z, path: [] }];

    while (queue.length) {
      const { x, z, path } = queue.shift();
      for (const [dx, dz] of DIRS4) {
        const nx = x + dx, nz = z + dz;
        const key = `${nx}_${nz}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (isSolidTile(getTile(nx, nz, layerIdx))) continue;
        const newPath = [...path, { x: nx, z: nz }];
        if (nx === to.x && nz === to.z) return newPath;
        queue.push({ x: nx, z: nz, path: newPath });
      }
    }
    return [];
  }

  return {
    init, getTile, setTile, getLayerCount,
    isSolidTile, canMoveTo, getLayerTransition,
    castPortalRay, getPortalExit, findPath,
  };
})();