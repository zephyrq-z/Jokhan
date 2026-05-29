import Phaser from 'phaser';
import { C, drawRoundedRect } from '../ui/UITheme';

const TW = 100;  // 牌宽
const TH = 130;  // 牌高

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createTextures();
  }

  create() {
    this.scene.start('MenuScene');
  }

  private createTextures() {
    const g = this.add.graphics();

    // --- 牌背 ---
    g.clear();
    g.fillStyle(0x1e3a4a);
    g.fillRoundedRect(0, 0, TW, TH, 8);
    g.lineStyle(2, 0x4a7a9a);
    g.strokeRoundedRect(0, 0, TW, TH, 8);
    // 内框
    g.lineStyle(1, 0x3a6a8a, 0.6);
    g.strokeRoundedRect(6, 6, TW - 12, TH - 12, 5);
    // 中心菱形
    g.fillStyle(0x3a6a8a, 0.4);
    g.fillRect(TW / 2 - 16, TH / 2 - 18, 32, 36);
    g.lineStyle(1, 0x5a8aaa, 0.3);
    g.lineBetween(TW / 2, TH / 2 - 28, TW / 2, TH / 2 + 28);
    g.lineBetween(TW / 2 - 28, TH / 2, TW / 2 + 28, TH / 2);
    g.generateTexture('tile-back', TW, TH);

    // --- 牌面底 ---
    g.clear();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(2, 3, TW, TH, 8);
    g.fillStyle(0xfffef5);
    g.fillRoundedRect(0, 0, TW, TH, 8);
    g.lineStyle(1.5, 0xb8a080);
    g.strokeRoundedRect(0, 0, TW, TH, 8);
    g.generateTexture('tile-face', TW, TH);

    // --- 选中边框 ---
    g.clear();
    g.lineStyle(4, 0xffc840, 0.95);
    g.strokeRoundedRect(1, 1, TW - 2, TH - 2, 8);
    g.generateTexture('tile-selected', TW, TH);

    // --- 宝牌牌面 ---
    g.clear();
    g.fillStyle(0x000000, 0.15);
    g.fillRoundedRect(2, 3, TW, TH, 8);
    g.fillStyle(0xfffde8);
    g.fillRoundedRect(0, 0, TW, TH, 8);
    g.lineStyle(2, 0xd4a040);
    g.strokeRoundedRect(0, 0, TW, TH, 8);
    g.generateTexture('tile-dora', TW, TH);

    // --- 按钮 ---
    const btnW = 150, btnH = 48;
    g.clear();
    drawRoundedRect(g, 0, 0, btnW, btnH, 8, C.btnNormal, 1, C.woodLight, 1.5);
    g.generateTexture('btn-normal', btnW, btnH);

    g.clear();
    drawRoundedRect(g, 0, 0, btnW, btnH, 8, C.btnHover, 1, C.gold, 2);
    g.generateTexture('btn-hover', btnW, btnH);

    g.clear();
    drawRoundedRect(g, 0, 0, btnW, btnH, 8, C.btnDisabled, 1, 0x5a4a3a, 1);
    g.generateTexture('btn-disabled', btnW, btnH);

    g.clear();
    drawRoundedRect(g, 0, 0, btnW, btnH, 8, C.btnGold, 1, C.goldBright, 2);
    g.generateTexture('btn-gold', btnW, btnH);

    g.clear();
    drawRoundedRect(g, 0, 0, btnW, btnH, 8, C.btnGoldHover, 1, C.goldBright, 2.5);
    g.generateTexture('btn-gold-hover', btnW, btnH);

    // 小按钮
    g.clear();
    drawRoundedRect(g, 0, 0, 90, 38, 6, C.btnNormal, 1, C.woodLight, 1.5);
    g.generateTexture('btn-small', 90, 38);

    // 雀符槽
    g.clear();
    drawRoundedRect(g, 0, 0, 66, 84, 5, C.fuSlot, 1, C.fuSlotBorder, 1);
    g.generateTexture('fu-slot', 66, 84);

    // 秘具槽
    g.clear();
    drawRoundedRect(g, 0, 0, 52, 64, 4, C.toolSlot, 1, C.toolSlotBorder, 1);
    g.generateTexture('tool-slot', 52, 64);

    g.destroy();
  }
}