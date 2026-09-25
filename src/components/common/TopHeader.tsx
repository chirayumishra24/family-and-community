import React from 'react';
import {
  Timer,
  Box,
  Map as MapIcon,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface TopHeaderProps {
  round: number;
  totalRounds: number;
  timeRemaining: number;
  viewMode: '3d' | 'map';
  onToggleViewMode: (mode: '3d' | 'map') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  checkpointStatus: Array<'knowledge' | 'heritage' | 'none'>;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  round,
  totalRounds,
  timeRemaining,
  viewMode,
  onToggleViewMode,
  soundEnabled,
  onToggleSound,
  checkpointStatus,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 60;

  return (
    <header className="flex items-stretch gap-[var(--gap)] select-none z-30 min-h-[68px]">
      {/* Left: Branding */}
      <div className="clay flex items-center gap-3 px-4 xl:px-5 py-2 shrink-0">
        <div className="w-11 h-11 rounded-2xl clay-orange flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 40" className="w-7 h-7">
            <rect x="8" y="18" width="24" height="18" rx="3" fill="#fff7ed" />
            <polygon points="20,5 35,19 5,19" fill="#fff" />
            <rect x="17" y="25" width="6" height="11" rx="2" fill="#f97316" />
            <rect x="10.5" y="22" width="5" height="5" rx="1.5" fill="#38bdf8" />
            <rect x="24.5" y="22" width="5" height="5" rx="1.5" fill="#38bdf8" />
          </svg>
        </div>
        <div>
          <h1 className="text-[20px] xl:text-[26px] font-black tracking-tight font-display leading-none whitespace-nowrap">
            <span className="text-[#12305e]">COMMUNITY </span>
            <span className="text-orange-500">BUILDER</span>
          </h1>
          <p className="text-[11px] xl:text-xs font-semibold text-slate-500 mt-1 whitespace-nowrap">
            Build Together. Learn Together. Grow Together.
          </p>
        </div>
      </div>

      {/* Center: Round Progress & Timer */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="clay flex items-center gap-4 xl:gap-6 px-5 xl:px-6 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-black tracking-wide uppercase text-[#12305e] font-display leading-none">
              Round {round} / {totalRounds}
            </span>
            <div className="flex items-center gap-[4px]">
              {checkpointStatus.map((status, idx) => {
                let dotCls = 'bg-[#e6ddd0] shadow-[inset_0_1px_2px_rgba(120,92,60,0.25)]';
                if (status === 'knowledge') dotCls = 'bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm';
                if (status === 'heritage') dotCls = 'bg-gradient-to-b from-amber-400 to-orange-600 shadow-sm';
                if (idx === round - 1 && status === 'none') {
                  dotCls = 'bg-gradient-to-b from-amber-300 to-orange-500 ring-2 ring-orange-200 animate-pulse';
                }
                return (
                  <div
                    key={idx}
                    title={`Checkpoint ${idx + 1}`}
                    className={`w-[9px] h-[9px] xl:w-[11px] xl:h-[11px] rounded-full transition-all duration-300 ${dotCls}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="w-px self-stretch my-1 bg-[#eadfce]" />

          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isLowTime ? 'bg-red-100 text-red-500' : 'clay-blue'
              }`}
            >
              <Timer className={`w-5 h-5 ${isLowTime ? 'animate-pulse' : ''}`} />
            </div>
            <div className="flex flex-col">
              <span
                className={`text-2xl xl:text-[28px] font-black tracking-tight tabular-nums font-display leading-none ${
                  isLowTime ? 'text-red-600' : 'text-[#12305e]'
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
              <span className="text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                Time Remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: View toggle, audio, fullscreen */}
      <div className="flex items-stretch gap-[var(--gap)] shrink-0">
        <div className="clay flex items-center gap-1 p-1.5">
          {([
            { mode: '3d' as const, label: '3D View', Icon: Box },
            { mode: 'map' as const, label: 'Map View', Icon: MapIcon },
          ]).map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => onToggleViewMode(mode)}
              className={`clay-btn h-full flex items-center gap-1.5 px-3 xl:px-4 rounded-[16px] text-xs font-black uppercase tracking-wide ${
                viewMode === mode ? 'clay-blue' : 'text-slate-500 hover:text-[#12305e]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className={`clay clay-btn aspect-square flex items-center justify-center px-3 ${
            soundEnabled ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="clay clay-btn aspect-square flex items-center justify-center px-3 text-blue-600"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className="hidden 2xl:flex clay items-center px-4 text-[11px] font-bold text-slate-500 leading-snug">
          Stronger Families
          <br />
          Happier Communities
          <br />
          Brighter Tomorrows
        </div>
      </div>
    </header>
  );
};
