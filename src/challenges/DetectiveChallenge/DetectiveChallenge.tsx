import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import type { DetectiveChallenge as DetType } from '../../types/game';
import './DetectiveChallenge.css';

export default function DetectiveChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as DetType | null;

  const [orderedClues, setOrderedClues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const availableClues = challenge.clues.filter(c => !orderedClues.includes(c.id));

  const handleAddClue = (clueId: string) => {
    if (submitted) return;
    setOrderedClues([...orderedClues, clueId]);
    playSound('click', state.settings.soundEnabled);
  };

  const handleRemoveLast = () => {
    if (submitted || orderedClues.length === 0) return;
    setOrderedClues(orderedClues.slice(0, -1));
  };

  const handleSubmit = () => {
    if (orderedClues.length < challenge.correctOrder.length) return;
    setSubmitted(true);

    let correct = 0;
    orderedClues.forEach((id, i) => {
      if (challenge.correctOrder[i] === id) correct++;
    });

    const ratio = correct / challenge.correctOrder.length;
    const points = Math.round(ratio * challenge.points);
    dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: state.hintUsed ? Math.max(1, points - 3) : points });
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'communication' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'school' });
    playSound(ratio >= 0.8 ? 'correct' : 'incorrect', state.settings.soundEnabled);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'detective' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  return (
    <ChallengeShell title={challenge.title} emoji="🔍" categoryColor="var(--cat-detective)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="det-challenge">
        <div className="det-scenario card">
          <p className="det-prompt">{challenge.prompt}</p>
          <p className="det-mystery">🔎 <em>{challenge.mystery}</em></p>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Ordered Clues */}
        <div className="det-ordered">
          <h3>Your Order (cause → effect)</h3>
          <div className="ordered-clues">
            {orderedClues.map((clueId, i) => {
              const clue = challenge.clues.find(c => c.id === clueId)!;
              const isCorrect = submitted && challenge.correctOrder[i] === clueId;
              const isWrong = submitted && challenge.correctOrder[i] !== clueId;
              return (
                <div key={clueId} className={`ordered-clue ${isCorrect ? 'clue-correct' : ''} ${isWrong ? 'clue-wrong' : ''}`}>
                  <span className="clue-number">{i + 1}</span>
                  <span className="clue-emoji">{clue.emoji}</span>
                  <span className="clue-text">{clue.text}</span>
                  {submitted && <span>{isCorrect ? '✅' : '❌'}</span>}
                </div>
              );
            })}
            {orderedClues.length === 0 && <div className="det-empty">Click clues below to add them in order</div>}
          </div>
          {!submitted && orderedClues.length > 0 && (
            <button className="det-undo" onClick={handleRemoveLast}>↩ Undo Last</button>
          )}
        </div>

        {/* Available Clues */}
        {!submitted && (
          <div className="det-available">
            <h3>Clues</h3>
            <div className="available-clues">
              {availableClues.map(clue => (
                <button key={clue.id} className="clue-card" onClick={() => handleAddClue(clue.id)}>
                  <span className="clue-emoji">{clue.emoji}</span>
                  <span>{clue.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!submitted ? (
          <button className="btn btn-primary btn-large" onClick={handleSubmit} disabled={orderedClues.length < challenge.correctOrder.length}>
            ✅ Submit Order ({orderedClues.length}/{challenge.correctOrder.length})
          </button>
        ) : (
          <div className="det-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">💬</span>
              <h3>Communication Token Earned!</h3>
            </div>
            <p className="det-explanation">{challenge.explanation}</p>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
