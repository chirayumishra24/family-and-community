import { useState, useEffect, type ReactNode } from 'react';
import { useGame } from '../../state/gameStore';
import { toggleSpeech, stopSpeech, subscribeSpeech } from '../../utils/speech';
import './ChallengeShell.css';

interface Props {
  title: string;
  emoji: string;
  categoryColor: string;
  children: ReactNode;
  onBack: () => void;
  discussionText?: string;
  speechText?: string;
}

const defaultPrompts: Record<string, string> = {
  who: 'Discussion: How are household responsibilities divided at home? Why is caring for family members valuable work?',
  connect: 'Discussion: Which community institution does your family rely on most? What happens when one service stops?',
  solve: 'Discussion: When an emergency strikes, why is cooperation between citizens and local helpers essential?',
  share: 'Discussion: Why does true fairness mean supporting people based on their actual needs rather than equal division?',
  detective: 'Discussion: Why is finding the root cause of a problem better than just blaming someone or applying a temporary fix?',
  stories: 'Discussion: When neighbors disagree about shared spaces, how can we listen to all perspectives and find a fair compromise?',
};

export default function ChallengeShell({
  title,
  emoji,
  categoryColor,
  children,
  onBack,
  discussionText,
  speechText,
}: Props) {
  const { state } = useGame();
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = subscribeSpeech(setIsSpeaking);
    return () => {
      unsub();
      stopSpeech();
    };
  }, []);

  const handleBack = () => {
    stopSpeech();
    onBack();
  };

  const handleVoiceNarration = () => {
    const textToSpeak = speechText || `${title}. ${discussionText || ''}`;
    toggleSpeech(textToSpeak);
  };

  const activePrompt = discussionText || (state.currentCategory ? defaultPrompts[state.currentCategory] : null);

  return (
    <div className="challenge-shell" style={{ '--accent': categoryColor } as React.CSSProperties}>
      <header className="cs-header">
        <button className="cs-back" onClick={handleBack}>← Back</button>
        <div className="cs-title-area">
          <span className="cs-emoji">{emoji}</span>
          <h2 className="cs-title">{title}</h2>
          <button
            className={`cs-speech-btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={handleVoiceNarration}
            title={isSpeaking ? 'Stop Narration' : 'Read Aloud'}
          >
            {isSpeaking ? '⏹️ Stop' : '🔊 Listen'}
          </button>
          {activePrompt && (
            <button
              className={`cs-discuss-btn ${showDiscussion ? 'active' : ''}`}
              onClick={() => setShowDiscussion(!showDiscussion)}
              title="Class Discussion Prompt"
            >
              💡 Discussion
            </button>
          )}
        </div>
        <div className="cs-team-badge">
          <span>{state.currentTeam === 'A' ? '🔵' : '🔴'}</span>
          {state.teams[state.currentTeam].name}
        </div>
      </header>

      {showDiscussion && activePrompt && (
        <div className="cs-discussion-banner">
          <span className="cs-discuss-icon">💡</span>
          <div className="cs-discuss-content">
            <strong>Teacher / Class Discussion Prompt:</strong>
            <p>{activePrompt}</p>
          </div>
          <button className="cs-discuss-close" onClick={() => setShowDiscussion(false)}>✕</button>
        </div>
      )}

      <main className="cs-content">{children}</main>
    </div>
  );
}
