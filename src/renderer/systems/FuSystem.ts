import { QueFuDef } from '@shared/types';

export const ALL_FU_DEFS: QueFuDef[] = [
  {
    id: 'lian_shun',
    name: '连顺符',
    rarity: 'common',
    description: '打出顺子时固定+1番',
    price: 80,
    hanBonus: 1,
    hanMultiplier: 1,
  },
  {
    id: 'kezi',
    name: '刻子符',
    rarity: 'common',
    description: '打出刻子时额外+2番',
    price: 80,
    hanBonus: 2,
    hanMultiplier: 1,
  },
  {
    id: 'dui_jian',
    name: '将对符',
    rarity: 'common',
    description: '打出对子时翻倍得分',
    price: 80,
    hanBonus: 0,
    hanMultiplier: 2,
  },
  {
    id: 'qing_yi_se',
    name: '清一色符',
    rarity: 'rare',
    description: '番数×2',
    price: 200,
    hanBonus: 0,
    hanMultiplier: 2,
  },
  {
    id: 'zi_pai',
    name: '字牌符',
    rarity: 'rare',
    description: '含字牌的组合+3番',
    price: 200,
    hanBonus: 3,
    hanMultiplier: 1,
  },
  {
    id: 'gang_kai',
    name: '杠开符',
    rarity: 'rare',
    description: '手牌有4张相同牌时+5番',
    price: 200,
    hanBonus: 5,
    hanMultiplier: 1,
  },
];

export function getFuById(id: string): QueFuDef | undefined {
  return ALL_FU_DEFS.find(f => f.id === id);
}