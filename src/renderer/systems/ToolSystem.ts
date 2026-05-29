import { ToolDef } from '@shared/types';

export const ALL_TOOLS: ToolDef[] = [
  {
    id: 'huan_pai_tou',
    name: '换牌骰',
    description: '随机替换3张手牌',
    price: 50,
    maxPerRound: 1,
  },
  {
    id: 'si_an_ling',
    name: '四暗令',
    description: '立即获得150分',
    price: 80,
    maxPerRound: 1,
  },
  {
    id: 'tian_yun_pai',
    name: '天运牌',
    description: '额外摸1张牌',
    price: 100,
    maxPerRound: 1,
  },
];

export function getToolById(id: string): ToolDef | undefined {
  return ALL_TOOLS.find(t => t.id === id);
}