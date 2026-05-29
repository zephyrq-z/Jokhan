# 雀胡弈 (Jokhan) — 需求规格文档

## 1. 项目概述

### 1.1 产品定位
Roguelike 麻将卡牌构筑单机游戏，核心循环：**闯关 → 获得金币/雀符 → 构筑牌组 → 挑战更高难度**。

### 1.2 目标平台
- 第一阶段：PC（Web/Mac/Windows）
- 第二阶段：移动端适配

### 1.3 技术选型

**确定方案：Electron + TypeScript + Phaser 3**

| 层 | 技术 | 用途 |
|----|------|------|
| 桌面容器 | Electron | 跨平台桌面应用，打包 DMG/EXE |
| 游戏引擎 | Phaser 3 | 2D 渲染、场景管理、动画、输入 |
| 语言 | TypeScript | 类型安全、代码组织 |
| 打包 | electron-builder | 一键出 DMG / EXE / AppImage |
| 构建 | Vite | 快速 HMR 开发体验 |

**选型理由**：
- Electron 是 2D 卡牌游戏最成熟的跨平台方案（Slay the Spire、Luck Be a Landlord 等同类型均基于此）
- Phaser 3 轻量且对卡牌类 UI 交互支持好
- electron-builder 一条命令出 macOS (DMG) + Windows (EXE) 安装包

---

## 2. 核心系统

### 2.1 牌库系统

#### 2.1.1 牌张定义
```
序数牌（108张）：
  万子：一万～九万 × 4
  条子：一条～九条 × 4
  筒子：一筒～九筒 × 4

字牌（28张）：
  风牌：东、南、西、北 × 4
  箭牌：中、发、白 × 4

花牌（8张）（后期解锁）：
  春、夏、秋、冬、梅、兰、竹、菊

总计：136张（基础）+ 8张（花牌）= 144张
```

#### 2.1.2 数据结构
```typescript
type Suit = 'wan' | 'tiao' | 'tong';
type Wind = 'east' | 'south' | 'west' | 'north';
type Dragon = 'zhong' | 'fa' | 'bai';

interface Tile {
  id: string;
  type: 'numeral' | 'wind' | 'dragon' | 'flower';
  suit?: Suit;
  rank?: number;        // 1-9
  wind?: Wind;
  dragon?: Dragon;
  isDora: boolean;      // 是否为宝牌
  isRedDora: boolean;   // 是否为赤宝牌
}
```

### 2.2 手牌管理

- 初始手牌：13张
- 每轮摸1张 → 14张 → 操作后回到13张（或胡牌）
- 支持排序方式：按花色、按数字、按类型

### 2.3 面子系统（核心牌型判断）

```typescript
interface Meld {
  type: 'shunzi' | 'kezi' | 'gang' | 'duizi';
  tiles: Tile[];
  isOpen: boolean;  // 明/暗
  isKong: boolean;  // 是否为杠
}

// 胡牌判断：4面子 + 1对将
function checkHu(tiles: Tile[]): Meld[] | null;
```

### 2.4 番型计算引擎

实现国标麻将番型（简化版，约20-30种核心番型）：

**基础番型（1-2番）**：
- 断幺九、平和、一般高（连顺）、老少副、幺九刻

**中级番型（4-6番）**：
- 清一色、混一色、对对胡、三色同顺

**高级番型（8-88番）**：
- 大四喜、大三元、十三幺、绿一色、清老头

```typescript
interface Yaku {
  name: string;
  han: number;         // 基础番数
  check: (melds: Meld[], tiles: Tile[]) => boolean;
}

function calculateHans(melds: Meld[], tiles: Tile[]): YakuResult[];
```

---

## 3. 雀符系统（核心构筑）

### 3.1 雀符数据结构
```typescript
type FuRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
type FuType = 'base_han' | 'big_hand' | 'utility' | 'legendary';

interface QueFu {
  id: string;
  name: string;
  rarity: FuRarity;
  type: FuType;
  effect: FuEffect;
  description: string;
  price: number;
  level: number;       // 可升级
}

interface FuEffect {
  hanBonus?: number;           // 固定番数加成
  hanMultiplier?: number;      // 番数倍率
  doraBonus?: number;          // 宝牌额外加成
  conditionEffect?: {          // 条件触发效果
    condition: string;
    effect: string;
  };
}
```

### 3.2 雀符清单（第一期实现12-16张）

| 名称 | 稀有度 | 效果 |
|------|--------|------|
| 连顺符 | 普通 | 每组顺子额外+1番 |
| 刻子符 | 普通 | 每组刻子/杠额外+2番 |
| 将对符 | 普通 | 将牌对子翻倍加分 |
| 清一色符 | 稀有 | 达成清一色，番数×2 |
| 字牌符 | 稀有 | 含风/箭牌的面子+3番 |
| 杠上开花符 | 稀有 | 开杠后摸牌得分×1.5 |
| 巧吃符 | 罕见 | 吃牌不受牌序限制 |
| 暗杠符 | 罕见 | 暗杠多摸1张牌 |
| 弃变符 | 罕见 | 弃牌20%概率变为所需牌 |
| 大四喜符 | 传说 | 集齐四风刻子，番数×5 |
| 十三幺符 | 传说 | 可直接凑十三幺 |
| 海底捞月符 | 传说 | 最后一轮胡牌得分×10 |

### 3.3 雀符交互规则
- 携带上限：8张
- 商店购买、战后奖励、合成获得
- 3张低级雀符 → 1张高级雀符（同稀有度合成）
- 雀符可升级（金币消耗，增强效果）

---

## 4. 秘具系统（消耗品）

### 4.1 数据结构
```typescript
interface Tool {
  id: string;
  name: string;
  description: string;
  maxCarry: number;
  effect: (game: GameState) => void;
}
```

### 4.2 第一期秘具

| 名称 | 效果 |
|------|------|
| 换牌骰 | 随机替换3张手牌 |
| 四暗令 | 本局所有刻子强制变为暗刻，+3番 |
| 补杠令 | 可额外补一次杠 |
| 避雷符 | 本局点炮不扣分 |
| 天运牌 | 开局摸满14张 |

---

## 5. 宝牌系统

- 每局从牌库随机标记3张为宝牌
- 手牌中每有1张宝牌 → 全局番数+1
- 杠牌后翻1张新宝牌指示牌
- 部分雀符可加倍宝牌效果

---

## 6. 对局流程

### 6.1 单局状态机
```
[配牌] → [摸牌] → [操作选择] → [胡牌判断/继续] → [结算/下一轮]
          ↑                        |
          └────────────────────────┘ (未胡牌)
```

### 6.2 每轮可选操作
1. **吃**：用上家弃牌组成顺子（限上家，限序数牌同花色）
2. **碰**：用任意玩家弃牌组成刻子
3. **杠**：四张相同牌（明杠/暗杠/加杠）
4. **弃牌**：打出一张无用牌
5. **用秘具**：触发一次性道具
6. **胡牌**：满足胡牌条件且番数达标

### 6.3 胡牌结算
```typescript
function settle(hand: Tile[], melds: Meld[], queFus: QueFu[]): Settlement {
  const baseScore = 100;
  const baseHan = calculateHans(melds, hand).reduce((s, y) => s + y.han, 0);
  const fuMultiplier = queFus.reduce((m, f) => m * (f.effect.hanMultiplier ?? 1), 1);
  const fuBonus = queFus.reduce((b, f) => b + (f.effect.hanBonus ?? 0), 0);
  const totalHan = (baseHan + fuBonus) * fuMultiplier;
  return {
    finalScore: baseScore * totalHan * handMultiplier,
    totalHan,
    baseHan,
    rating: getRating(totalHan),
    reward: generateReward(totalHan),
  };
}
```

---

## 7. 关卡设计

### 7.1 关卡参数表

| 关卡 | 最低番数 | 回合限制 | AI难度 | 特殊规则 |
|------|----------|----------|--------|----------|
| 初阶坊市 1-3 | 2番 | 15轮 | 无AI | 无 |
| 初阶坊市 4-6 | 4番 | 12轮 | 无AI | 无 |
| 四方雀馆 1-3 | 6番 | 10轮 | 保守型AI | 无 |
| 四方雀馆 4-6 | 8番 | 10轮 | 保守型×2 | 无 |
| 庄位试炼 1-3 | 国标8番 | 10轮 | 激进型AI | 庄家底分×2 |
| 四境天阙 1-3 | 指定牌型 | 8轮 | 激进型×2 | 强制牌型限定 |
| 无尽雀局 | 递增+2番 | 逐步减少 | 混合 | 番数无限累加 |

### 7.2 AI 雀士
```typescript
interface AIPlayer {
  name: string;
  personality: 'conservative' | 'aggressive';
  strategy: 'small_hand' | 'big_hand';
  skillLevel: number;  // 1-5，影响卡牌/截胡概率
}
```

---

## 8. 经济与养成

### 8.1 金币系统
- 来源：通关奖励、番数评级奖励、成就奖励
- 消耗：商店购买雀符/秘具、升级雀符、解锁牌库

### 8.2 商店
每关间隙进入商店：
- 随机展示 3-5 张雀符（可购买/跳过）
- 随机展示 2-3 个秘具
- 牌库扩容选项（解锁花牌/百搭牌）

### 8.3 命格（永久Buff）
```typescript
interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;        // 解锁费用
  effect: () => void;
}
```
示例：
- 初始手牌+1
- 基础底分永久+20%
- 宝牌额外+1番

---

## 9. UI系统（分阶段）

### 9.1 第一阶段页面
1. **主菜单**：开始游戏、继续游戏、图鉴、设置
2. **关卡地图**：展示各关卡进度
3. **对局界面**：牌桌、手牌区、雀符区、秘具区、信息面板
4. **商店界面**：商品展示、购买确认
5. **结算界面**：番数展示、奖励列表、评级
6. **雀符图鉴**：已解锁/未解锁雀符列表

### 9.2 对局界面布局
```
┌──────────────────────────────┐
│     关卡信息 / 回合数        │
├──────────────┬───────────────┤
│  AI对手区域   │  番数/得分    │
│  (弃牌/面子)  │  实时面板     │
├──────────────┴───────────────┤
│         牌桌中央              │
├──────────────────────────────┤
│     己方手牌（13-14张）       │
├──────────────────────────────┤
│  雀符区(8槽)  │ 秘具区(5槽)  │
├──────────────────────────────┤
│  [吃] [碰] [杠] [弃牌] [胡]  │
└──────────────────────────────┘
```

---

## 10. 开发分期

### 第一期（MVP — 验证核心循环）
- [x] 牌库系统（136张基础牌）
- [ ] 手牌管理（摸牌/弃牌/排序）
- [ ] 面子系统（吃/碰/杠/顺/刻）
- [ ] 基础番型判定（6-8种）
- [ ] 胡牌检测
- [ ] 基础雀符（6张）
- [ ] 基础秘具（3个）
- [ ] 单局对局流程（无AI，纯单人凑牌）
- [ ] 简易UI（对局+结算）

### 第二期（构筑深度）
- [ ] 完整雀符系统（12-16张）
- [ ] 宝牌系统
- [ ] 役种连锁
- [ ] 商店系统
- [ ] 命格系统
- [ ] 关卡梯度完整实现（4大关，每关6小关）

### 第三期（策略深度）
- [ ] AI 雀士系统
- [ ] 多种AI策略
- [ ] 对手博弈（可以相互截胡）
- [ ] 无尽模式

### 第四期（内容丰富）
- [ ] 更多雀符（目标30+）
- [ ] 地域流派皮肤
- [ ] 特殊挑战局
- [ ] 排行榜
- [ ] 音效与完整动画

---

## 11. 技术实现要点

### 11.1 牌型判定算法
- 使用回溯法检查所有可能的面子组合
- 先剥离刻子（优先级高于顺子）
- 再检查剩余牌是否全为顺子+对子

### 11.2 随机性与公平性
- 牌山使用 Fisher-Yates 洗牌算法
- 宝牌位置在洗牌后随机确定
- 雀符商店刷新使用加权随机（稀有度权重）

### 11.3 存档系统
```typescript
interface SaveData {
  version: number;
  player: {
    gold: number;
    perks: string[];
    unlockedTiles: string[];
    unlockedFu: string[];
  };
  currentRun: {
    stage: number;
    level: number;
    score: number;
    hand: Tile[];
    fus: QueFu[];
    tools: Tool[];
    deck: Tile[];
  } | null;
}
```