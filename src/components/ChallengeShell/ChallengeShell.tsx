import type { ReactNode } from 'react';
import { useGame } from '../../state/gameStore';
import './ChallengeShell.css';

interface Props {
  title: string;
  emoji: string;
  categoryColor: string;
  children: ReactNode;
  onBack: () => void;
}

export default function ChallengeShell({ title, emoji, categoryColor, children, onBack }: Props) {
  const { state } = useGame();

  return (
    <div className="challenge-shell" style={{ '--accent': categoryColor } as React.CSSProperties}>
      <header className="cs-header">
        <button className="cs-back" onClick={onBack}>← Back</button>
        <div className="cs-title-area">
          <span className="cs-emoji">{emoji}</span>
          <h2 className="cs-title">{title}</h2>
        </div>
        <div className="cs-team-badge">
          <span>{state.currentTeam === 'A' ? '🔵' : '🔴'}</span>
          {state.teams[state.currentTeam].name}
        </div>
      </header>
      <main className="cs-content">{children}</main>
    </div>
  );
}
