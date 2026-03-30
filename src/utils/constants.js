// ============================================================
// constants.js — Global game configuration
//
// Central place for every magic number and colour value used
// across the codebase.  Change values here to affect the whole
// game without hunting through individual modules.
// ============================================================

const CONSTANTS = {

  // ── Isometric grid ────────────────────────────────────────
  TILE_SIZE:   2,      // World-unit side length of one grid cell
  TILE_HEIGHT: 0.5,    // Thickness of floor slabs
  WALL_HEIGHT: 2.5,    // Height of wall blocks

  // ── Isometric camera ──────────────────────────────────────
  // Classic 45° rotation / ~30° elevation gives the iso look.
  ISO_ALPHA:  -Math.PI / 4,   // Horizontal rotation (radians)
  ISO_BETA:    Math.PI / 3.6, // Elevation angle — ~50° gives clean iso without wall occlusion
  ISO_RADIUS:  32,             // Camera distance — increased to fit larger chambers

  // ── Player ────────────────────────────────────────────────
  PLAYER_SPEED:     5,    // Grid cells per second (not used directly; animation frames instead)
  PLAYER_STEP_TIME: 0.18, // Seconds to complete one move animation

  // ── Portal gun ────────────────────────────────────────────
  PORTAL_RANGE: 12,   // Maximum cells a portal shot travels before stopping

  // ── Tile colour palette (hex strings) ────────────────────
  COLOR_FLOOR:        '#1e1e28',
  COLOR_WALL:         '#2a2a38',
  COLOR_WALL_ACCENT:  '#3a3a50',  // Portal-capable wall highlight
  COLOR_PORTAL_A:     '#0099ff',  // Blue portal
  COLOR_PORTAL_B:     '#ff6a00',  // Orange portal
  COLOR_PLAYER:       '#ccccdd',
  COLOR_EXIT:         '#00ff88',
  COLOR_BUTTON:       '#ffdd00',
  COLOR_DOOR:         '#ff4444',
  COLOR_CUBE:         '#aaaacc',
  COLOR_MOVABLE:      '#5a3a1a',  // Dark stone/concrete block
  COLOR_HAZARD:       '#ff2244',
  COLOR_EMITTER:      '#ff6a00',

  // ── Tile ID constants (must match tileTypes.js keys) ─────
  TILE: {
    EMPTY:        0,
    FLOOR:        1,
    WALL:         2,
    PLAYER:       3,  // Marks player start position in grid
    EXIT:         4,
    BUTTON:       5,  // Pressure plate
    DOOR:         6,  // Locked door (opens when linked button pressed)
    CUBE:         7,  // Weighted Storage Cube (pushable)
    HAZARD:       8,  // Lethal floor tile
    PORTAL_WALL:  9,  // Wall surface that accepts portal shots
    EMITTER:     10,  // Laser emitter
    RECEIVER:    11,  // Laser receiver target
    MOVABLE:     12,  // Weighted Glass Block (pushable)
  },

  // ── Direction vectors (grid movement) ────────────────────
  DIRS: {
    UP:    { dx:  0, dz: -1 },
    DOWN:  { dx:  0, dz:  1 },
    LEFT:  { dx: -1, dz:  0 },
    RIGHT: { dx:  1, dz:  0 },
  },
};
