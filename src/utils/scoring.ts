import type { ChallengeCategory, Difficulty } from '../types/game';

const basePoints: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 15 };
const categoryBonus: Record<ChallengeCategory, number> = {
  who: 0, connect: 0, solve: 5, share: 0, detective: 5, stories: 0,
};

export function calculateScore(difficulty: Difficulty, category: ChallengeCategory, hintUsed: boolean): number {
  let points = basePoints[difficulty] + categoryBonus[category];
  if (hintUsed) points = Math.max(1, points - 3);
  return points;
}

export function getFinalChallengeScore(stepsCorrect: number, totalSteps: number): number {
  return Math.round((stepsCorrect / totalSteps) * 25);
}
