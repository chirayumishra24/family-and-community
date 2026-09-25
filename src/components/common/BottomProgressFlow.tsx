import React from 'react';
import { Landmark, Check, Lock, BarChart3, Droplets } from 'lucide-react';
import { TeamProgress } from '../../types/community';

interface BottomProgressFlowProps {
  unlockedCount: number;
  totalBuildings: number;
  teamKnowledge: TeamProgress;
  teamHeritage: TeamProgress;
  onSelectMilestone?: (milestoneIndex: number) => void;
}

const MILESTONES = [
  { name: 'Houses & Families', range: '1 – 3', threshold: 3, img: 'home' },
  { name: 'School', range: '4 – 6', threshold: 6, img: 'school' },
  { name: 'Health Centre', range: '7 – 9', threshold: 9, img: 'health' },
  { name: 'Market', range: '10 – 12', threshold: 12, img: 'shop' },
  { name: 'Community Hall', range: '13 – 15', threshold: 15, img: 'community-centre' },
  { name: 'Park & Playground', range: '16 – 17', threshold: 17, img: 'park' },
  { name: 'Water Supply', range: '18 – 19', threshold: 19, img: null },
  { name: 'Roads & Transport', range: '20', threshold: 20, img: 'transport' },
];

const accuracyOf = (team: TeamProgress) =>
  team.totalAnswers > 0 ? Math.round((team.correctAnswers / team.totalAnswers) * 100) : 0;

export const BottomProgressFlow: React.FC<BottomProgressFlowProps> = ({
  unlockedCount,
  teamKnowledge,
  teamHeritage,
  onSelectMilestone,
}) => {
  const teams = [
    { team: teamKnowledge, label: 'Team Knowledge', header: 'bg-sky-100 text-blue-700', value: 'text-blue-700' },
    { team: teamHeritage, label: 'Team Heritage', header: 'bg-orange-100 text-orange-700', value: 'text-orange-700' },
  ];

  return (
    <footer className="game-footer select-none z-20">
      {/* Left: Community build progress */}
      <div className="clay flex items-center gap-4 xl:gap-6 px-4 xl:px-6 py-2.5 min-w-0">
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl clay-blue flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm xl:text-base font-black font-display text-[#12305e] uppercase leading-tight">
              Community
              <br />
              Build Progress
            </div>
            <p className="hidden xl:block text-[11px] font-medium text-slate-500 leading-tight mt-1 max-w-[180px]">
              Unlock all buildings to create a thriving and connected community!
            </p>
          </div>
        </div>

        <div className="flex-1 min-w-0 relative">
          {/* Connecting track behind the thumbnails */}
          <div className="absolute left-[6%] right-[6%] top-[20px] xl:top-[23px] h-2 clay-well" />
          <div
            className="absolute left-[6%] top-[20px] xl:top-[23px] h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${(Math.min(unlockedCount, 20) / 20) * 88}%` }}
          />

          <div className="relative grid grid-cols-8 gap-1">
            {MILESTONES.map((m, idx) => {
              const isUnlocked = unlockedCount >= m.threshold;
              const prevThreshold = idx === 0 ? 0 : MILESTONES[idx - 1].threshold;
              const isCurrent = !isUnlocked && unlockedCount >= prevThreshold;

              return (
                <button
                  key={m.name}
                  onClick={() => onSelectMilestone && onSelectMilestone(idx)}
                  className="flex flex-col items-center gap-1 min-w-0 group"
                >
                  <div
                    className={`relative w-[48px] h-[48px] xl:w-[54px] xl:h-[54px] rounded-full clay-sm !rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
                      isCurrent ? 'ring-4 ring-amber-300/80' : isUnlocked ? 'ring-4 ring-sky-300/70' : ''
                    }`}
                  >
                    {m.img ? (
                      <img
                        src={`./images/thumbs/${m.img}.png`}
                        alt={m.name}
                        className={`w-[82%] h-[82%] object-contain transition-all duration-500 ${
                          isUnlocked || isCurrent ? '' : 'grayscale opacity-50'
                        }`}
                        draggable={false}
                      />
                    ) : (
                      <Droplets
                        className={`w-6 h-6 ${isUnlocked || isCurrent ? 'text-sky-500 fill-sky-200' : 'text-slate-300'}`}
                      />
                    )}

                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow ${
                        isUnlocked ? 'bg-blue-500 text-white' : 'bg-slate-400 text-white'
                      }`}
                    >
                      {isUnlocked ? <Check className="w-3 h-3 stroke-[3.5]" /> : <Lock className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <div className="text-center leading-tight min-w-0 w-full">
                    <div
                      className={`text-[10px] xl:text-[11px] font-bold truncate ${
                        isUnlocked ? 'text-[#12305e]' : isCurrent ? 'text-orange-600 font-black' : 'text-slate-400'
                      }`}
                    >
                      {m.name}
                    </div>
                    <div className="text-[10px] xl:text-[11px] font-black text-sky-500">{m.range}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Team stats, both teams side by side */}
      <div className="clay flex flex-col gap-2 px-4 py-2.5 w-[300px] xl:w-[360px]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-black uppercase tracking-wider text-[#12305e] font-display">Team Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {teams.map(({ team, label, header, value }) => (
            <div key={label} className="clay-sm overflow-hidden flex flex-col">
              <div className={`text-[10px] xl:text-[11px] font-black text-center py-1 ${header}`}>{label}</div>
              <div className="grid grid-cols-3 flex-1 items-center py-1">
                {[
                  { v: team.buildingsUnlocked, l: 'Buildings' },
                  { v: team.correctAnswers, l: 'Correct' },
                  { v: `${accuracyOf(team)}%`, l: 'Accuracy' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <div className={`text-base xl:text-lg font-black font-display leading-none tabular-nums ${value}`}>
                      {s.v}
                    </div>
                    <div className="text-[8px] xl:text-[9px] text-slate-400 uppercase font-bold mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};
