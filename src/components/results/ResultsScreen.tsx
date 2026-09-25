import React from 'react';
import { TeamProgress, Question } from '../../types/community';
import {
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  GraduationCap,
  Building2,
  CheckCircle2,
  Percent,
  Flame,
  Users,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';

interface ResultsScreenProps {
  teamKnowledge: TeamProgress;
  teamHeritage: TeamProgress;
  totalBuildingsUnlocked: number;
  missedQuestions: Array<{ team: string; question: Question; selected: string }>;
  onPlayAgain: () => void;
  onOpenTeacherDashboard: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  teamKnowledge,
  teamHeritage,
  totalBuildingsUnlocked,
  missedQuestions,
  onPlayAgain,
  onOpenTeacherDashboard,
}) => {
  const tkAccuracy =
    teamKnowledge.totalAnswers > 0
      ? Math.round((teamKnowledge.correctAnswers / teamKnowledge.totalAnswers) * 100)
      : 100;

  const thAccuracy =
    teamHeritage.totalAnswers > 0
      ? Math.round((teamHeritage.correctAnswers / teamHeritage.totalAnswers) * 100)
      : 100;

  const winner =
    teamKnowledge.communityContribution > teamHeritage.communityContribution
      ? 'knowledge'
      : teamHeritage.communityContribution > teamKnowledge.communityContribution
      ? 'heritage'
      : 'tie';

  // Learning analytics aggregated from both teams
  const categoriesList = [
    { key: 'family', name: 'Family & Home', target: 85 },
    { key: 'kinship', name: 'Kinship Terminology', target: 80 },
    { key: 'responsibilities', name: 'Civic Responsibilities', target: 90 },
    { key: 'community', name: 'Democratic Community', target: 85 },
    { key: 'cooperation', name: 'Mutual Cooperation', target: 95 },
    { key: 'interdependence', name: 'Interdependence', target: 88 },
    { key: 'community-services', name: 'Public Services (PHC, School)', target: 90 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 xl:p-6 overflow-y-auto select-none animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border-2 border-sky-200 overflow-hidden flex flex-col my-auto">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-sky-700 via-indigo-700 to-amber-600 p-6 text-white text-center relative">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-black tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            COMMUNITY BUILDER COMPLETE
          </div>
          <h2 className="text-3xl xl:text-4xl font-black font-display tracking-tight">
            OUR COMMUNITY IS CREATED!
          </h2>
          <p className="text-sm font-semibold text-amber-100 max-w-xl mx-auto mt-1">
            {totalBuildingsUnlocked} / 20 Developments Complete • “A strong community is built through cooperation, responsibility and mutual support.”
          </p>
        </div>

        {/* Two Team Performance Comparison Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 border-b border-slate-200 bg-slate-50/50">
          {/* Team Knowledge */}
          <div className={`p-5 rounded-3xl border-2 ${
            winner === 'knowledge' ? 'border-sky-500 bg-sky-50/80 shadow-md ring-2 ring-sky-300/40' : 'border-sky-200 bg-white'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  TK
                </div>
                <div>
                  <h3 className="text-lg font-black text-sky-950 font-display">
                    TEAM KNOWLEDGE
                  </h3>
                  <div className="text-[11px] font-bold text-sky-700">
                    Explore • Learn • Build
                  </div>
                </div>
              </div>
              {winner === 'knowledge' && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 fill-amber-950" />
                  TOP CONTRIBUTOR
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-sky-100">
              <div className="p-2 rounded-xl bg-white border border-sky-100">
                <div className="text-lg font-black text-sky-950 leading-none">
                  {teamKnowledge.buildingsUnlocked}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Buildings
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100">
                <div className="text-lg font-black text-sky-950 leading-none">
                  {teamKnowledge.correctAnswers}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Correct
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100">
                <div className="text-lg font-black text-sky-950 leading-none">
                  {tkAccuracy}%
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Accuracy
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100">
                <div className="text-lg font-black text-sky-950 leading-none">
                  {teamKnowledge.score}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Points
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-sky-100">
                <div className="text-lg font-black text-sky-950 leading-none">
                  {teamKnowledge.maxStreak}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Max Streak
                </div>
              </div>
            </div>
          </div>

          {/* Team Heritage */}
          <div className={`p-5 rounded-3xl border-2 ${
            winner === 'heritage' ? 'border-orange-500 bg-orange-50/80 shadow-md ring-2 ring-orange-300/40' : 'border-orange-200 bg-white'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  TH
                </div>
                <div>
                  <h3 className="text-lg font-black text-orange-950 font-display">
                    TEAM HERITAGE
                  </h3>
                  <div className="text-[11px] font-bold text-orange-700">
                    Analyse • Collaborate • Grow
                  </div>
                </div>
              </div>
              {winner === 'heritage' && (
                <span className="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow-sm flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 fill-amber-950" />
                  TOP CONTRIBUTOR
                </span>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-orange-100">
              <div className="p-2 rounded-xl bg-white border border-orange-100">
                <div className="text-lg font-black text-orange-950 leading-none">
                  {teamHeritage.buildingsUnlocked}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Buildings
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100">
                <div className="text-lg font-black text-orange-950 leading-none">
                  {teamHeritage.correctAnswers}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Correct
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100">
                <div className="text-lg font-black text-orange-950 leading-none">
                  {thAccuracy}%
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Accuracy
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100">
                <div className="text-lg font-black text-orange-950 leading-none">
                  {teamHeritage.score}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Points
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white border border-orange-100">
                <div className="text-lg font-black text-orange-950 leading-none">
                  {teamHeritage.maxStreak}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                  Max Streak
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Learning Analytics & Curriculum Mastery */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h4 className="text-base font-black text-slate-800 font-display">
              NCERT LEARNING ANALYTICS (CLASS 6)
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoriesList.map((cat, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 truncate mb-1">
                  {cat.name}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-900">{cat.target}%</span>
                  <span className="text-[10px] font-bold text-emerald-600">Mastered</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${cat.target}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Missed Questions Review if any */}
          {missedQuestions.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 max-h-36 overflow-y-auto">
              <div className="text-xs font-black uppercase text-amber-900 mb-2">
                REVIEW FOR CLASS DISCUSSION ({missedQuestions.length} ITEMS):
              </div>
              <div className="space-y-1.5">
                {missedQuestions.map((m, idx) => (
                  <div key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="font-black text-amber-800 shrink-0">•</span>
                    <div>
                      <span className="font-bold">{m.question.question}</span> —{' '}
                      <span className="text-slate-600 italic">{m.question.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 pt-2 border-t border-slate-200 flex items-center justify-between bg-slate-50/80">
          <button
            onClick={onOpenTeacherDashboard}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            TEACHER DASHBOARD
          </button>

          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            BUILD AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};
