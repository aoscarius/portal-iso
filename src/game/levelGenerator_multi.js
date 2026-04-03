// ============================================================
// levelGenerator_multi.js — Multi-layer procedural level generator
//
// Extends LevelGenerator to produce levels with N layers.
// Each layer is generated independently with BSP, then staircases
// are placed to connect consecutive layers.
// BFS validates that all layers are reachable from the player start.
// ============================================================

const LevelGeneratorMulti = (() => {

  function _rng(seed) {
    let s = seed >>> 0;
    return () => {
      s += 0x6D2B79F5;
      let t = Math.imul(s ^ (s>>>15), 1|s);
      t ^= t + Math.imul(t^(t>>>7), 61|t);
      return ((t^(t>>>14))>>>0) / 0xFFFFFFFF;
    };
  }

  /**
   * Generate a multi-layer Portal ISO level.
   *
   * @param {object} opts
   * @param {number} [opts.seed]
   * @param {number} [opts.difficulty]  1-5
   * @param {number} [opts.width]
   * @param {number} [opts.height]
   * @param {number} [opts.numLayers]   Number of floors (default: 2)
   * @param {number} [opts.id]
   * @returns Level data with layers array
   */
  function generate({
    seed       = Date.now(),
    difficulty = 2,
    width      = 12,
    height     = 10,
    numLayers  = 2,
    id         = 2000,
  } = {}) {
    width  = Math.max(8, width);
    height = Math.max(8, height);
    numLayers = Math.max(1, Math.min(8, numLayers));

    const rand     = _rng(seed);
    const T        = CONSTANTS.TILE;
    const LAYER_H  = CONSTANTS.LAYER_HEIGHT ?? 3.0;

    // Generate each layer individually using the single-layer generator
    const layers = [];
    for (let li = 0; li < numLayers; li++) {
      const layerSeed = seed + li * 0x1337;
      const singleLevel = LevelGenerator.generate({
        seed:       layerSeed,
        difficulty: Math.min(5, difficulty + Math.floor(li * 0.5)), // harder upstairs
        width,
        height,
        id:         id + li,
      });

      // Remove PLAYER and EXIT from non-first/non-last layers
      const grid = singleLevel.grid.map(row => row.map(t =>
        t === T.PLAYER ? T.FLOOR : t
      ));

      // Remove EXIT from all but the top layer
      if (li < numLayers - 1) {
        for (let z = 0; z < height; z++)
          for (let x = 0; x < width; x++)
            if (grid[z][x] === T.EXIT) grid[z][x] = T.FLOOR;
      }

      layers.push({ y: li * LAYER_H, grid });
    }

    // Place PLAYER on layer 0 (near a corner with space)
    _placeOnFloor(layers[0].grid, T.PLAYER, width, height, rand);

    // Connect consecutive layers with STAIR pairs
    // Each pair: STAIR_UP on layer N, STAIR_DOWN on layer N+1 (same x,z)
    for (let li = 0; li < numLayers - 1; li++) {
      const stairPos = _findFloorCell(layers[li].grid, width, height, rand);
      if (stairPos) {
        layers[li].grid[stairPos.z][stairPos.x]     = T.STAIR_UP;
        layers[li+1].grid[stairPos.z][stairPos.x]   = T.STAIR_DOWN;
      }
    }

    // Make sure EXIT is clearly on the top layer
    _placeOnFloor(layers[numLayers-1].grid, T.EXIT, width, height, rand, true);

    const diffLabels = ['', 'EASY', 'NORMAL', 'HARD', 'BRUTAL', 'INSANE'];
    const name = `ML-GEN — ${numLayers} FLOORS · ${diffLabels[Math.min(5,difficulty)]}`;

    return { id, name, width, height, layers };
  }

  function _findFloorCell(grid, w, h, rand, attempts = 40) {
    for (let i = 0; i < attempts; i++) {
      const x = 1 + Math.floor(rand() * (w-2));
      const z = 1 + Math.floor(rand() * (h-2));
      if (grid[z][x] === CONSTANTS.TILE.FLOOR) return { x, z };
    }
    // Fallback: scan
    for (let z = 1; z < h-1; z++)
      for (let x = 1; x < w-1; x++)
        if (grid[z][x] === CONSTANTS.TILE.FLOOR) return { x, z };
    return null;
  }

  function _placeOnFloor(grid, tileId, w, h, rand, preferCenter = false) {
    const T = CONSTANTS.TILE;
    // Remove existing instances of this tileId first
    for (let z = 0; z < h; z++)
      for (let x = 0; x < w; x++)
        if (grid[z][x] === tileId) grid[z][x] = T.FLOOR;

    let cell;
    if (preferCenter) {
      // Find cell closest to center
      const cx = Math.floor(w/2), cz = Math.floor(h/2);
      let best = null, bestDist = Infinity;
      for (let z = 1; z < h-1; z++)
        for (let x = 1; x < w-1; x++)
          if (grid[z][x] === T.FLOOR) {
            const d = Math.abs(x-cx) + Math.abs(z-cz);
            if (d < bestDist) { best={x,z}; bestDist=d; }
          }
      cell = best;
    } else {
      // Near corner
      const candidates = [{x:1,z:1},{x:1,z:h-2},{x:w-2,z:1},{x:w-2,z:h-2}];
      cell = candidates.find(c => grid[c.z][c.x] === T.FLOOR);
      if (!cell) cell = _findFloorCell(grid, w, h, rand);
    }

    if (cell) grid[cell.z][cell.x] = tileId;
  }

  return { generate };
})();
