import React, { useEffect, useRef } from 'react';
import { Sparkles, Trophy, Building2, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuildingRewardOverlayProps {
  buildingName: string;
  teamName: string;
  teamColor: 'blue' | 'orange';
  onClose: () => void;
}

export const BuildingRewardOverlay: React.FC<BuildingRewardOverlayProps> = ({
  buildingName,
  teamName,
  teamColor,
  onClose,
}) => {
  // Keep the latest onClose without restarting the timer on every parent render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Fire festive confetti bursts
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: teamColor === 'blue' ? ['#0284c7', '#38bdf8', '#3b82f6', '#ffd700'] : ['#ea580c', '#fb923c', '#f59e0b', '#ffd700'],
    });

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 2400);

    return () => clearTimeout(timer);
  }, [buildingName, teamColor]);

  const isBlue = teamColor === 'blue';

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in slide-in-from-top-6 duration-300 w-max max-w-[90%]">
      <div className={`${isBlue ? 'clay-blue' : 'clay-orange'} rounded-[24px] pl-3 pr-6 py-3 flex items-center gap-4`}>
        <div className="w-12 h-12 rounded-2xl bg-white/25 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.12)] flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase text-amber-100">
            <Sparkles className="w-3.5 h-3.5" />
            Community Upgrade Unlocked
          </div>
          <div className="text-lg xl:text-xl font-black tracking-tight drop-shadow font-display leading-tight truncate">
            {buildingName}
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-white/90 mt-0.5 whitespace-nowrap">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              +1 Building
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-200" />
              +100 Points
            </span>
            <span className="text-white/75 italic">{teamName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
