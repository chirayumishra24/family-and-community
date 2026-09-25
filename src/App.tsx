import React, { useState, useEffect, useRef } from 'react';
import { TopHeader } from './components/common/TopHeader';
import { TeamPanel } from './components/teams/TeamPanel';
import { BottomProgressFlow } from './components/common/BottomProgressFlow';
import { CommunityWorld } from './components/3d/CommunityWorld';
import { CommunityMapView } from './components/views/CommunityMapView';
import { BuildingRewardOverlay } from './components/modals/BuildingRewardOverlay';
import { CommunityEventModal } from './components/modals/CommunityEventModal';
import { StartScreenModal } from './components/modals/StartScreenModal';
import { HowToPlayModal } from './components/modals/HowToPlayModal';
import { ResultsScreen } from './components/results/ResultsScreen';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TEAM_KNOWLEDGE_QUESTIONS, TEAM_HERITAGE_QUESTIONS } from './data/communityQuestions';
import { CHECKPOINTS } from './data/communityCheckpoints';
import { TeamProgress, Question, CommunityMilestoneEvent } from './types/community';
import { soundManager } from './utils/audio';

export default function App() {
  // Navigation & View Modals
  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [showTeacherDashboard, setShowTeacherDashboard] = useState<boolean>(false);
  const [showResultsScreen, setShowResultsScreen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | 'map'>('3d');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Timer State (5:00 minutes = 300 seconds default)
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Community Progress (20 Total Checkpoints)
  const [unlockedCount, setUnlockedCount] = useState<number>(0);
  const [unlockedBuildings, setUnlockedBuildings] = useState<string[]>([]);
  const [lastUnlockedId, setLastUnlockedId] = useState<string | null>(null);
  const [rewardOverlay, setRewardOverlay] = useState<{
    buildingName: string;
    teamName: string;
    teamColor: 'blue' | 'orange';
  } | null>(null);
  const [activeEvent, setActiveEvent] = useState<CommunityMilestoneEvent>(null);

  // Question Banks
  const [tkQuestions, setTkQuestions] = useState<Question[]>(TEAM_KNOWLEDGE_QUESTIONS);
  const [thQuestions, setThQuestions] = useState<Question[]>(TEAM_HERITAGE_QUESTIONS);
  const [tkIndex, setTkIndex] = useState<number>(0);
  const [thIndex, setThIndex] = useState<number>(0);

  // Missed Questions History for Teacher Review
  const [missedQuestions, setMissedQuestions] = useState<
    Array<{ team: string; question: Question; selected: string }>
  >([]);

  // 20 Checkpoint Status Indicators (who built it)
  const [checkpointContributions, setCheckpointContributions] = useState<
    Array<'knowledge' | 'heritage' | 'none'>
  >(Array(20).fill('none'));

  // Team Knowledge State
  const [teamKnowledge, setTeamKnowledge] = useState<TeamProgress>({
    teamId: 'knowledge',
    name: 'TEAM KNOWLEDGE',
    color: 'blue',
    tagline: 'Explore • Learn • Build',
    score: 0,
    buildingsUnlocked: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentCategory: 'family',
    selectedAnswer: null,
    streak: 0,
    maxStreak: 0,
    fiftyFiftyRemaining: 1,
    communityHintsRemaining: 2,
    unlockedBuildings: [],
    communityContribution: 0,
    isSubmitting: false,
    isBuilding: false,
    hintActiveBuilding: null,
    fiftyFiftyEliminated: [],
    categoryStats: {},
  });

  // Team Heritage State
  const [teamHeritage, setTeamHeritage] = useState<TeamProgress>({
    teamId: 'heritage',
    name: 'TEAM HERITAGE',
    color: 'orange',
    tagline: 'Analyse • Collaborate • Grow',
    score: 0,
    buildingsUnlocked: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentCategory: 'community',
    selectedAnswer: null,
    streak: 0,
    maxStreak: 0,
    fiftyFiftyRemaining: 1,
    communityHintsRemaining: 2,
    unlockedBuildings: [],
    communityContribution: 0,
    isSubmitting: false,
    isBuilding: false,
    hintActiveBuilding: null,
    fiftyFiftyEliminated: [],
    categoryStats: {},
  });

  // Check URL route for direct /teacher route
  useEffect(() => {
    if (window.location.pathname.includes('/teacher') || window.location.hash.includes('teacher')) {
      setShowTeacherDashboard(true);
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    if (!isTimerRunning || timeRemaining <= 0) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowResultsScreen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // Handle Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleSound = () => {
    soundManager.enabled = !soundManager.enabled;
    setSoundEnabled(soundManager.enabled);
  };

  // Start Game
  const handleStartGame = () => {
    soundManager.playClick();
    setShowStartScreen(false);
    setIsTimerRunning(true);
  };

  // Process Answering for a Team
  const handleSubmitAnswer = (teamKey: 'knowledge' | 'heritage') => {
    const isTk = teamKey === 'knowledge';
    const team = isTk ? teamKnowledge : teamHeritage;
    const setTeam = isTk ? setTeamKnowledge : setTeamHeritage;
    const currentQ = isTk ? tkQuestions[tkIndex] : thQuestions[thIndex];

    if (!currentQ || team.selectedAnswer === null || team.isSubmitting) return;

    setTeam((prev) => ({ ...prev, isSubmitting: true }));

    // Check correctness
    let isCorrect = false;
    if (currentQ.type === 'mcq' || currentQ.type === 'scenario' || currentQ.type === 'image' || currentQ.type === 'decision' || currentQ.type === 'true-false') {
      isCorrect = Number(team.selectedAnswer) === Number(currentQ.correctAnswer);
    } else if (currentQ.type === 'match') {
      // If all pairs selected correctly
      isCorrect = true;
    } else if (currentQ.type === 'sorting') {
      isCorrect = true;
    }

    setTimeout(() => {
      if (isCorrect) {
        soundManager.playCorrect();

        // Check if Cooperation Bonus (3 Streak) applies
        const newStreak = team.streak + 1;
        const newMaxStreak = Math.max(team.maxStreak, newStreak);
        const streakBonus = newStreak >= 3 ? 50 : 0;
        const earnedPoints = 100 + streakBonus;

        // Advance Checkpoint in Shared Community
        setUnlockedCount((prevCount) => {
          const nextCount = Math.min(20, prevCount + 1);
          const checkpoint = CHECKPOINTS[prevCount] || CHECKPOINTS[19];
          const bId = checkpoint.buildingId;

          setUnlockedBuildings((prev) => (prev.includes(bId) ? prev : [...prev, bId]));
          setLastUnlockedId(bId);

          // Update Checkpoint Status
          setCheckpointContributions((prev) => {
            const arr = [...prev];
            arr[prevCount] = isTk ? 'knowledge' : 'heritage';
            return arr;
          });

          // Show Reward Banner
          setRewardOverlay({
            buildingName: checkpoint.name,
            teamName: team.name,
            teamColor: team.color,
          });

          // Check Milestone Events
          if (nextCount === 5) {
            setActiveEvent('community-day');
            soundManager.playEvent();
          } else if (nextCount === 10) {
            setActiveEvent('school-opening');
            soundManager.playEvent();
          } else if (nextCount === 15) {
            setActiveEvent('community-festival');
            soundManager.playEvent();
          } else if (nextCount === 20) {
            setActiveEvent('thriving-community');
            soundManager.playEvent();
            setTimeout(() => {
              setShowResultsScreen(true);
            }, 3500);
          }

          return nextCount;
        });

        // Update Team stats
        setTeam((prev) => ({
          ...prev,
          score: prev.score + earnedPoints,
          buildingsUnlocked: prev.buildingsUnlocked + 1,
          communityContribution: prev.communityContribution + 1,
          correctAnswers: prev.correctAnswers + 1,
          totalAnswers: prev.totalAnswers + 1,
          streak: newStreak,
          maxStreak: newMaxStreak,
          selectedAnswer: null,
          isSubmitting: false,
          fiftyFiftyEliminated: [],
          hintActiveBuilding: null,
        }));

        // Advance to next question in queue
        if (isTk) {
          setTkIndex((prev) => (prev + 1 < tkQuestions.length ? prev + 1 : 0));
        } else {
          setThIndex((prev) => (prev + 1 < thQuestions.length ? prev + 1 : 0));
        }
      } else {
        // Wrong Answer
        soundManager.playWrong();

        // Record missed question for teacher review
        setMissedQuestions((prev) => [
          ...prev,
          {
            team: team.name,
            question: currentQ,
            selected: String(team.selectedAnswer),
          },
        ]);

        setTeam((prev) => ({
          ...prev,
          totalAnswers: prev.totalAnswers + 1,
          streak: 0,
          selectedAnswer: null,
          isSubmitting: false,
        }));
      }
    }, 600);
  };

  // Power-up 50/50
  const handleUse5050 = (teamKey: 'knowledge' | 'heritage') => {
    soundManager.playClick();
    const isTk = teamKey === 'knowledge';
    const team = isTk ? teamKnowledge : teamHeritage;
    const setTeam = isTk ? setTeamKnowledge : setTeamHeritage;
    const currentQ = isTk ? tkQuestions[tkIndex] : thQuestions[thIndex];

    if (!currentQ || !currentQ.options || team.fiftyFiftyRemaining <= 0) return;

    const correctIdx = Number(currentQ.correctAnswer);
    const wrongIndices = currentQ.options
      .map((_, idx) => idx)
      .filter((idx) => idx !== correctIdx);

    // Pick 2 wrong indices to eliminate
    const shuffled = [...wrongIndices].sort(() => 0.5 - Math.random());
    const eliminated = shuffled.slice(0, 2);

    setTeam((prev) => ({
      ...prev,
      fiftyFiftyRemaining: prev.fiftyFiftyRemaining - 1,
      fiftyFiftyEliminated: eliminated,
    }));
  };

  // Power-up Community Hint
  const handleUseHint = (teamKey: 'knowledge' | 'heritage') => {
    soundManager.playHint();
    const isTk = teamKey === 'knowledge';
    const team = isTk ? teamKnowledge : teamHeritage;
    const setTeam = isTk ? setTeamKnowledge : setTeamHeritage;
    const currentQ = isTk ? tkQuestions[tkIndex] : thQuestions[thIndex];

    if (!currentQ || team.communityHintsRemaining <= 0) return;

    // Find checkpoint corresponding to question's building reward
    const targetCheckpoint = CHECKPOINTS.find(
      (cp) => cp.name.toLowerCase() === currentQ.buildingReward?.toLowerCase()
    );
    const targetBuildingId = targetCheckpoint ? targetCheckpoint.buildingId : 'school';

    setTeam((prev) => ({
      ...prev,
      communityHintsRemaining: prev.communityHintsRemaining - 1,
      hintActiveBuilding: targetBuildingId,
    }));

    // Auto clear hint glow after 5 seconds
    setTimeout(() => {
      setTeam((prev) => ({ ...prev, hintActiveBuilding: null }));
    }, 5000);
  };

  // Restart / Reset Game
  const handlePlayAgain = () => {
    soundManager.playClick();
    setUnlockedCount(0);
    setUnlockedBuildings([]);
    setLastUnlockedId(null);
    setTimeRemaining(300);
    setIsTimerRunning(true);
    setTkIndex(0);
    setThIndex(0);
    setMissedQuestions([]);
    setCheckpointContributions(Array(20).fill('none'));

    setTeamKnowledge((prev) => ({
      ...prev,
      score: 0,
      buildingsUnlocked: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      selectedAnswer: null,
      streak: 0,
      maxStreak: 0,
      fiftyFiftyRemaining: 1,
      communityHintsRemaining: 2,
      communityContribution: 0,
      isSubmitting: false,
      fiftyFiftyEliminated: [],
      hintActiveBuilding: null,
    }));

    setTeamHeritage((prev) => ({
      ...prev,
      score: 0,
      buildingsUnlocked: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      selectedAnswer: null,
      streak: 0,
      maxStreak: 0,
      fiftyFiftyRemaining: 1,
      communityHintsRemaining: 2,
      communityContribution: 0,
      isSubmitting: false,
      fiftyFiftyEliminated: [],
      hintActiveBuilding: null,
    }));

    setShowResultsScreen(false);
  };

  const currentTkQuestion = tkQuestions[tkIndex] || null;
  const currentThQuestion = thQuestions[thIndex] || null;
  const activeHintId = teamKnowledge.hintActiveBuilding || teamHeritage.hintActiveBuilding || null;

  return (
    <div className="game-shell text-slate-800 font-body relative">
      {/* 1. Top Header */}
      <TopHeader
        round={Math.min(20, unlockedCount + 1)}
        totalRounds={20}
        timeRemaining={timeRemaining}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        checkpointStatus={checkpointContributions}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* 2. Main Live Interactive Area (Three-Column Layout: Left Team | Center 3D Community | Right Team) */}
      <main className="game-main relative">
        {/* Left Column: Team Knowledge */}
        <TeamPanel
          team={teamKnowledge}
          question={currentTkQuestion}
          onSelectAnswer={(val) =>
            setTeamKnowledge((prev) => ({ ...prev, selectedAnswer: val }))
          }
          onSubmitAnswer={() => handleSubmitAnswer('knowledge')}
          onUse5050={() => handleUse5050('knowledge')}
          onUseHint={() => handleUseHint('knowledge')}
          totalBuildingsTarget={20}
        />

        {/* Center Column: 3D Miniature Indian Community / 2D Map */}
        <section className="clay relative min-w-0 min-h-0 p-2 xl:p-2.5">
          <div className="relative w-full h-full rounded-[calc(var(--clay-radius)-8px)] overflow-hidden shadow-[inset_0_2px_10px_rgba(120,92,60,0.25)]">
          {viewMode === '3d' ? (
            <CommunityWorld
              unlockedCount={unlockedCount}
              unlockedBuildings={unlockedBuildings}
              lastUnlockedId={lastUnlockedId}
              hintedBuildingId={activeHintId}
              isCompleted={unlockedCount >= 20}
            />
          ) : (
            <CommunityMapView
              unlockedCount={unlockedCount}
              unlockedBuildings={unlockedBuildings}
              isCompleted={unlockedCount >= 20}
            />
          )}
          </div>

          {/* Reward Toast Overlay */}
          {rewardOverlay && (
            <BuildingRewardOverlay
              key={rewardOverlay.buildingName}
              buildingName={rewardOverlay.buildingName}
              teamName={rewardOverlay.teamName}
              teamColor={rewardOverlay.teamColor}
              onClose={() => setRewardOverlay(null)}
            />
          )}
        </section>

        {/* Right Column: Team Heritage */}
        <TeamPanel
          team={teamHeritage}
          question={currentThQuestion}
          onSelectAnswer={(val) =>
            setTeamHeritage((prev) => ({ ...prev, selectedAnswer: val }))
          }
          onSubmitAnswer={() => handleSubmitAnswer('heritage')}
          onUse5050={() => handleUse5050('heritage')}
          onUseHint={() => handleUseHint('heritage')}
          totalBuildingsTarget={20}
        />
      </main>

      {/* 3. Bottom Progress Bar & Team Stats Flow */}
      <BottomProgressFlow
        unlockedCount={unlockedCount}
        totalBuildings={20}
        teamKnowledge={teamKnowledge}
        teamHeritage={teamHeritage}
      />

      {/* 4. Modals */}
      {showStartScreen && (
        <StartScreenModal
          onStart={handleStartGame}
          onHowToPlay={() => setShowHowToPlay(true)}
          onTeacherMode={() => setShowTeacherDashboard(true)}
        />
      )}

      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {activeEvent && (
        <CommunityEventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}

      {showResultsScreen && (
        <ResultsScreen
          teamKnowledge={teamKnowledge}
          teamHeritage={teamHeritage}
          totalBuildingsUnlocked={unlockedCount}
          missedQuestions={missedQuestions}
          onPlayAgain={handlePlayAgain}
          onOpenTeacherDashboard={() => {
            setShowResultsScreen(false);
            setShowTeacherDashboard(true);
          }}
        />
      )}

      {showTeacherDashboard && (
        <TeacherDashboard
          questions={[...tkQuestions, ...thQuestions]}
          onUpdateQuestions={(updated) => {
            setTkQuestions(updated.slice(0, Math.ceil(updated.length / 2)));
            setThQuestions(updated.slice(Math.ceil(updated.length / 2)));
          }}
          onExit={() => setShowTeacherDashboard(false)}
        />
      )}
    </div>
  );
}
