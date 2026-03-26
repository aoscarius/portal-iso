// ============================================================
// physics.js — Grid-based collision detection
// All movement validation happens here, keeping game logic clean
// ============================================================

const Physics = (() => {

  /** @type {number[][]} Current level grid (reference, read-only) */
  let grid = null;
  let width = 0, height = 0;

  /**
   * Initialize physics with the current level grid.
   * @param {number[][]} levelGrid
   * @param {number} w
   * @param {number} h
   */
  function init(levelGrid, w, h) {
    grid   = levelGrid;
    width  = w;
    height = h;
  }

  /**
   * Get the tile ID at a grid position.
   * Returns WALL if out of bounds (treats border as solid).
   */
  function getTile(x, z) {
    if (x < 0 || x >= width || z < 0 || z >= height) return CONSTANTS.TILE.WALL;
    return grid[z][x];
  }

  /**
   * Set a tile in the mutable grid (used when cubes move, doors open, etc.).
   */
  function setTile(x, z, tileId) {
    if (x < 0 || x >= width || z < 0 || z >= height) return;
    grid[z][x] = tileId;
  }

  /**
   * Check whether the player can move to (nx, nz).
   * Handles walls, doors, and cube-pushing validation.
   * @param {number} px     Current player X
   * @param {number} pz     Current player Z
   * @param {number} nx     Target X
   * @param {number} nz     Target Z
   * @returns {{ ok: boolean, pushCube: {fromX,fromZ,toX,toZ}|null }}
   */
  function canMoveTo(px, pz, nx, nz) {
    const tile = getTile(nx, nz);

    // Solid tiles block movement
    if (isSolid(tile)) {
      return { ok: false, pushCube: null };
    }

    // Cube or movable block: check if it can be pushed
    if (tile === CONSTANTS.TILE.CUBE || tile === CONSTANTS.TILE.MOVABLE) {
      const dx = nx - px;
      const dz = nz - pz;
      const cx = nx + dx;  // Cell behind the cube
      const cz = nz + dz;
      const behindTile = getTile(cx, cz);

      if (!isSolid(behindTile) && behindTile !== CONSTANTS.TILE.CUBE) {
        // Cube can be pushed
        return {
          ok: true,
          pushCube: { fromX: nx, fromZ: nz, toX: cx, toZ: cz },
        };
      }
      return { ok: false, pushCube: null };
    }

    return { ok: true, pushCube: null };
  }

  /**
   * Cast a "portal ray" along a direction from a starting cell.
   * Returns the first portalable wall hit, or null.
   *
   * @param {number} startX
   * @param {number} startZ
   * @param {{dx:number, dz:number}} dir  — Unit direction vector
   * @returns {{x:number, z:number}|null}
   */
  function castPortalRay(startX, startZ, dir) {
    let x = startX + dir.dx;
    let z = startZ + dir.dz;

    for (let step = 0; step < CONSTANTS.PORTAL_RANGE; step++) {
      const tile = getTile(x, z);

      // Hit a portal-capable wall — success
      if (tile === CONSTANTS.TILE.PORTAL_WALL) return { x, z };

      // Hit any solid wall — blocked (not portalable)
      if (isSolid(tile)) return null;

      x += dir.dx;
      z += dir.dz;
    }
    return null; // Out of range
  }

  /**
   * Find all cells between two portal positions for teleportation.
   * Returns the exit direction to apply after teleporting.
   *
   * @param {{x:number,z:number}} portalIn
   * @param {{x:number,z:number}} portalOut
   * @param {{dx:number,dz:number}} entryDir — Direction player was travelling
   * @returns {{exitX:number, exitZ:number, exitDir:{dx,dz}}}
   */
  /**
   * Calculate where the player exits from portalOut.
   *
   * The exit cell is always the open (walkable) face of the exit portal wall —
   * not dependent on entryDir. In a well-formed level a portal wall has exactly
   * one walkable neighbour; we find it by scanning all 4 sides.
   *
   * entryDir is kept as a parameter so the player's facing direction after
   * teleporting feels consistent (they continue moving the same way).
   */
  function getPortalExit(portalIn, portalOut, entryDir) {
    const ORTHO = [
      { dx:  1, dz:  0 },
      { dx: -1, dz:  0 },
      { dx:  0, dz:  1 },
      { dx:  0, dz: -1 },
    ];

    // Step 1: find the open (walkable, non-portal) face of the exit portal
    const openFaces = ORTHO.filter(d => {
      const t = getTile(portalOut.x + d.dx, portalOut.z + d.dz);
      return !isSolid(t) && t !== CONSTANTS.TILE.PORTAL_WALL;
    });

    if (openFaces.length > 0) {
      // Prefer the open face closest to entryDir to feel natural
      const sorted = openFaces.sort((a, b) => {
        const dotA = a.dx * entryDir.dx + a.dz * entryDir.dz;
        const dotB = b.dx * entryDir.dx + b.dz * entryDir.dz;
        return dotB - dotA;  // Descending — most aligned first
      });
      const best = sorted[0];
      return {
        exitX:   portalOut.x + best.dx,
        exitZ:   portalOut.z + best.dz,
        exitDir: best,
      };
    }

    // Fallback: any non-solid neighbour (including portal walls)
    for (const d of ORTHO) {
      const ex = portalOut.x + d.dx;
      const ez = portalOut.z + d.dz;
      if (!isSolid(getTile(ex, ez))) {
        return { exitX: ex, exitZ: ez, exitDir: d };
      }
    }

    // Last resort: stay at portal center (malformed level)
    return { exitX: portalOut.x, exitZ: portalOut.z, exitDir: entryDir };
  }

  /**
   * BFS pathfind on the grid from (sx,sz) to (tx,tz).
   * Returns an array of {x,z} steps (not including the start cell).
   * Walkable = not solid and not PORTAL_WALL (can't walk through walls).
   * Returns [] if no path found or already at target.
   *
   * @param {{x:number,z:number}} from
   * @param {{x:number,z:number}} to
   * @returns {{x:number,z:number}[]}
   */
  function findPath(from, to) {
    if (from.x === to.x && from.z === to.z) return [];
    const target = getTile(to.x, to.z);
    // Target must be walkable (floor/exit/button/hazard/cube)
    if (isSolid(target)) return [];

    const DIRS4  = [[1,0],[-1,0],[0,1],[0,-1]];
    const visited = new Set();
    const queue   = [{ x: from.x, z: from.z, path: [] }];
    visited.add(`${from.x}_${from.z}`);

    while (queue.length) {
      const { x, z, path } = queue.shift();

      for (const [dx, dz] of DIRS4) {
        const nx = x + dx, nz = z + dz;
        const key = `${nx}_${nz}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const tile = getTile(nx, nz);
        if (isSolid(tile)) continue;   // Wall — skip

        const newPath = [...path, { x: nx, z: nz }];
        if (nx === to.x && nz === to.z) return newPath;
        queue.push({ x: nx, z: nz, path: newPath });
      }
    }
    return []; // No path
  }

  return { init, getTile, setTile, canMoveTo, castPortalRay, getPortalExit, findPath };
})();
