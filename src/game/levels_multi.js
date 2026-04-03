// ============================================================
// levels_multi.js — Multi-layer test chambers
//
// Level format:
//   layers: [ { y: <worldY>, grid: [...] }, ... ]
//   width, height apply to ALL layers (same footprint)
//   Player start: first PLAYER tile found scanning layers top→bottom (layer 0 first)
//
// Tile additions for multi-layer:
//   13 = STAIR_UP    — walk onto it → teleport to same x,z on layer above
//   14 = STAIR_DOWN  — walk onto it → teleport to same x,z on layer below
//   15 = FLOOR_HOLE  — walk onto it → fall to layer below
// ============================================================

const LEVELS_MULTI = [

  // ── Chamber ML-01: Two-level introduction ────────────────
  {
    id: 101,
    name: 'CHAMBER ML-01 — ASCENSION',
    hint: 'Find the stairs. The exit is above.',
    width: 10, height: 10,
    layers: [
      {
        y: 0,
        grid: [
          [2,2,2,2,2,2,2,2,2,2],
          [2,3,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,9,9,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,9,9,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,13,1,1,2],
          [2,2,2,2,2,2,2,2,2,2],
        ],
      },
      {
        y: 3.0,
        grid: [
          [2,2,2,2,2,2,2,2,2,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,9,9,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,14,1,1,1,1,1,1,4,2],
          [2,1,1,1,1,1,9,9,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,2],
          [2,2,2,2,2,2,2,2,2,2],
        ],
      },
    ],
    amica: "There are now two test chambers. They are stacked. Try not to fall.",
  },

  // ── Chamber ML-02: Three layers, portal cross-layer ──────
  {
    id: 102,
    name: 'CHAMBER ML-02 — STRATIFICATION',
    hint: 'Portals work across floors. Think vertically.',
    width: 12, height: 10,
    layers: [
      {
        y: 0,
        grid: [
          [2,2,2,2,2,2,2,2,2,2,2,2],
          [2,3,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,9,1,1,1,9,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,5,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,9,1,1,1,9,1,1,1,2],
          [2,1,1,1,1,1,1,1,13,1,1,2],
          [2,2,2,2,2,2,2,2,2,2,2,2],
        ],
      },
      {
        y: 3.0,
        grid: [
          [2,2,2,2,2,2,2,2,2,2,2,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,9,1,1,1,1,1,9,1,1,2],
          [2,14,1,1,1,7,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,6,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,9,1,1,1,1,1,9,1,1,2],
          [2,1,1,1,1,1,1,1,13,1,1,2],
          [2,2,2,2,2,2,2,2,2,2,2,2],
        ],
      },
      {
        y: 6.0,
        grid: [
          [2,2,2,2,2,2,2,2,2,2,2,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,9,1,1,1,1,1,9,1,1,2],
          [2,14,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,1,1,1,1,1,1,4,1,1,1,2],
          [2,1,9,1,1,1,1,1,9,1,1,2],
          [2,1,1,1,1,1,1,1,1,1,1,2],
          [2,2,2,2,2,2,2,2,2,2,2,2],
        ],
      },
    ],
    links: [ { button: {x:4,z:4}, door: {x:6,z:5} } ],
    amica: "Three floors. I am contractually obligated to tell you that the cake is still a lie.",
  },

];
