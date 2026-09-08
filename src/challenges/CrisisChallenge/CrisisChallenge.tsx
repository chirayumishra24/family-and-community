import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import { evaluateDecisions } from '../../utils/consequenceEngine';
import type { CrisisChallenge as CrisisType } from '../../types/game';
import './CrisisChallenge.css';

export default function CrisisChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as CrisisType | null;

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluateDecisions> | null>(null);
  const [showStep, setShowStep] = useState(0);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const handleSelectAction = (actionId: string) => {
    if (submitted) return;
    if (selectedActions.includes(actionId)) {
      setSelectedActions(selectedActions.filter(a => a !== actionId));
    } else {
      setSelectedActions([...selectedActions, actionId]);
    }
    playSound('click', state.settings.soundEnabled);
  };

  const handleSubmit = () => {
    if (selectedActions.length < challenge.correctOrder.length) return;
    setSubmitted(true);
    const res = evaluateDecisions(selectedActions, challenge.correctOrder, challenge.actions);
    setResult(res);

    const points = res.overallSuccess ? challenge.points : Math.max(1, Math.floor(challenge.points / 2));
    dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: state.hintUsed ? Math.max(1, points - 3) : points });
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'cooperation' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'park' });
    playSound(res.overallSuccess ? 'correct' : 'incorrect', state.settings.soundEnabled);

    // Animate consequences
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setShowStep(step);
      if (step >= res.steps.length) clearInterval(interval);
    }, 800);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'solve' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  return (
    <ChallengeShell title={challenge.title} emoji="🛠️" categoryColor="var(--cat-solve)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="crisis-challenge">
        <div className="crisis-scenario card">
          <p className="crisis-prompt">{challenge.prompt}</p>
          <p className="crisis-context">{challenge.scenario}</p>
        </div>

        <div className="crisis-people-row">
          <div className="crisis-group">
            <h4>Affected</h4>
            <div className="crisis-people">
              {challenge.affected.map(p => (
                <div key={p.id} className="crisis-person affected">{p.emoji} {p.label}</div>
              ))}
            </div>
          </div>
          <div className="crisis-group">
            <h4>Helpers</h4>
            <div className="crisis-people">
              {challenge.helpers.map(p => (
                <div key={p.id} className="crisis-person helper">{p.emoji} {p.label}</div>
              ))}
            </div>
          </div>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Action Selection */}
        <div className="crisis-actions-area">
          <h3>Choose the right order of actions ({selectedActions.length}/{challenge.correctOrder.length})</h3>
          <div className="crisis-actions">
            {challenge.actions.map(action => {
              const idx = selectedActions.indexOf(action.id);
              return (
                <button
                  key={action.id}
                  className={`action-card ${idx >= 0 ? 'action-selected' : ''}`}
                  onClick={() => handleSelectAction(action.id)}
                  disabled={submitted}
                >
                  {idx >= 0 && <span className="action-order">{idx + 1}</span>}
                  <span className="action-emoji">{action.emoji}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!submitted ? (
          <button className="btn btn-primary btn-large" onClick={handleSubmit} disabled={selectedActions.length < challenge.correctOrder.length}>
            ✅ Submit Plan ({selectedActions.length}/{challenge.correctOrder.length} steps)
          </button>
        ) : result && (
          <div className="crisis-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">🤝</span>
              <h3>Cooperation Token Earned!</h3>
            </div>

            {/* Consequence Steps */}
            <div className="consequence-chain">
              {result.steps.slice(0, showStep).map((step, i) => (
                <div key={i} className={`consequence-step ${step.isPositive ? 'step-positive' : 'step-negative'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="step-emoji">{step.emoji}</span>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>

            <p className="crisis-message">{result.message}</p>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
