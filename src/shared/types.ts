// ========================
// 牌张类型
// ========================
export type Suit = 'wan' | 'tiao' | 'tong';
export type Wind = 'east' | 'south' | 'west' | 'north';
export type Dragon = 'zhong' | 'fa' | 'bai';

export interface Tile {
  id: string;
  type: 'numeral' | 'wind' | 'dragon';
  suit?: Suit;
  rank?: number;
  wind?: Wind;
  dragon?: Dragon;
  isDora: boolean;
}

// ========================
// 手牌组合类型（5张制）
// ========================
export type HandType = 'duizi' | 'shunzi' | 'kezi' | 'none';

export interface PlayedHand {
  type: HandType;
  tiles: Tile[];
  baseHan: number;
  baseMultiplier: number;
}

// ========================
// 雀符
// ========================
export type FuRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface QueFuDef {
  id: string;
  name: string;
  rarity: FuRarity;
  description: string;
  price: number;
  hanBonus: number;
  hanMultiplier: number;
}

// ========================
// 秘具
// ========================
export interface ToolDef {
  id: string;
  name: string;
  description: string;
  price: number;
  maxPerRound: number;
}

// ========================
// 关卡
// ========================
export interface StageDef {
  id: string;
  name: string;
  targetScore: number;
  maxPlays: number;
  maxDiscards: number;
  handSize: number;
}

// ========================
// 游戏状态
// ========================
export interface GameState {
  stage: StageDef;
  wall: Tile[];
  hand: Tile[];
  playedHandsThisRound: PlayedHand[];
  playsRemaining: number;
  discardsRemaining: number;
  currentScore: number;
  selectedFus: QueFuDef[];
  selectedTools: ToolDef[];
  doraIndicators: Tile[];
}

// ========================
// 结算
// ========================
export type Rating = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Settlement {
  finalScore: number;
  targetScore: number;
  rating: Rating;
  handsPlayed: PlayedHand[];
  fuBonus: number;
  fuMultiplier: number;
}

// ========================
// 评分映射
// ========================
export const HAND_TYPE_CONFIG: Record<HandType, { han: number; mult: number; label: string }> = {
  duizi: { han: 1, mult: 1, label: '对子' },
  shunzi: { han: 2, mult: 1.5, label: '顺子' },
  kezi: { han: 3, mult: 2, label: '刻子' },
  none: { han: 0, mult: 1, label: '' },
};