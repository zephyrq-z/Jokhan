// ========================
// 5张手牌制 — 得分系统
// ========================
import { GameState, Settlement, PlayedHand, Rating } from '@shared/types';

export function calcPlayScore(
  hand: PlayedHand,
  fus: GameState['selectedFus'],
): { score: number; fuBonus: number; fuMultiplier: number } {
  let fuBonus = 0;
  let fuMultiplier = 1;

  for (const fu of fus) {
    fuBonus += fu.hanBonus;
    if (fu.hanMultiplier > 1) fuMultiplier *= fu.hanMultiplier;
  }

  const base = hand.baseHan;
  const totalHan = (base + fuBonus) * fuMultiplier;
  const levelMult = hand.baseMultiplier;
  const score = Math.floor(100 * totalHan * levelMult);

  return { score, fuBonus, fuMultiplier };
}

export function settleRound(state: GameState): Settlement {
  const rating = getRating(state.currentScore, state.stage.targetScore);

  let totalFuBonus = 0;
  let totalFuMult = 1;
  for (const fu of state.selectedFus) {
    totalFuBonus += fu.hanBonus;
    if (fu.hanMultiplier > 1) totalFuMult *= fu.hanMultiplier;
  }

  return {
    finalScore: state.currentScore,
    targetScore: state.stage.targetScore,
    rating,
    handsPlayed: state.playedHandsThisRound,
    fuBonus: totalFuBonus,
    fuMultiplier: totalFuMult,
  };
}

function getRating(score: number, target: number): Rating {
  const ratio = score / target;
  if (ratio >= 3) return 'S';
  if (ratio >= 2) return 'A';
  if (ratio >= 1) return 'B';
  if (ratio >= 0.5) return 'C';
  return 'D';
}

export function generateReward(rating: Rating): { gold: number } {
  const goldMap: Record<Rating, number> = { S: 500, A: 300, B: 150, C: 50, D: 10 };
  return { gold: goldMap[rating] };
}