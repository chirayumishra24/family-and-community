import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Zap,
  Lightbulb,
  Sparkles,
  Home,
  Users,
  CheckCircle,
  Flame,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Question, TeamProgress } from '../../types/community';

interface TeamPanelProps {
  team: TeamProgress;
  question: Question | null;
  onSelectAnswer: (val: any) => void;
  onSubmitAnswer: () => void;
  onUse5050: () => void;
  onUseHint: () => void;
  totalBuildingsTarget: number;
}

export const TeamPanel: React.FC<TeamPanelProps> = ({
  team,
  question,
  onSelectAnswer,
  onSubmitAnswer,
  onUse5050,
  onUseHint,
  totalBuildingsTarget,
}) => {
  const isBlue = team.color === 'blue';

  // Theme presets
  const theme = isBlue
    ? {
        clay: 'clay-blue',
        accentText: 'text-blue-600',
        progressBar: 'bg-gradient-to-r from-sky-400 to-blue-600',
        badgeIcon: <Home className="w-3.5 h-3.5" />,
        badgeText: 'text-rose-600',
        optionHover: 'hover:ring-sky-200',
        letterSelected: 'bg-white/25 text-white',
        avatarSrc: './images/avatar-boy.jpg',
        avatarBg: 'bg-sky-100',
      }
    : {
        clay: 'clay-orange',
        accentText: 'text-orange-600',
        progressBar: 'bg-gradient-to-r from-amber-400 to-orange-600',
        badgeIcon: <Users className="w-3.5 h-3.5" />,
        badgeText: 'text-orange-600',
        optionHover: 'hover:ring-orange-200',
        letterSelected: 'bg-white/25 text-white',
        avatarSrc: './images/avatar-girl.jpg',
        avatarBg: 'bg-orange-100',
      };

  // Local state for interactive matching or sorting
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [sortingState, setSortingState] = useState<string[]>(
    question?.sortingItems ? [...question.sortingItems] : []
  );

  // Reset interactive inputs whenever a new question arrives
  useEffect(() => {
    setMatchSelections({});
    setSortingState(question?.sortingItems ? [...question.sortingItems] : []);
  }, [question?.id]);

  const handleMatchSelect = (left: string, right: string) => {
    const updated = { ...matchSelections, [left]: right };
    setMatchSelections(updated);
    onSelectAnswer(updated);
  };

  const handleSortMove = (index: number, direction: 'up' | 'down') => {
    if (!question?.sortingItems) return;
    const items = [...(sortingState.length ? sortingState : question.sortingItems)];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    setSortingState(items);
    onSelectAnswer(items);
  };

  const progressPercent = Math.min(100, (team.buildingsUnlocked / totalBuildingsTarget) * 100);

  if (!question) {
    return (
      <div className="clay h-full min-h-0 flex flex-col justify-center items-center p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
        <h3 className="text-xl font-bold text-slate-800">All Questions Completed!</h3>
        <p className="text-sm text-slate-500 mt-1">
          {team.name} has contributed all developments to our shared community!
        </p>
      </div>
    );
  }

  const isAnswerSelected = team.selectedAnswer !== null && team.selectedAnswer !== undefined;
  const fiftyAvailable = team.fiftyFiftyRemaining > 0 && team.fiftyFiftyEliminated.length === 0;
  const hintAvailable = team.communityHintsRemaining > 0 && !team.hintActiveBuilding;

  return (
    <div className="clay h-full min-h-0 flex flex-col gap-2.5 xl:gap-3 p-3 select-none">
      {/* ═══ TOP: Team banner with avatar, score & building progress ═══ */}
      <div className={`${theme.clay} rounded-[22px] p-3 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl overflow-hidden shrink-0 ${theme.avatarBg} ring-4 ring-white/50 shadow-lg`}>
            <img
              src={theme.avatarSrc}
              alt={team.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] 2xl:text-[1.1rem] font-black tracking-tight font-display leading-none truncate drop-shadow-sm">
              {team.name}
            </h2>
            <p className="text-[10px] xl:text-[11px] font-semibold text-white/85 mt-1 truncate">
              {team.tagline}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 rounded-2xl bg-white/20 px-2 py-1 shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.12)]">
            <Trophy className="w-4 h-4 text-amber-200 fill-amber-300" />
            <div className="leading-none text-center">
              <div className="text-base xl:text-lg font-black font-display tabular-nums">{team.score}</div>
              <div className="text-[8px] font-black uppercase tracking-wider text-white/80">Points</div>
            </div>
          </div>
        </div>

        {/* Buildings progress card */}
        <div className="clay-sm mt-2.5 px-3 py-2 text-slate-700">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-display leading-none">
              <span className="text-lg font-black text-[#12305e] tabular-nums">{team.buildingsUnlocked}</span>
              <span className="text-sm font-black text-slate-400"> / {totalBuildingsTarget}</span>
              <span className="text-[11px] font-black text-slate-500 uppercase ml-2 tracking-wider">Buildings</span>
            </span>
            {team.streak >= 2 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-700 animate-pulse">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                STREAK ×{team.streak}
              </span>
            )}
          </div>
          <div className="clay-well h-2.5 p-[2px]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${theme.progressBar} shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]`}
              style={{ width: `${Math.max(progressPercent, progressPercent > 0 ? 6 : 0)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ═══ Category & reward chips ═══ */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className={`clay-sm flex items-center gap-1.5 px-3 py-1.5 !rounded-full text-[11px] font-black uppercase tracking-wider ${theme.badgeText} min-w-0`}>
          {theme.badgeIcon}
          <span className="truncate">{question.category.replace('-', ' ')}</span>
        </div>
        <div className="clay-sm flex items-center gap-1.5 px-3 py-1.5 !rounded-full text-[11px] font-black text-emerald-600 whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5" />
          +1 BUILDING / 100 PTS
        </div>
      </div>

      {/* ═══ Question & options (scrolls on short screens) ═══ */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar -mx-1 px-1 pb-1 flex flex-col gap-2.5">
        <div className="flex items-start gap-3">
          <div className={`${theme.clay} w-9 h-9 xl:w-10 xl:h-10 rounded-[14px] flex items-center justify-center font-black text-lg font-display shrink-0`}>
            Q
          </div>
          <div className="min-w-0 pt-0.5">
            <h4 className="text-[14px] xl:text-[16px] font-bold text-[#12305e] leading-snug font-display">
              {question.question}
            </h4>
            {question.scenarioText && (
              <p className="mt-2 text-xs text-slate-600 clay-well !rounded-xl px-3 py-2 italic">
                "{question.scenarioText}"
              </p>
            )}
          </div>
        </div>

        {/* 1. MCQ Options */}
        {(question.type === 'mcq' || question.type === 'true-false' || question.type === 'decision' || question.type === 'scenario' || question.type === 'image') && question.options && (
          <div className="flex flex-col gap-2">
            {question.options.map((opt, idx) => {
              const isEliminated = team.fiftyFiftyEliminated.includes(idx);
              const isSelected = team.selectedAnswer === idx;
              const letter = String.fromCharCode(65 + idx);

              if (isEliminated) {
                return (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-2xl border-2 border-dashed border-[#e6ddd0] text-slate-300 text-sm font-medium flex items-center gap-3 line-through"
                  >
                    <span className="w-7 h-7 rounded-lg bg-[#f1ebe2] flex items-center justify-center font-black text-slate-300 text-sm shrink-0">
                      {letter}
                    </span>
                    <span>{opt}</span>
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  onClick={() => onSelectAnswer(idx)}
                  className={`clay-btn w-full text-left px-3 py-2 rounded-2xl flex items-center gap-3 text-[13px] xl:text-sm font-semibold ${
                    isSelected
                      ? `${theme.clay}`
                      : `clay-sm text-slate-700 hover:ring-2 ${theme.optionHover}`
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm font-display shrink-0 ${
                      isSelected ? theme.letterSelected : `bg-[#f4ece1] ${theme.accentText}`
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Match the Relationship */}
        {question.type === 'match' && question.pairs && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500 italic">
              Connect the kinship relations below:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {question.pairs.map((pair, pIdx) => (
                <div key={pIdx} className="contents">
                  <div className="clay-sm px-3 py-2 text-xs font-bold text-slate-700 flex items-center">
                    {pair.left}
                  </div>
                  <select
                    value={matchSelections[pair.left] || ''}
                    onChange={(e) => handleMatchSelect(pair.left, e.target.value)}
                    className="clay-sm px-2 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="">Select kinship...</option>
                    {question.pairs?.map((p, oIdx) => (
                      <option key={oIdx} value={p.right}>
                        {p.right}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Sorting Questions */}
        {question.type === 'sorting' && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-slate-500 italic">
              Arrange the items in correct order:
            </p>
            {(sortingState.length ? sortingState : question.sortingItems || []).map((item, idx, arr) => (
              <div
                key={item}
                className="clay-sm px-3 py-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-700"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`w-7 h-7 rounded-lg bg-[#f4ece1] font-black ${theme.accentText} flex items-center justify-center text-xs shrink-0`}>
                    {idx + 1}
                  </span>
                  <span className="truncate">{item}</span>
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleSortMove(idx, 'up')}
                    disabled={idx === 0}
                    className="clay-btn w-7 h-7 rounded-lg bg-[#f4ece1] text-slate-600 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSortMove(idx, 'down')}
                    disabled={idx === arr.length - 1}
                    className="clay-btn w-7 h-7 rounded-lg bg-[#f4ece1] text-slate-600 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ BOTTOM: Power-ups & Submit ═══ */}
      <div className="shrink-0 flex flex-col gap-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onUse5050}
            disabled={!fiftyAvailable}
            className={`clay-btn flex items-center justify-center gap-1.5 py-2 px-2 rounded-2xl text-xs font-black ${
              fiftyAvailable ? 'clay-sm text-amber-700' : 'clay-muted'
            }`}
          >
            <Zap className={`w-4 h-4 ${fiftyAvailable ? 'text-amber-500 fill-amber-400' : ''}`} />
            <span>50/50</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${fiftyAvailable ? 'bg-amber-100 text-amber-800' : 'bg-black/5'}`}>
              {team.fiftyFiftyRemaining} LEFT
            </span>
          </button>

          <button
            onClick={onUseHint}
            disabled={!hintAvailable}
            className={`clay-btn flex items-center justify-center gap-1.5 py-2 px-2 rounded-2xl text-xs font-black ${
              hintAvailable ? 'clay-sm text-sky-700' : 'clay-muted'
            }`}
          >
            <Lightbulb className={`w-4 h-4 ${hintAvailable ? 'text-amber-500 fill-amber-300' : ''}`} />
            <span className="whitespace-nowrap"><span className="hidden 2xl:inline">COMMUNITY </span>HINT</span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${hintAvailable ? 'bg-sky-100 text-sky-800' : 'bg-black/5'}`}>
              {team.communityHintsRemaining} LEFT
            </span>
          </button>
        </div>

        <button
          onClick={onSubmitAnswer}
          disabled={!isAnswerSelected || team.isSubmitting}
          className={`clay-btn w-full py-3 xl:py-3.5 rounded-[20px] font-black text-base xl:text-lg tracking-wide uppercase font-display flex items-center justify-center gap-2 ${
            isAnswerSelected && !team.isSubmitting ? theme.clay : 'clay-muted'
          }`}
        >
          {team.isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            <span>Submit Answer</span>
          )}
        </button>
      </div>
    </div>
  );
};
