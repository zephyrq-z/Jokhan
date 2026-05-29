import Phaser from 'phaser';
import { C, getRatingColor } from '../ui/UITheme';
import { Settlement } from '@shared/types';

export class SettlementScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettlementScene' });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;
    const settlement = this.scene.settings.data as Settlement;

    // 暗色底
    const g = this.add.graphics();
    g.fillStyle(C.bg, 0.95);
    g.fillRect(0, 0, width, height);

    // 标题底色
    g.fillStyle(0x1a2a1a, 0.8);
    g.fillRoundedRect(cx - 260, 40, 520, height - 80, 16);
    g.lineStyle(2, C.goldDark, 0.5);
    g.strokeRoundedRect(cx - 260, 40, 520, height - 80, 16);

    // 评级
    const ratingColor = getRatingColor(settlement.rating);
    const ratingText = this.add.text(cx, 90, settlement.rating, {
      fontSize: '100px',
      color: ratingColor,
      fontFamily: 'serif',
      fontStyle: 'bold',
      stroke: '#00000044',
      strokeThickness: 6,
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: ratingText,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    const ratingLabel = settlement.finalScore >= settlement.targetScore ? '通关成功' : '未达标';
    this.add.text(cx, 160, ratingLabel, {
      fontSize: '24px',
      color: ratingColor,
      fontFamily: 'serif',
    }).setOrigin(0.5);

    // 分隔线
    g.lineStyle(1, C.gold, 0.3);
    g.lineBetween(cx - 160, 185, cx + 160, 185);

    // 得分信息
    let infoY = 210;
    const infoGap = 34;

    this.addInfoRow(cx, infoY, '最终得分', `${settlement.finalScore}`);
    infoY += infoGap;
    this.addInfoRow(cx, infoY, '目标分数', `${settlement.targetScore}`);
    infoY += infoGap;

    // 雀符加成
    if (settlement.fuMultiplier > 1 || settlement.fuBonus > 0) {
      const fuParts: string[] = [];
      if (settlement.fuBonus > 0) fuParts.push(`+${settlement.fuBonus}番`);
      if (settlement.fuMultiplier > 1) fuParts.push(`×${settlement.fuMultiplier}`);
      this.addInfoRow(cx, infoY, '雀符加成', fuParts.join(' '));
      infoY += infoGap;
    }

    // 打出牌型
    if (settlement.handsPlayed.length > 0) {
      infoY += 10;
      this.add.text(cx, infoY, '— 本局打出 —', {
        fontSize: '14px', color: C.textDim, fontFamily: 'serif',
      }).setOrigin(0.5);
      infoY += 30;

      for (const h of settlement.handsPlayed) {
        const label = h.type === 'duizi' ? '对子' : h.type === 'shunzi' ? '顺子' : '刻子';
        this.addInfoRow(cx, infoY, label, `+${h.baseHan}番`);
        infoY += 24;
      }
    }

    // 按钮
    const btnY = Math.max(infoY + 50, height - 80);
    const btnGold = this.add.image(cx - 100, btnY, 'btn-gold').setInteractive({ useHandCursor: true });
    this.add.text(cx - 100, btnY, '继续闯关', {
      fontSize: '18px', color: C.textLight, fontFamily: 'serif',
    }).setOrigin(0.5);

    const nextStage = this.getNextStage();
    btnGold.on('pointerover', () => btnGold.setTexture('btn-gold-hover'));
    btnGold.on('pointerout', () => btnGold.setTexture('btn-gold'));
    btnGold.on('pointerdown', () => {
      if (settlement.finalScore >= settlement.targetScore) {
        this.scene.start('GameScene', { stageId: nextStage });
      }
    });

    if (!settlement.finalScore || settlement.finalScore < settlement.targetScore) {
      btnGold.setTexture('btn-disabled');
    }

    const btnNormal = this.add.image(cx + 100, btnY, 'btn-normal').setInteractive({ useHandCursor: true });
    this.add.text(cx + 100, btnY, '返回主菜单', {
      fontSize: '18px', color: C.textLight, fontFamily: 'serif',
    }).setOrigin(0.5);
    btnNormal.on('pointerover', () => btnNormal.setTexture('btn-hover'));
    btnNormal.on('pointerout', () => btnNormal.setTexture('btn-normal'));
    btnNormal.on('pointerdown', () => this.scene.start('MenuScene'));

    // 装饰
    this.drawDecor(cx - 240, 60, 1, 1);
    this.drawDecor(cx + 240, 60, -1, 1);
    this.drawDecor(cx - 240, height - 60, 1, -1);
    this.drawDecor(cx + 240, height - 60, -1, -1);
  }

  private addInfoRow(x: number, y: number, label: string, value: string) {
    this.add.text(x - 120, y, label, {
      fontSize: '18px', color: C.textDim, fontFamily: 'serif',
    });
    this.add.text(x + 120, y, value, {
      fontSize: '18px', color: C.gold, fontFamily: 'serif', fontStyle: 'bold',
    }).setOrigin(1, 0);
  }

  private getNextStage(): string {
    const stages = ['stage_1', 'stage_2', 'stage_3', 'stage_4'];
    const data = this.scene.settings.data as Record<string, unknown>;
    const current = (data._stageId as string) || 'stage_1';
    const idx = stages.indexOf(current);
    return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : stages[0];
  }

  private drawDecor(x: number, y: number, dx: number, dy: number) {
    const g = this.add.graphics();
    g.lineStyle(2, C.gold, 0.3);
    g.lineBetween(x, y, x + 24 * dx, y);
    g.lineBetween(x, y, x, y + 24 * dy);
  }
}