import Phaser from 'phaser';
import { C, getSuitColor, getRarityColor } from '../ui/UITheme';
import { GameState, StageDef, PlayedHand, QueFuDef } from '@shared/types';
import { buildDeck, shuffleDeck, getTileDisplay } from '../systems/TileSystem';
import { fillHand, sortHand } from '../systems/HandSystem';
import { detectPlayable, getHandLabel } from '../systems/CombinationSystem';
import { calcPlayScore, settleRound } from '../systems/ScoringSystem';
import { ALL_FU_DEFS } from '../systems/FuSystem';
import { ALL_TOOLS } from '../systems/ToolSystem';

const TW = 100, TH = 130, GAP = 18;
const STAGES: StageDef[] = [
  { id: 'stage_1', name: '初阶坊市', targetScore: 400, maxPlays: 5, maxDiscards: 3, handSize: 5 },
  { id: 'stage_2', name: '四方雀馆', targetScore: 800, maxPlays: 4, maxDiscards: 3, handSize: 5 },
  { id: 'stage_3', name: '庄位试炼', targetScore: 1500, maxPlays: 4, maxDiscards: 2, handSize: 5 },
  { id: 'stage_4', name: '四境天阙', targetScore: 3000, maxPlays: 3, maxDiscards: 2, handSize: 5 },
];

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private selectedIds = new Set<string>();
  private locked = false;

  private scoreText!: Phaser.GameObjects.Text;
  private playsText!: Phaser.GameObjects.Text;
  private discardsText!: Phaser.GameObjects.Text;
  private wallText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  // 容器引用
  private tilesGroup: Phaser.GameObjects.Container[] = [];
  private fuGroup!: Phaser.GameObjects.Container;
  private toolGroup!: Phaser.GameObjects.Container;
  private historyGroup!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'GameScene' }); }

  init(data: { stageId?: string }) {
    const s = STAGES.find(st => st.id === (data.stageId || 'stage_1')) || STAGES[0];
    const deck = buildDeck();
    const wall = shuffleDeck(deck);
    for (let i = 0; i < 8; i++) wall[Math.floor(Math.random() * wall.length)].isDora = true;

    this.state = {
      stage: s, wall,
      hand: fillHand([], wall, s.handSize),
      playedHandsThisRound: [], playsRemaining: s.maxPlays,
      discardsRemaining: s.maxDiscards, currentScore: 0,
      selectedFus: ALL_FU_DEFS.slice(0, 3),
      selectedTools: ALL_TOOLS.slice(0, 2),
      doraIndicators: [],
    };
    this.selectedIds.clear();
    this.tilesGroup = [];
  }

  create() {
    const W = 1280, H = 800;
    this.cameras.main.setBackgroundColor('#141e14');

    // ====== 背景暗纹 ======
    const bg = this.add.graphics();
    for (let y = 0; y < H; y += 6) {
      bg.lineStyle(1, 0x1a2a1a, 0.15);
      bg.lineBetween(0, y + Math.sin(y * 0.03) * 3, W, y + Math.sin(y * 0.03 + 2) * 3);
    }

    // ====== 顶栏 ======
    this.drawTopBar();

    // ====== 三栏布局 ======
    this.fuGroup = this.add.container(0, 0);
    this.toolGroup = this.add.container(0, 0);
    this.historyGroup = this.add.container(W / 2, 155);

    this.drawFuPanel();
    this.drawToolPanel();

    // ====== 手牌 ======
    this.renderHand();

    // ====== 底栏按钮 ======
    this.drawBottomBar();

    // ====== 提示 ======
    this.hintText = this.add.text(W / 2, H - 14, '', {
      fontSize: '16px', color: C.textDim, fontFamily: 'serif',
    }).setOrigin(0.5);
    this.updateHint();
  }

  // ==================== 顶栏 ====================
  private drawTopBar() {
    const W = 1280;
    const g = this.add.graphics();
    g.fillStyle(0x151f15, 0.95);
    g.fillRoundedRect(12, 6, W - 24, 46, 8);
    g.lineStyle(1, C.goldDark, 0.3);
    g.strokeRoundedRect(12, 6, W - 24, 46, 8);

    const s = this.state;
    this.add.text(28, 14, `『${s.stage.name}』`, {
      fontSize: '20px', color: C.gold, fontFamily: 'serif', fontStyle: 'bold',
    });

    this.scoreText = this.add.text(210, 16, '', {
      fontSize: '18px', color: C.goldBright, fontFamily: 'serif',
    });

    this.playsText = this.add.text(W / 2 - 60, 16, '', {
      fontSize: '16px', color: C.textLight, fontFamily: 'serif',
    }).setOrigin(0.5, 0);

    this.discardsText = this.add.text(W / 2 + 120, 16, '', {
      fontSize: '15px', color: C.textDim, fontFamily: 'serif',
    });

    this.wallText = this.add.text(W - 28, 16, '', {
      fontSize: '15px', color: C.textDim, fontFamily: 'serif',
    }).setOrigin(1, 0);

    this.refreshInfo();
  }

  // ==================== 雀符面板（左侧） ====================
  private drawFuPanel() {
    this.fuGroup.removeAll(true);

    // 标题
    this.fuGroup.add(this.add.text(47, 68, '雀 符', {
      fontSize: '14px', color: C.gold, fontFamily: 'serif',
      letterSpacing: 4,
    }).setOrigin(0.5));

    const startY = 100;
    for (let i = 0; i < 8; i++) {
      const y = startY + i * 82;
      const g = this.add.graphics();

      if (i < this.state.selectedFus.length) {
        const fu = this.state.selectedFus[i];
        // 背景
        g.fillStyle(0x1a2e1a, 0.8);
        g.fillRoundedRect(10, y, 74, 74, 6);
        const borderColor = fu.rarity === 'legendary' ? 0xff8c00 :
          fu.rarity === 'rare' ? 0x4a6aff :
          fu.rarity === 'uncommon' ? 0x4a9a4a : 0x606060;
        g.lineStyle(1.5, borderColor, 0.7);
        g.strokeRoundedRect(10, y, 74, 74, 6);

        const name = this.add.text(47, y + 24, fu.name, {
          fontSize: '13px', color: '#e8d8b0', fontFamily: 'serif',
        }).setOrigin(0.5);

        const eff = this.fuShort(fu);
        const effColor = getRarityColor(fu.rarity);
        const effText = this.add.text(47, y + 50, eff, {
          fontSize: '11px', color: effColor, fontFamily: 'serif',
        }).setOrigin(0.5);

        this.fuGroup.add([g, name, effText]);
      } else {
        g.fillStyle(0x1a281a, 0.5);
        g.fillRoundedRect(12, y + 2, 70, 70, 5);
        g.lineStyle(1, 0x2a4a2a, 0.3);
        g.strokeRoundedRect(12, y + 2, 70, 70, 5);
        this.fuGroup.add(g);
      }
    }
  }

  private fuShort(fu: QueFuDef): string {
    const p: string[] = [];
    if (fu.hanBonus > 0) p.push(`+${fu.hanBonus}番`);
    if (fu.hanMultiplier > 1) p.push(`×${fu.hanMultiplier}`);
    return p.join(' ');
  }

  // ==================== 秘具面板（右侧） ====================
  private drawToolPanel() {
    this.toolGroup.removeAll(true);
    const rx = 1240;

    this.toolGroup.add(this.add.text(rx - 47, 68, '秘 具', {
      fontSize: '14px', color: C.gold, fontFamily: 'serif',
      letterSpacing: 4,
    }).setOrigin(0.5));

    const startY = 100;
    for (let i = 0; i < 5; i++) {
      const y = startY + i * 62;
      const g = this.add.graphics();

      if (i < this.state.selectedTools.length) {
        const tool = this.state.selectedTools[i];
        g.fillStyle(0x281a1a, 0.8);
        g.fillRoundedRect(rx - 54, y, 48, 54, 5);
        g.lineStyle(1, 0x6a4a3a, 0.6);
        g.strokeRoundedRect(rx - 54, y, 48, 54, 5);

        // 可点击
        const hitArea = this.add.rectangle(rx - 30, y + 27, 48, 54, 0x000000, 0)
          .setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => this.useTool(i));

        const name = this.add.text(rx - 30, y + 20, tool.name, {
          fontSize: '11px', color: '#e8d8b0', fontFamily: 'serif',
        }).setOrigin(0.5);
        const desc = this.add.text(rx - 30, y + 40, tool.description.slice(0, 7), {
          fontSize: '9px', color: C.textDim,
        }).setOrigin(0.5);

        this.toolGroup.add([g, name, desc]);
      } else {
        g.fillStyle(0x201a1a, 0.4);
        g.fillRoundedRect(rx - 52, y + 2, 44, 50, 4);
        g.lineStyle(1, 0x3a2a2a, 0.2);
        g.strokeRoundedRect(rx - 52, y + 2, 44, 50, 4);
        this.toolGroup.add(g);
      }
    }
  }

  // ==================== 手牌 ====================
  private renderHand() {
    this.tilesGroup.forEach(c => c.destroy());
    this.tilesGroup = [];

    const hand = this.state.hand;
    const totalW = hand.length * TW + (hand.length - 1) * GAP;
    const startX = (1280 - totalW) / 2;
    const baseY = 590;

    const allPlayable = detectPlayable(hand);
    const selArr = Array.from(this.selectedIds);
    let comboIds = new Set<string>();
    if (selArr.length >= 2) {
      for (const ph of allPlayable) {
        const pids = new Set(ph.tiles.map(t => t.id));
        if (selArr.every(id => pids.has(id))) {
          pids.forEach(id => comboIds.add(id));
        }
      }
    }

    hand.forEach((tile, idx) => {
      const x = startX + idx * (TW + GAP) + TW / 2;
      const sel = this.selectedIds.has(tile.id);
      const combo = comboIds.has(tile.id);
      const lift = sel ? -24 : 0;

      const c = this.add.container(x, baseY + lift);

      // 阴影
      const sh = this.add.graphics();
      sh.fillStyle(0x000000, 0.2);
      sh.fillRoundedRect(-TW / 2 + 3, -TH / 2 + 4, TW + 2, TH + 2, 9);

      // 牌面
      const face = this.add.graphics();
      const faceColor = tile.isDora ? 0xfffae8 : 0xfffef5;
      face.fillStyle(faceColor);
      face.fillRoundedRect(-TW / 2, -TH / 2, TW, TH, 8);
      face.lineStyle(1.5, tile.isDora ? 0xd4a040 : 0xc8b898);
      face.strokeRoundedRect(-TW / 2, -TH / 2, TW, TH, 8);
      face.lineStyle(0.5, tile.isDora ? 0xd4a040 : 0xdcd0c0, 0.5);
      face.strokeRoundedRect(-TW / 2 + 9, -TH / 2 + 9, TW - 18, TH - 18, 5);

      // 选中高亮
      if (sel) {
        const hl = this.add.graphics();
        hl.lineStyle(4, 0xffb830, 0.9);
        hl.strokeRoundedRect(-TW / 2 - 2, -TH / 2 - 2, TW + 4, TH + 4, 10);
        c.add(hl);
      }

      // 组合提示
      if (combo && !sel) {
        const gl = this.add.graphics();
        gl.fillStyle(0x4488ff, 0.1);
        gl.fillRoundedRect(-TW / 2 - 3, -TH / 2 - 3, TW + 6, TH + 6, 10);
        c.add(gl);
      }

      // 文字
      const display = getTileDisplay(tile);
      let tc: string;
      if (tile.type === 'numeral') tc = getSuitColor(tile.suit!);
      else if (tile.type === 'dragon') {
        tc = tile.dragon === 'fa' ? '#1a6a1a' : '#b02020';
      } else tc = '#1a1a1a';

      // 大字
      const big = this.add.text(0, -2, display, {
        fontSize: '32px', color: tc, fontFamily: 'serif', fontStyle: 'bold',
      }).setOrigin(0.5);

      // 角标
      const corner = this.add.text(-TW / 2 + 14, -TH / 2 + 10, display, {
        fontSize: '12px', color: tc, fontFamily: 'serif', fontStyle: 'bold',
      });

      // 宝牌
      if (tile.isDora) {
        const dd = this.add.text(TW / 2 - 16, -TH / 2 + 14, '✦', {
          fontSize: '14px', color: '#ff8c00',
        }).setOrigin(0.5);
        c.add(dd);
      }

      c.add([sh, face, corner, big]);
      c.setSize(TW, TH);
      c.setInteractive({ useHandCursor: true });

      c.on('pointerdown', () => { if (!this.locked) this.toggle(tile.id); });
      c.on('pointerover', () => {
        if (!sel) this.tweens.add({ targets: c, y: baseY - 6, duration: 80 });
      });
      c.on('pointerout', () => {
        if (!sel) this.tweens.add({ targets: c, y: baseY, duration: 80 });
      });

      this.tilesGroup.push(c);
    });
  }

  private toggle(id: string) {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else {
      this.selectedIds.add(id);
      if (this.selectedIds.size > 3) {
        this.selectedIds.delete(Array.from(this.selectedIds)[0]);
      }
    }
    this.renderHand();
    this.updateHint();
  }

  // ==================== 底栏 ====================
  private drawBottomBar() {
    const W = 1280, H = 800;
    const by = H - 46;

    const g = this.add.graphics();
    g.fillStyle(0x151f15, 0.9);
    g.fillRoundedRect(12, H - 52, W - 24, 42, 8);
    g.lineStyle(1, C.goldDark, 0.2);
    g.strokeRoundedRect(12, H - 52, W - 24, 42, 8);

    this.makeBtn(W / 2 - 175, by, ' 出  牌 ', 'btn-gold', () => this.doPlay());
    this.makeBtn(W / 2, by, ' 弃  牌 ', 'btn-normal', () => this.doDiscard());
    this.makeBtn(W / 2 + 175, by, ' 排  序 ', 'btn-normal', () => this.doSort());
  }

  private makeBtn(x: number, y: number, label: string, tex: string, cb: () => void) {
    const bg = this.add.image(x, y, tex).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, {
      fontSize: '19px', color: '#e8d8b0', fontFamily: 'serif',
    }).setOrigin(0.5);
    const hover = tex === 'btn-gold' ? 'btn-gold-hover' : 'btn-hover';
    bg.on('pointerover', () => bg.setTexture(hover));
    bg.on('pointerout', () => bg.setTexture(tex));
    bg.on('pointerdown', cb);
  }

  // ==================== 操作 ====================
  private doPlay() {
    if (this.locked || this.state.playsRemaining <= 0) return;
    if (this.selectedIds.size < 2) { this.flash('请选择2~3张牌组成牌型'); return; }

    const tiles = this.state.hand.filter(t => this.selectedIds.has(t.id));
    const playable = detectPlayable(tiles).filter(h => h.tiles.length === tiles.length);
    if (!playable.length) { this.flash('无效牌型！对子=2同 / 顺子=3同花连续 / 刻子=3同'); return; }

    this.locked = true;
    const hand = playable[0];
    const { score } = calcPlayScore(hand, this.state.selectedFus);

    const rmIds = new Set(hand.tiles.map(t => t.id));
    this.state.hand = this.state.hand.filter(t => !rmIds.has(t.id));
    this.state.hand = fillHand(this.state.hand, this.state.wall, this.state.stage.handSize);

    this.state.currentScore += score;
    this.state.playsRemaining--;
    this.state.playedHandsThisRound.push(hand);
    this.selectedIds.clear();

    this.popScore(score);
    this.flash(`${getHandLabel(hand)}  +${score} 分`);
    this.refreshAll();

    this.time.delayedCall(450, () => { this.locked = false; this.checkEnd(); });
  }

  private doDiscard() {
    if (this.locked || this.state.discardsRemaining <= 0) return;
    if (!this.selectedIds.size) { this.flash('请选择要弃的牌'); return; }

    this.locked = true;
    const rmIds = new Set(this.selectedIds);
    this.state.hand = this.state.hand.filter(t => !rmIds.has(t.id));
    this.state.hand = fillHand(this.state.hand, this.state.wall, this.state.stage.handSize);
    this.state.discardsRemaining--;
    this.selectedIds.clear();

    this.flash('已弃牌并补满');
    this.refreshAll();
    this.time.delayedCall(350, () => { this.locked = false; });
  }

  private doSort() {
    this.state.hand = sortHand(this.state.hand);
    this.selectedIds.clear();
    this.flash('已排序');
    this.renderHand();
  }

  private useTool(i: number) {
    if (this.locked) return;
    const tool = this.state.selectedTools[i];
    if (!tool) return;

    this.locked = true;
    switch (tool.id) {
      case 'huan_pai_tou':
        for (let n = 0; n < Math.min(3, this.state.hand.length); n++) {
          this.state.hand.pop();
          if (this.state.wall.length) this.state.hand.push(this.state.wall.pop()!);
        }
        this.state.hand = fillHand(this.state.hand, this.state.wall, this.state.stage.handSize);
        break;
      case 'si_an_ling':
        this.state.currentScore += 200;
        break;
      case 'tian_yun_pai':
        if (this.state.wall.length) {
          this.state.hand.push(this.state.wall.pop()!);
          this.state.hand = sortHand(this.state.hand);
        }
        break;
    }
    this.state.selectedTools.splice(i, 1);
    this.selectedIds.clear();
    this.flash(`使用: ${tool.name}`);
    this.refreshAll();
    this.time.delayedCall(350, () => { this.locked = false; });
  }

  private checkEnd() {
    const s = this.state;
    if (s.currentScore >= s.stage.targetScore) {
      this.flash('通关！');
      this.time.delayedCall(1000, () => this.goSettle());
    } else if (s.playsRemaining <= 0) {
      this.flash('出牌次数用尽');
      this.time.delayedCall(1200, () => this.goSettle());
    }
  }

  private goSettle() {
    this.scene.start('SettlementScene', {
      ...settleRound(this.state),
      _stageId: this.state.stage.id,
    });
  }

  // ==================== 刷新 ====================
  private refreshAll() {
    this.refreshInfo();
    this.renderHand();
    this.drawFuPanel();
    this.drawToolPanel();
    this.updateHistory();
  }

  private refreshInfo() {
    const s = this.state;
    this.scoreText.setText(`得分 ${s.currentScore} / ${s.stage.targetScore}`);
    this.playsText.setText(`出牌 ${s.playsRemaining}/${s.stage.maxPlays}`);
    this.discardsText.setText(`弃牌 ${s.discardsRemaining}/${s.stage.maxDiscards}`);
    this.wallText.setText(`牌山 ${s.wall.length}`);
  }

  private updateHistory() {
    this.historyGroup.removeAll(true);
    this.historyGroup.add(this.add.text(0, -24, '— 打出记录 —', {
      fontSize: '13px', color: C.textDim, fontFamily: 'serif',
    }).setOrigin(0.5));

    this.state.playedHandsThisRound.forEach((h, i) => {
      const label = getHandLabel(h);
      const tiles = h.tiles.map(t => getTileDisplay(t)).join(' ');
      const { score } = calcPlayScore(h, this.state.selectedFus);
      this.historyGroup.add(
        this.add.text(0, i * 26, `${label}  ${tiles}   +${score}`, {
          fontSize: '15px', color: C.textLight, fontFamily: 'serif',
        }).setOrigin(0.5)
      );
    });
  }

  private updateHint() {
    const sel = Array.from(this.selectedIds);
    if (sel.length < 2) {
      this.hintText.setText('点击牌面选择 2~3 张，组成对子(2同) / 顺子(3同花连续) / 刻子(3同)');
      return;
    }
    const tiles = this.state.hand.filter(t => this.selectedIds.has(t.id));
    const ok = detectPlayable(tiles).filter(h => h.tiles.length === sel.length);
    if (ok.length) {
      const labels = [...new Set(ok.map(h => getHandLabel(h)))].join('/');
      const s = calcPlayScore(ok[0], this.state.selectedFus);
      this.hintText.setText(`${labels} · 预计 +${s.score} 分 → 点击「出牌」`);
    } else {
      this.hintText.setText('当前选择无法组成有效牌型，请重新选择');
    }
  }

  private flash(msg: string) {
    this.hintText.setText(msg);
    this.time.delayedCall(2800, () => { if (this.hintText.text === msg) this.updateHint(); });
  }

  private popScore(score: number) {
    const t = this.add.text(640, 420, `+${score}`, {
      fontSize: '56px', color: C.gold, fontFamily: 'serif', fontStyle: 'bold',
      stroke: '#00000055', strokeThickness: 5,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: t, y: 340, alpha: 1, duration: 500, ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: t, alpha: 0, y: 300, duration: 450,
          onComplete: () => t.destroy(),
        });
      },
    });
  }
}