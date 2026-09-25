import React, { useState } from 'react';
import { CHECKPOINTS } from '../../data/communityCheckpoints';
import { Check, Lock, X } from 'lucide-react';

interface CommunityMapViewProps {
  unlockedCount: number;
  unlockedBuildings: string[];
  isCompleted?: boolean;
}

// Pre-positioned building label coordinates (% from top-left) for the village illustration
const BUILDING_POSITIONS: Record<string, { left: number; top: number }> = {
  houses: { left: 22, top: 68 },
  'family-homes': { left: 12, top: 52 },
  neighbourhood: { left: 38, top: 78 },
  school: { left: 55, top: 48 },
  library: { left: 42, top: 38 },
  'study-centre': { left: 32, top: 30 },
  'health-centre': { left: 75, top: 28 },
  clinic: { left: 85, top: 40 },
  'first-aid': { left: 68, top: 35 },
  market: { left: 55, top: 62 },
  shops: { left: 65, top: 58 },
  cooperative: { left: 48, top: 55 },
  'community-hall': { left: 42, top: 22 },
  'meeting-place': { left: 55, top: 18 },
  amphitheatre: { left: 28, top: 15 },
  park: { left: 72, top: 52 },
  playground: { left: 82, top: 60 },
  'water-supply': { left: 88, top: 48 },
  'waste-management': { left: 78, top: 72 },
  'roads-transport': { left: 45, top: 82 },
  temple: { left: 25, top: 25 },
};

// Friendly names for each building checkpoint
const BUILDING_NAMES: Record<string, string> = {
  houses: 'Houses & Families',
  'family-homes': 'Family Homes',
  neighbourhood: 'Neighbourhood',
  school: 'School',
  library: 'Library',
  'study-centre': 'Study Centre',
  'health-centre': 'Health Centre',
  clinic: 'Clinic',
  'first-aid': 'First Aid',
  market: 'Market',
  shops: 'Shops',
  cooperative: 'Co-operative',
  'community-hall': 'Community Hall',
  'meeting-place': 'Meeting Place',
  amphitheatre: 'Amphitheatre',
  park: 'Park & Playground',
  playground: 'Playground',
  'water-supply': 'Water Supply',
  'waste-management': 'Waste Mgmt',
  'roads-transport': 'Roads & Transport',
  temple: 'Temple / Place of Worship',
};

export const CommunityMapView: React.FC<CommunityMapViewProps> = ({
  unlockedCount,
  unlockedBuildings,
  isCompleted = false,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | null>(null);
  const activeCheckpoint = CHECKPOINTS.find((cp) => cp.id === selectedCheckpoint);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner select-none">
      {/* Village Illustration Background */}
      <img
        src="./images/village-bg.jpg"
        alt="Community Village"
        className="w-full h-full object-cover object-center"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Fallback gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200/30 via-green-100/20 to-amber-100/30 pointer-events-none" />

      {/* Wooden Title Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-6 py-2 bg-amber-800/90 backdrop-blur-sm rounded-xl border-2 border-amber-600 shadow-lg text-center"
          style={{ backgroundImage: 'linear-gradient(135deg, #92400e, #78350f, #92400e)' }}
        >
          <h2 className="text-lg xl:text-xl font-black text-amber-100 font-display tracking-wide uppercase" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            Our Community
          </h2>
          <p className="text-[10px] font-bold text-amber-200/80 uppercase tracking-wider">
            A Place Where Everyone Matters
          </p>
        </div>
      </div>

      {/* Building Label Pills */}
      {CHECKPOINTS.map((cp, idx) => {
        const isUnlocked = idx < unlockedCount || unlockedBuildings.includes(cp.buildingId) || isCompleted;
        const pos = BUILDING_POSITIONS[cp.buildingId] || { left: 50, top: 50 };
        const name = BUILDING_NAMES[cp.buildingId] || cp.name;

        return (
          <button
            key={cp.id}
            onClick={() => setSelectedCheckpoint(selectedCheckpoint === cp.id ? null : cp.id)}
            className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110 ${
              isUnlocked ? 'opacity-100' : 'opacity-80'
            }`}
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
          >
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-md border-2 backdrop-blur-sm text-[10px] xl:text-[11px] font-bold whitespace-nowrap ${
              isUnlocked
                ? 'bg-white/95 border-emerald-300 text-slate-800'
                : 'bg-white/80 border-slate-300 text-slate-500'
            }`}>
              {/* Status Icon */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isUnlocked
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-400 text-white'
              }`}>
                {isUnlocked ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <Lock className="w-2.5 h-2.5" />
                )}
              </div>
              <span>{name}</span>
            </div>
          </button>
        );
      })}

      {/* Bottom-Right Info Card */}
      <div className="absolute bottom-3 right-3 z-20">
        <div className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200 shadow-md max-w-[200px]">
          <p className="text-[10px] font-semibold text-slate-600 leading-snug">
            Build a complete community by answering questions about families, communities and their roles.
          </p>
        </div>
      </div>

      {/* Selected Checkpoint Detail Popup */}
      {activeCheckpoint && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setSelectedCheckpoint(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-2xl p-5 max-w-xs w-full shadow-2xl border-2 border-sky-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-black text-slate-800 font-display">
                {BUILDING_NAMES[activeCheckpoint.buildingId] || activeCheckpoint.name}
              </h3>
              <button
                onClick={() => setSelectedCheckpoint(null)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Stage: {activeCheckpoint.category}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {activeCheckpoint.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
