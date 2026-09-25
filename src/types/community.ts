export type QuestionType =
  | 'mcq'
  | 'match'
  | 'image'
  | 'scenario'
  | 'true-false'
  | 'sorting'
  | 'decision';

export type QuestionCategory =
  | 'family'
  | 'family-types'
  | 'kinship'
  | 'relationships'
  | 'responsibilities'
  | 'values'
  | 'community'
  | 'cooperation'
  | 'interdependence'
  | 'community-services'
  | 'shared-spaces'
  | 'community-life'
  | 'festivals';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number; // index for mcq/scenario/decision, boolean string for true-false, serialized match/order
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  explanation: string;
  buildingReward: string;
  scenarioText?: string;
  image?: string;
  pairs?: MatchPair[]; // For match questions
  sortingItems?: string[]; // For sorting questions
  correctOrder?: string[]; // For sorting questions
}

export type BuildingId =
  | 'houses'
  | 'entrance'
  | 'courtyard'
  | 'kinship-hub'
  | 'school'
  | 'library'
  | 'health-centre'
  | 'wellness-post'
  | 'market'
  | 'park'
  | 'chaupal'
  | 'road-network'
  | 'transport'
  | 'water-supply'
  | 'waste-management'
  | 'community-hall'
  | 'cultural-stage'
  | 'festival-ground'
  | 'bridge'
  | 'thriving-town';

export interface BuildingCheckpoint {
  id: number;
  buildingId: BuildingId;
  name: string;
  category: string;
  milestoneGroup: string;
  groupRange: string;
  description: string;
  civicValue: string;
  pinPosition: [number, number, number]; // 3D coordinates [x, y, z]
}

export interface TeamProgress {
  teamId: 'knowledge' | 'heritage';
  name: string;
  color: 'blue' | 'orange';
  tagline: string;
  score: number;
  buildingsUnlocked: number;
  correctAnswers: number;
  totalAnswers: number;
  currentCategory: string;
  selectedAnswer: any | null;
  streak: number;
  maxStreak: number;
  fiftyFiftyRemaining: number;
  communityHintsRemaining: number;
  unlockedBuildings: string[];
  communityContribution: number;
  isSubmitting: boolean;
  isBuilding: boolean;
  hintActiveBuilding: string | null;
  fiftyFiftyEliminated: number[];
  categoryStats: Record<string, { correct: number; total: number }>;
}

export interface CommunityWellbeing {
  education: number;
  health: number;
  safety: number;
  cooperation: number;
  sharedSpaces: number;
}

export type CommunityMilestoneEvent =
  | 'community-day'
  | 'school-opening'
  | 'community-festival'
  | 'thriving-community'
  | null;
