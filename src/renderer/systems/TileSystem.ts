import { Tile, Suit, Wind, Dragon } from '@shared/types';

let tileCounter = 0;

export function createTile(
  type: 'numeral' | 'wind' | 'dragon',
  suitOrWind?: Suit | Wind,
  rankOrDragon?: number | Dragon,
): Tile {
  const tile: Tile = {
    id: `tile_${++tileCounter}`,
    type,
    isDora: false,
  };

  if (type === 'numeral') {
    tile.suit = suitOrWind as Suit;
    tile.rank = rankOrDragon as number;
  } else if (type === 'wind') {
    tile.wind = suitOrWind as Wind;
  } else if (type === 'dragon') {
    tile.dragon = rankOrDragon as Dragon;
  }

  return tile;
}

export function buildDeck(): Tile[] {
  const deck: Tile[] = [];
  const suits: Suit[] = ['wan', 'tiao', 'tong'];

  // 序数牌 108 张
  for (const suit of suits) {
    for (let rank = 1; rank <= 9; rank++) {
      for (let i = 0; i < 4; i++) {
        deck.push(createTile('numeral', suit, rank));
      }
    }
  }

  // 风牌 16 张
  const winds: Wind[] = ['east', 'south', 'west', 'north'];
  for (const wind of winds) {
    for (let i = 0; i < 4; i++) {
      deck.push(createTile('wind', wind));
    }
  }

  // 箭牌 12 张
  const dragons: Dragon[] = ['zhong', 'fa', 'bai'];
  for (const dragon of dragons) {
    for (let i = 0; i < 4; i++) {
      deck.push(createTile('dragon', undefined, dragon));
    }
  }

  return deck; // 136 张
}

export function shuffleDeck(deck: Tile[]): Tile[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTileDisplay(tile: Tile): string {
  if (tile.type === 'numeral') {
    const suitNames: Record<Suit, string> = { wan: '万', tiao: '条', tong: '筒' };
    const numMap = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return `${numMap[tile.rank!]}${suitNames[tile.suit!]}`;
  }
  if (tile.type === 'wind') {
    const windNames: Record<Wind, string> = { east: '東', south: '南', west: '西', north: '北' };
    return windNames[tile.wind!];
  }
  if (tile.type === 'dragon') {
    const dragonNames: Record<Dragon, string> = { zhong: '中', fa: '發', bai: '白' };
    return dragonNames[tile.dragon!];
  }
  return '?';
}

export function getTileSortKey(tile: Tile): number {
  if (tile.type === 'numeral') {
    const suitOffsets: Record<Suit, number> = { wan: 0, tiao: 100, tong: 200 };
    return suitOffsets[tile.suit!] + tile.rank!;
  }
  if (tile.type === 'wind') {
    const windOrder: Record<Wind, number> = { east: 300, south: 301, west: 302, north: 303 };
    return windOrder[tile.wind!];
  }
  if (tile.type === 'dragon') {
    const dragonOrder: Record<Dragon, number> = { zhong: 400, fa: 401, bai: 402 };
    return dragonOrder[tile.dragon!];
  }
  return 999;
}