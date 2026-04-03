// ============================================================
// tileTypes.js — Tile type definitions with metadata
// Each entry describes properties used by renderer & logic
// ============================================================

const TileTypes = {
  0: {
    id: 0, name: 'EMPTY',
    solid: false, walkable: false, portalable: false, movable: false,
    color: null, editorLabel: '░ EMPTY', editorColor: '#0a0a0c',
  },
  1: {
    id: 1, name: 'FLOOR',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_FLOOR, editorLabel: '▪ FLOOR', editorColor: '#1e1e28',
  },
  2: {
    id: 2, name: 'WALL',
    solid: true, walkable: false, portalable: false, movable: false,
    color: CONSTANTS.COLOR_WALL, editorLabel: '█ WALL', editorColor: '#2a2a38',
  },
  3: {
    id: 3, name: 'PLAYER',
    solid: true, walkable: true, portalable: false, movable: true,
    color: CONSTANTS.COLOR_PLAYER, editorLabel: '◈ PLAYER', editorColor: '#ccccdd',
    unique: true, // Only one per level
  },
  4: {
    id: 4, name: 'EXIT',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_EXIT, editorLabel: '⊡ EXIT', editorColor: '#00ff88',
    unique: true,
  },
  5: {
    id: 5, name: 'BUTTON',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_BUTTON, editorLabel: '◎ BUTTON', editorColor: '#ffdd00',
  },
  6: {
    id: 6, name: 'DOOR',
    solid: true, walkable: false, portalable: false, movable: false,
    color: CONSTANTS.COLOR_DOOR, editorLabel: '▬ DOOR', editorColor: '#ff4444',
  },
  7: {
    id: 7, name: 'CUBE',
    solid: true, walkable: true, portalable: false, movable: true, // Can be pushed by player
    color: CONSTANTS.COLOR_CUBE, editorLabel: '⬡ CUBE', editorColor: '#aaaacc',
    movable: true, // Can be pushed by player
  },
  8: {
    id: 8, name: 'HAZARD',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_HAZARD, editorLabel: '⚠ HAZARD', editorColor: '#ff2244',
    lethal: true,
  },
  9: {
    id: 9, name: 'PORTAL_WALL',
    solid: true, walkable: false, portalable: true, movable: false,
    color: CONSTANTS.COLOR_WALL_ACCENT, editorLabel: '◧ P.WALL', editorColor: '#3a3a50',
  },
  10: {
    id: 10, name: 'EMITTER',
    solid: true, walkable: false, portalable: false, movable: false,
    color: CONSTANTS.COLOR_EMITTER, editorLabel: '◉ EMIT', editorColor: '#ff6a00',
  },
  11: {
    id: 11, name: 'RECEIVER',
    solid: true, walkable: false, portalable: false, movable: false,
    color: '#00ccff', editorLabel: '◎ RECV', editorColor: '#00ccff',
  },
  12: {
    id: 12, name: 'MOVABLE',
    solid: false, walkable: true, portalable: false, movable: true, // Can be pushed by player (same as CUBE)
    color: '#3a2a1a', editorLabel: '⬛ BLOCK', editorColor: '#3a2a1a',
  },
  13: {
    id: 13, name: 'STAIR_UP',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_STAIR_UP, editorLabel: '↑ STAIR▲', editorColor: '#2a4a3a',
  },
  14: {
    id: 14, name: 'STAIR_DOWN',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_STAIR_DOWN, editorLabel: '↓ STAIR▼', editorColor: '#3a2a4a',
  },
  15: {
    id: 15, name: 'FLOOR_HOLE',
    solid: false, walkable: true, portalable: false, movable: false,
    color: CONSTANTS.COLOR_FLOOR_HOLE, editorLabel: '⬡ HOLE', editorColor: '#151518',
  },
};

/**
 * Returns true if the tile type blocks player movement.
 * @param {number} tileId
 */
function isSolid(tileId) {
  return TileTypes[tileId]?.solid ?? true;
}

/**
 * Returns true if the tile type could be moved.
 * @param {number} tileId
 */
function isMovable(tileId) {
  return TileTypes[tileId]?.movable ?? true;
}

/**
 * Returns true if a portal can be placed on this tile.
 */
function isPortalable(tileId) {
  return TileTypes[tileId]?.portalable ?? false;
}
