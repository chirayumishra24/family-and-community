import type { Challenge, ChallengeCategory } from '../types/game';
import { familyChallenges } from '../data/familyChallenges';
import { connectChallenges } from '../data/connectChallenges';
import { crisisChallenges } from '../data/crisisChallenges';
import { sharingChallenges } from '../data/sharingChallenges';
import { detectiveChallenges } from '../data/detectiveChallenges';
import { storyChallenges } from '../data/storyChallenges';

const pools: Record<ChallengeCategory, Challenge[]> = {
  who: familyChallenges,
  connect: connectChallenges,
  solve: crisisChallenges,
  share: sharingChallenges,
  detective: detectiveChallenges,
  stories: storyChallenges,
};

export function selectChallenge(category: ChallengeCategory, usedIds: string[]): Challenge {
  const pool = pools[category];
  let available = pool.filter(c => !usedIds.includes(c.id));
  if (available.length === 0) available = [...pool]; // reset pool
  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

export function getChallengePool(category: ChallengeCategory): Challenge[] {
  return pools[category];
}
