// ========================
// 雀胡弈 — 配色与绘制工具
// ========================

export const C = {
  // 主色调
  bg: 0x1a2a1a,
  tableFelt: 0x2d5a2d,
  tableFeltDark: 0x234823,
  wood: 0x5a3a2a,
  woodLight: 0x7a5a3a,
  woodDark: 0x3a1a0a,
  woodFrame: 0x6b4a3a,

  // 牌色调
  tileFace: 0xfaf3e6,
  tileFaceDark: 0xe8dcc8,
  tileBack: 0x3a5a6a,
  tileBackBorder: 0x5a8a9a,
  tileBorder: 0xb8a080,
  tileShadow: 0x00000033,

  // 花色
  wanColor: '#2a5a8a',
  tiaoColor: '#2a6a3a',
  tongColor: '#8a3a2a',
  windColor: '#1a1a1a',
  dragonRed: '#c03030',
  dragonGreen: '#2a6a2a',

  // UI 色
  gold: '#e8c86a',
  goldDark: '#b09838',
  goldBright: '#ffd870',
  textLight: '#e8d8b0',
  textDim: '#908060',
  textDark: '#3a2a1a',
  accentRed: '#c04040',
  accentOrange: '#d08030',
  doraOrange: '#ff8c00',

  // 按钮
  btnNormal: 0x6b3a2a,
  btnHover: 0x8b4a3a,
  btnDisabled: 0x3a2a1a,
  btnGold: 0xb89840,
  btnGoldHover: 0xd8b850,

  // 槽位
  fuSlot: 0x2a3a2a,
  fuSlotBorder: 0x4a6a4a,
  toolSlot: 0x3a2a2a,
  toolSlotBorder: 0x6a4a3a,
};

export function drawRoundedRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: number,
  alpha = 1,
  stroke?: number,
  strokeWidth = 1,
) {
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, r);
  if (stroke !== undefined) {
    g.lineStyle(strokeWidth, stroke);
    g.strokeRoundedRect(x, y, w, h, r);
  }
}

export function drawTileFace(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor = C.tileFace,
) {
  // 阴影
  g.fillStyle(0x000000, 0.25);
  g.fillRoundedRect(x + 2, y + 3, w, h, 4);
  // 牌面
  g.fillStyle(fillColor);
  g.fillRoundedRect(x, y, w, h, 4);
  g.lineStyle(1, C.tileBorder);
  g.strokeRoundedRect(x, y, w, h, 4);
}

export function getSuitColor(suit: string): string {
  if (suit === 'wan') return C.wanColor;
  if (suit === 'tiao') return C.tiaoColor;
  if (suit === 'tong') return C.tongColor;
  return C.textDark;
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#a0a0a0',
    uncommon: '#5a9a5a',
    rare: '#5a5aff',
    legendary: '#ff8c00',
  };
  return colors[rarity] || '#a0a0a0';
}

export function getRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    S: '#ffd700',
    A: '#ff8c00',
    B: '#c0c0c0',
    C: '#a08060',
    D: '#6a4a3a',
  };
  return colors[rating] || '#fff';
}