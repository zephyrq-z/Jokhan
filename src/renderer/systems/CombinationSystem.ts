import { Tile, HandType, PlayedHand, HAND_TYPE_CONFIG } from '@shared/types';
import { tilesEqual } from './HandSystem';

// 从手牌中检测可打出的组合
export function detectPlayable(tiles: Tile[]): PlayedHand[] {
  const results: PlayedHand[] = [];
  const n = tiles.length;

  // 检测对子（2张相同）
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (tilesEqual(tiles[i], tiles[j])) {
        const config = HAND_TYPE_CONFIG.duizi;
        results.push({
          type: 'duizi',
          tiles: [tiles[i], tiles[j]],
          baseHan: config.han,
          baseMultiplier: config.mult,
        });
      }
    }
  }

  // 检测刻子（3张相同）
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (!tilesEqual(tiles[i], tiles[j])) continue;
      for (let k = j + 1; k < n; k++) {
        if (tilesEqual(tiles[i], tiles[k])) {
          const config = HAND_TYPE_CONFIG.kezi;
          results.push({
            type: 'kezi',
            tiles: [tiles[i], tiles[j], tiles[k]],
            baseHan: config.han,
            baseMultiplier: config.mult,
          });
        }
      }
    }
  }

  // 检测顺子（3张连续同花色）
  for (let i = 0; i < n; i++) {
    const a = tiles[i];
    if (a.type !== 'numeral' || a.rank! > 7) continue;
    for (let j = 0; j < n; j++) {
      const b = tiles[j];
      if (b.type !== 'numeral' || b.suit !== a.suit || b.rank !== a.rank! + 1) continue;
      for (let k = 0; k < n; k++) {
        const c = tiles[k];
        if (c.type !== 'numeral' || c.suit !== a.suit || c.rank !== a.rank! + 2) continue;
        const config = HAND_TYPE_CONFIG.shunzi;
        results.push({
          type: 'shunzi',
          tiles: [a, b, c],
          baseHan: config.han,
          baseMultiplier: config.mult,
        });
      }
    }
  }

  // 去重（按 tile id 集合去重）
  return dedupeHands(results);
}

function dedupeHands(hands: PlayedHand[]): PlayedHand[] {
  const seen = new Set<string>();
  return hands.filter(h => {
    const key = h.type + '|' + h.tiles.map(t => t.id).sort().join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getHandLabel(hand: PlayedHand): string {
  if (hand.type === 'none') return '';
  return HAND_TYPE_CONFIG[hand.type].label;
}