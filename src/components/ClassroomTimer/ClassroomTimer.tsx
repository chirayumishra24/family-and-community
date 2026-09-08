import { useEffect, useState } from 'react';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import './ClassroomTimer.css';

interface ClassroomTimerProps {
  isPaused?: boolean;
}

export default function ClassroomTimer({ isPaused = false }: ClassroomTimerProps) {
  const { state, dispatch } = useGame();
  const [running, setRunning] = useState(true);

  const timeLeft = state.timer;
  const maxTime = state.maxTimer || 60;
  const timerEnabled = state.settings.timerEnabled;

  useEffect(() => {
    if (!timerEnabled || !running || isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      dispatch({ type: 'SET_TIMER', time: Math.max(0, timeLeft - 1) });

      if (timeLeft - 1 === 0) {
        playSound('buzzer', state.settings.soundEnabled);
      } else if (timeLeft - 1 <= 3 && timeLeft - 1 > 0) {
        playSound('tick', state.settings.soundEnabled);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, running, isPaused, timerEnabled, state.settings.soundEnabled, dispatch]);

  if (!timerEnabled) {
    return (
      <button
        className="classroom-timer-pill timer-disabled"
        onClick={() => dispatch({ type: 'TOGGLE_SETTING', setting: 'timerEnabled' })}
        title="Click to Enable Timer"
      >
        ⏱️ <span>Timer Off</span>
      </button>
    );
  }

  const progressPercent = Math.min(100, Math.max(0, (timeLeft / maxTime) * 100));
  let statusClass = 'timer-green';
  if (timeLeft <= 5) statusClass = 'timer-red pulse';
  else if (timeLeft <= 15) statusClass = 'timer-amber';

  const handleCycleDuration = (e: React.MouseEvent) => {
    e.stopPropagation();
    const durations = [60, 90, 120];
    const current = state.settings.timerSeconds || 60;
    const nextIdx = (durations.indexOf(current) + 1) % durations.length;
    const nextSec = durations[nextIdx];
    dispatch({ type: 'SET_TIMER_SECONDS', seconds: nextSec });
    playSound('click', state.settings.soundEnabled);
  };

  const handleToggleRunning = () => {
    setRunning(!running);
    playSound('click', state.settings.soundEnabled);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'SET_TIMER', time: maxTime });
    setRunning(true);
    playSound('click', state.settings.soundEnabled);
  };

  return (
    <div className={`classroom-timer ${statusClass}`} onClick={handleToggleRunning} title="Click to Pause / Resume">
      {/* Mini circular track */}
      <svg className="timer-svg" viewBox="0 0 36 36">
        <path
          className="timer-circle-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="timer-circle-bar"
          strokeDasharray={`${progressPercent}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>

      <div className="timer-info">
        <span className="timer-digits">
          {running ? '' : '⏸️ '}{timeLeft}s
        </span>
      </div>

      <div className="timer-controls">
        <button className="timer-cycle-btn" onClick={handleCycleDuration} title="Change duration (60s/90s/120s)">
          ⚙️ {maxTime}s
        </button>
        <button className="timer-reset-btn" onClick={handleReset} title="Reset Timer">
          🔄
        </button>
      </div>
    </div>
  );
}
