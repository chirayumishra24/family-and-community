/* ── Types ── */

export type TeamId = 'A' | 'B';

export type GamePhase =
  | 'intro'
  | 'setup'
  | 'hub'
  | 'challengeSelect'
  | 'challenge'
  | 'feedback'
  | 'reward'
  | 'nextTurn'
  | 'finalChallenge'
  | 'results';

export type BuildingType =
  | 'homes'
  | 'school'
  | 'park'
  | 'shop'
  | 'healthCentre'
  | 'transport'
  | 'communityCentre';

export type BuildingState = 'locked' | 'inactive' | 'active' | 'completed' | 'highlighted';

export type ChallengeCategory = 'who' | 'connect' | 'solve' | 'share' | 'detective' | 'stories';

export type TokenType = 'family' | 'cooperation' | 'connection' | 'communication' | 'fairness' | 'community';

export type Difficulty = 'easy' | 'medium' | 'hard';

/* ── Token State ── */
export interface TokenState {
  family: number;
  cooperation: number;
  connection: number;
  communication: number;
  fairness: number;
  community: number;
}

/* ── Community Web Connection ── */
export interface WebConnection {
  id: string;
  from: string;
  to: string;
  relationship: string;
  animated: boolean;
}

/* ── Community State ── */
export interface CommunityState {
  buildings: Record<BuildingType, BuildingState>;
  webConnections: WebConnection[];
  overallProgress: number; // 0-100
}

/* ── Team State ── */
export interface TeamState {
  name: string;
  subtitle: string;
  score: number;
  tokens: TokenState;
}

/* ── Vitality Metrics ── */
export interface VitalityMetrics {
  happiness: number;   // 0 - 100
  fairness: number;    // 0 - 100
  environment: number; // 0 - 100
}

/* ── Resident Avatar Reaction ── */
export interface ResidentReactionData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  impactType: 'happiness' | 'fairness' | 'environment';
}

/* ── Settings ── */
export interface GameSettings {
  timerEnabled: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  festivalMode: boolean;
  language: 'en' | 'hi';
}

/* ── Challenge Types ── */
export interface FamilyChallenge {
  id: string;
  type: 'who';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  scenario: string;
  people: PersonCard[];
  tasks: TaskCard[];
  maxTasksPerPerson: number;
  points: number;
  hint?: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface PersonCard {
  id: string;
  label: string;
  emoji: string;
}

export interface TaskCard {
  id: string;
  label: string;
  emoji: string;
}

export interface ConnectChallenge {
  id: string;
  type: 'connect';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  entities: CommunityEntity[];
  validConnections: ValidConnection[];
  points: number;
  hint?: string;
  targetConnections: number;
}

export interface CommunityEntity {
  id: string;
  label: string;
  emoji: string;
}

export interface ValidConnection {
  from: string;
  to: string;
  relationships: string[];
  explanation: string;
}

export interface CrisisChallenge {
  id: string;
  type: 'solve';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  scenario: string;
  affected: PersonCard[];
  helpers: PersonCard[];
  actions: ActionCard[];
  correctOrder: string[];
  consequences: ConsequenceStep[];
  points: number;
  hint?: string;
}

export interface ActionCard {
  id: string;
  label: string;
  emoji: string;
}

export interface ConsequenceStep {
  action: string;
  result: string;
  emoji: string;
  isPositive: boolean;
}

export interface SharingChallenge {
  id: string;
  type: 'share';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  totalTokens: number;
  needs: ResourceNeed[];
  idealDistribution: Record<string, number>;
  points: number;
  hint?: string;
  feedbackFair: string;
  feedbackUnfair: string;
}

export interface ResourceNeed {
  id: string;
  label: string;
  emoji: string;
  requested: number;
  minimum: number;
  description: string;
}

export interface DetectiveChallenge {
  id: string;
  type: 'detective';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  mystery: string;
  clues: ClueCard[];
  correctOrder: string[];
  points: number;
  hint?: string;
  explanation: string;
}

export interface ClueCard {
  id: string;
  text: string;
  emoji: string;
}

export interface StoryChallenge {
  id: string;
  type: 'stories';
  difficulty: Difficulty;
  title: string;
  prompt: string;
  situation: string;
  viewpoints: ViewpointCard[];
  actions: StoryAction[];
  positiveActions: string[];
  negativeActions: string[];
  points: number;
  hint?: string;
}

export interface ViewpointCard {
  id: string;
  label: string;
  emoji: string;
  perspective: string;
}

export interface StoryAction {
  id: string;
  label: string;
  emoji: string;
  isPositive: boolean;
  consequence: string;
}

export type Challenge =
  | FamilyChallenge
  | ConnectChallenge
  | CrisisChallenge
  | SharingChallenge
  | DetectiveChallenge
  | StoryChallenge;

/* ── Category Info ── */
export interface CategoryInfo {
  id: ChallengeCategory;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  bgColor: string;
  buildingUnlock: BuildingType;
}

/* ── Game State ── */
export interface GameState {
  currentTeam: TeamId;
  round: number;
  totalRounds: number;
  teams: Record<TeamId, TeamState>;
  community: CommunityState;
  usedChallengeIds: string[];
  currentChallenge: Challenge | null;
  currentCategory: ChallengeCategory | null;
  timer: number;
  maxTimer: number;
  gamePhase: GamePhase;
  settings: GameSettings;
  hintUsed: boolean;
  completedCategories: ChallengeCategory[];
  scoreAnimation: { team: TeamId; points: number } | null;
  vitality: VitalityMetrics;
  activeReaction: ResidentReactionData | null;
}

/* ── Game Actions ── */
export type GameAction =
  | { type: 'SET_PHASE'; phase: GamePhase }
  | { type: 'SET_TEAM_NAME'; team: TeamId; name: string; subtitle: string }
  | { type: 'NEXT_TURN' }
  | { type: 'ADD_SCORE'; team: TeamId; points: number }
  | { type: 'ADD_TOKEN'; team: TeamId; token: TokenType }
  | { type: 'ACTIVATE_BUILDING'; building: BuildingType }
  | { type: 'COMPLETE_BUILDING'; building: BuildingType }
  | { type: 'ADD_CONNECTION'; connection: WebConnection }
  | { type: 'SET_CHALLENGE'; challenge: Challenge; category: ChallengeCategory }
  | { type: 'CLEAR_CHALLENGE' }
  | { type: 'USE_CHALLENGE'; id: string }
  | { type: 'COMPLETE_CATEGORY'; category: ChallengeCategory }
  | { type: 'SET_TIMER'; time: number }
  | { type: 'SET_MAX_TIMER'; time: number }
  | { type: 'USE_HINT' }
  | { type: 'CLEAR_HINT' }
  | { type: 'TOGGLE_SETTING'; setting: keyof GameSettings }
  | { type: 'SET_SCORE_ANIMATION'; data: { team: TeamId; points: number } | null }
  | { type: 'UPDATE_VITALITY'; metrics: Partial<VitalityMetrics> }
  | { type: 'SET_REACTION'; reaction: ResidentReactionData | null }
  | { type: 'SET_LANGUAGE'; language: 'en' | 'hi' }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_STATE'; state: Partial<GameState> };
