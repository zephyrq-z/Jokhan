import { Tile, PlayedHand } from '@shared/types';
import { getTileSortKey } from './TileSystem';

export function drawTile(wall: Tile[]): Tile | null {
  if (wall.length === 0) return null;
  return wall.pop()!;
}

export function discardTiles(state: { hand: Tile[]; wall: Tile[] }, tileIds: string[]): number {
  let removed = 0;
  for (const id of tileIds) {
    const idx = state.hand.findIndex(t => t.id === id);
    if (idx !== -1) {
      state.hand.splice(idx, 1);
      removed++;
    }
  }
  // 补牌
  for (let i = 0; i < removed; i++) {
    const t = drawTile(state.wall);
    if (t) state.hand.push(t);
  }
  state.hand = sortHand(state.hand);
  return removed;
}

export function removeTiles(hand: Tile[], tileIds: string[]): Tile[] {
  const removed: Tile[] = [];
  const idSet = new Set(tileIds);
  return hand.filter(t => {
    if (idSet.has(t.id)) {
      removed.push(t);
      return false;
    }
    return true;
  });
}

export function fillHand(hand: Tile[], wall: Tile[], targetSize: number): Tile[] {
  const filled = [...hand];
  while (filled.length < targetSize && wall.length > 0) {
    filled.push(wall.pop()!);
  }
  return sortHand(filled);
}

export function sortHand(hand: Tile[]): Tile[] {
  return [...hand].sort((a, b) => getTileSortKey(a) - getTileSortKey(b));
}

export function tilesEqual(a: Tile, b: Tile): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'numeral') return a.suit === b.suit && a.rank === b.rank;
  if (a.type === 'wind') return a.wind === b.wind;
  if (a.type === 'dragon') return a.dragon === b.dragon;
  return false;
}

export function tileKey(tile: Tile): string {
  if (tile.type === 'numeral') return `N_${tile.suit}_${tile.rank}`;
  if (tile.type === 'wind') return `W_${tile.wind}`;
  if (tile.type === 'dragon') return `D_${tile.dragon}`;
  return '?';
}