import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, BuildingType, BuildingState, TokenState } from '../types/game';

const emptyTokens: TokenState = { family: 0, cooperation: 0, connection: 0, communication: 0, fairness: 0, community: 0 };

const defaultBuildings: Record<BuildingType, BuildingState> = {
  homes: 'inactive', school: 'inactive', park: 'inactive', shop: 'inactive',
  healthCentre: 'inactive', transport: 'inactive', communityCentre: 'inactive',
};

const initialState: GameState = {
  currentTeam: 'A',
  round: 1,
  totalRounds: 8,
  teams: {
    A: { name: 'Community Builders', subtitle: 'Team A', score: 0, tokens: { ...emptyTokens }, icon: '🛡️', captain: '' },
    B: { name: 'Community Connectors', subtitle: 'Team B', score: 0, tokens: { ...emptyTokens }, icon: '⚡', captain: '' },
  },
  community: { buildings: { ...defaultBuildings }, webConnections: [], overallProgress: 0 },
  usedChallengeIds: [],
  currentChallenge: null,
  currentCategory: null,
  timer: 60,
  maxTimer: 60,
  gamePhase: 'intro',
  settings: { timerEnabled: true, timerSeconds: 60, soundEnabled: true, animationsEnabled: true, festivalMode: false, language: 'en' },
  hintUsed: false,
  completedCategories: [],
  scoreAnimation: null,
  vitality: { happiness: 50, fairness: 50, environment: 50 },
  activeReaction: null,
};

function calcProgress(buildings: Record<BuildingType, BuildingState>): number {
  const total = Object.keys(buildings).length;
  const active = Object.values(buildings).filter(s => s === 'active' || s === 'completed').length;
  return Math.round((active / total) * 100);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, gamePhase: action.phase };
    case 'SET_TEAM_NAME':
      return { ...state, teams: { ...state.teams, [action.team]: { ...state.teams[action.team], name: action.name, subtitle: action.subtitle } } };
    case 'SET_TEAM_DETAILS':
      return {
        ...state,
        teams: {
          ...state.teams,
          [action.team]: {
            ...state.teams[action.team],
            name: action.name,
            subtitle: action.subtitle,
            icon: action.icon || state.teams[action.team].icon || '🛡️',
            captain: action.captain || '',
          },
        },
      };
    case 'SET_TIMER_SECONDS':
      return { ...state, timer: action.seconds, maxTimer: action.seconds, settings: { ...state.settings, timerSeconds: action.seconds } };
    case 'NEXT_TURN':
      return { ...state, currentTeam: state.currentTeam === 'A' ? 'B' : 'A', round: state.round + 1, hintUsed: false, timer: state.settings.timerSeconds || 60 };
    case 'ADD_SCORE': {
      const team = state.teams[action.team];
      return { ...state, teams: { ...state.teams, [action.team]: { ...team, score: team.score + action.points } } };
    }
    case 'ADD_TOKEN': {
      const team = state.teams[action.team];
      return { ...state, teams: { ...state.teams, [action.team]: { ...team, tokens: { ...team.tokens, [action.token]: team.tokens[action.token] + 1 } } } };
    }
    case 'ACTIVATE_BUILDING': {
      const buildings = { ...state.community.buildings, [action.building]: 'active' as BuildingState };
      return { ...state, community: { ...state.community, buildings, overallProgress: calcProgress(buildings) } };
    }
    case 'COMPLETE_BUILDING': {
      const buildings = { ...state.community.buildings, [action.building]: 'completed' as BuildingState };
      return { ...state, community: { ...state.community, buildings, overallProgress: calcProgress(buildings) } };
    }
    case 'ADD_CONNECTION':
      return { ...state, community: { ...state.community, webConnections: [...state.community.webConnections, action.connection] } };
    case 'SET_CHALLENGE':
      return { ...state, currentChallenge: action.challenge, currentCategory: action.category, gamePhase: 'challenge' };
    case 'CLEAR_CHALLENGE':
      return { ...state, currentChallenge: null, currentCategory: null };
    case 'USE_CHALLENGE':
      return { ...state, usedChallengeIds: [...state.usedChallengeIds, action.id] };
    case 'COMPLETE_CATEGORY':
      return { ...state, completedCategories: [...new Set([...state.completedCategories, action.category])] };
    case 'SET_TIMER':
      return { ...state, timer: action.time };
    case 'SET_MAX_TIMER':
      return { ...state, maxTimer: action.time };
    case 'USE_HINT':
      return { ...state, hintUsed: true };
    case 'CLEAR_HINT':
      return { ...state, hintUsed: false };
    case 'TOGGLE_SETTING':
      return { ...state, settings: { ...state.settings, [action.setting]: !state.settings[action.setting] } };
    case 'SET_SCORE_ANIMATION':
      return { ...state, scoreAnimation: action.data };
    case 'UPDATE_VITALITY':
      return {
        ...state,
        vitality: {
          happiness: Math.max(0, Math.min(100, (action.metrics.happiness !== undefined ? state.vitality.happiness + action.metrics.happiness : state.vitality.happiness))),
          fairness: Math.max(0, Math.min(100, (action.metrics.fairness !== undefined ? state.vitality.fairness + action.metrics.fairness : state.vitality.fairness))),
          environment: Math.max(0, Math.min(100, (action.metrics.environment !== undefined ? state.vitality.environment + action.metrics.environment : state.vitality.environment))),
        }
      };
    case 'SET_REACTION':
      return { ...state, activeReaction: action.reaction };
    case 'SET_LANGUAGE':
      return { ...state, settings: { ...state.settings, language: action.language } };
    case 'RESET_GAME':
      return { ...initialState, settings: state.settings };
    case 'LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<GameAction> } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('communityQuest');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...init, ...parsed, currentChallenge: null, scoreAnimation: null };
      }
    } catch {}
    return init;
  });

  useEffect(() => {
    const { currentChallenge, scoreAnimation, ...toSave } = state;
    localStorage.setItem('communityQuest', JSON.stringify(toSave));
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
