import Phaser from 'phaser';
import { C } from '../ui/UITheme';

export class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const W = 1280, H = 800, cx = W / 2;
    this.cameras.main.setBackgroundColor('#121a12');

    // 暗纹背景
    const bg = this.add.graphics();
    for (let y = 0; y < H; y += 5) {
      bg.lineStyle(1, 0x1a2a1a, 0.12);
      bg.lineBetween(0, y + Math.sin(y * 0.02) * 4, W, y + Math.sin(y * 0.02 + 1.5) * 4);
    }

    // 外框
    const fg = this.add.graphics();
    fg.lineStyle(1, C.goldDark, 0.35);
    fg.strokeRoundedRect(cx - 280, 70, 560, H - 140, 16);
    fg.lineStyle(1, C.goldDark, 0.15);
    fg.strokeRoundedRect(cx - 270, 80, 540, H - 160, 12);

    // 四角纹
    [[cx - 295, 55, 1, 1], [cx + 295, 55, -1, 1],
     [cx - 295, H - 55, 1, -1], [cx + 295, H - 55, -1, -1]]
      .forEach(([x, y, dx, dy]) => {
        const g = this.add.graphics();
        g.lineStyle(2, C.gold, 0.25);
        g.lineBetween(x, y, x + 28 * dx, y);
        g.lineBetween(x, y, x, y + 28 * dy);
        g.lineBetween(x + 8 * dx, y + 16 * dy, x + 20 * dx, y + 16 * dy);
        g.lineBetween(x + 20 * dx, y + 8 * dy, x + 20 * dx, y + 16 * dy);
      });

    // 标题
    this.add.text(cx + 2, 142, '雀 胡 弈', {
      fontSize: '84px', fontFamily: 'serif', color: '#00000033',
    }).setOrigin(0.5);

    this.add.text(cx, 140, '雀 胡 弈', {
      fontSize: '84px', fontFamily: 'serif', color: C.gold,
      stroke: C.goldDark, strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(cx, 205, 'J O K H A N', {
      fontSize: '18px', fontFamily: 'serif', color: C.textDim, letterSpacing: 8,
    }).setOrigin(0.5);

    // 分隔
    const sep = this.add.graphics();
    sep.lineStyle(1, C.gold, 0.3);
    sep.lineBetween(cx - 90, 230, cx + 90, 230);

    this.add.text(cx, 258, '— Roguelike  麻将牌型构筑 —', {
      fontSize: '15px', fontFamily: 'serif', color: C.textDim,
    }).setOrigin(0.5);

    // 按钮
    this.makeBtn(cx, 360, '开 始 游 戏', 'btn-gold', () => {
      this.scene.start('GameScene', { stageId: 'stage_1' });
    });
    this.makeBtn(cx, 425, '雀 符 图 鉴', 'btn-disabled', undefined, true);

    // 底部
    this.add.text(cx, 530, '摸牌 · 组牌 · 叠番 · 闯关', {
      fontSize: '13px', color: C.textDim, fontFamily: 'serif',
    }).setOrigin(0.5);
    this.add.text(cx, H - 50, 'v1.0.0 MVP', {
      fontSize: '11px', color: C.textDim, fontFamily: 'serif',
    }).setOrigin(0.5);
  }

  private makeBtn(x: number, y: number, label: string, tex: string, cb?: () => void, disabled = false) {
    const bg = this.add.image(x, y, tex).setInteractive({ useHandCursor: !disabled });
    this.add.text(x, y, label, {
      fontSize: '21px', color: disabled ? C.textDim : '#e8d8b0', fontFamily: 'serif',
    }).setOrigin(0.5);
    if (!disabled && cb) {
      const hover = tex === 'btn-gold' ? 'btn-gold-hover' : 'btn-hover';
      bg.on('pointerover', () => bg.setTexture(hover));
      bg.on('pointerout', () => bg.setTexture(tex));
      bg.on('pointerdown', cb);
    }
  }
}