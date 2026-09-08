import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import { evaluateDistribution } from '../../utils/consequenceEngine';
import type { SharingChallenge as ShareType } from '../../types/game';
import './SharingChallenge.css';

export default function SharingChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as ShareType | null;

  const [distribution, setDistribution] = useState<Record<string, number>>(() => {
    if (!challenge) return {};
    return Object.fromEntries(challenge.needs.map(n => [n.id, 0]));
  });
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluateDistribution> | null>(null);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const totalUsed = Object.values(distribution).reduce((s, v) => s + v, 0);
  const remaining = challenge.totalTokens - totalUsed;

  const handleIncrement = (id: string) => {
    if (submitted || remaining <= 0) return;
    setDistribution({ ...distribution, [id]: (distribution[id] || 0) + 1 });
    playSound('click', state.settings.soundEnabled);
  };

  const handleDecrement = (id: string) => {
    if (submitted || (distribution[id] || 0) <= 0) return;
    setDistribution({ ...distribution, [id]: distribution[id] - 1 });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const res = evaluateDistribution(distribution, challenge.needs, challenge.totalTokens);
    setResult(res);

    const points = res.fair ? challenge.points : Math.max(1, Math.floor(challenge.points / 2));
    dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: state.hintUsed ? Math.max(1, points - 3) : points });
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'fairness' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'shop' });
    playSound(res.fair ? 'correct' : 'incorrect', state.settings.soundEnabled);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'share' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  return (
    <ChallengeShell title={challenge.title} emoji="⚖️" categoryColor="var(--cat-share)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="share-challenge">
        <div className="share-scenario card">
          <p className="share-prompt">{challenge.prompt}</p>
          <div className="share-budget">
            <span className="budget-icon">🪙</span>
            <span className="budget-remaining">{remaining}</span>
            <span className="budget-label">tokens remaining of {challenge.totalTokens}</span>
          </div>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Distribution Sliders */}
        <div className="share-needs">
          {challenge.needs.map(need => {
            const val = distribution[need.id] || 0;
            const pct = (val / challenge.totalTokens) * 100;
            const metMin = val >= need.minimum;
            return (
              <div key={need.id} className={`need-card ${submitted ? (metMin ? 'need-met' : 'need-unmet') : ''}`}>
                <div className="need-header">
                  <span className="need-emoji">{need.emoji}</span>
                  <div className="need-info">
                    <span className="need-label">{need.label}</span>
                    <span className="need-desc">{need.description}</span>
                  </div>
                  <span className="need-range">min: {need.minimum} / wants: {need.requested}</span>
                </div>
                <div className="need-controls">
                  <button className="need-btn" onClick={() => handleDecrement(need.id)} disabled={submitted || val <= 0}>−</button>
                  <div className="need-bar-wrapper">
                    <div className="need-bar" style={{ width: `${pct}%` }} />
                    <span className="need-value">{val}</span>
                  </div>
                  <button className="need-btn" onClick={() => handleIncrement(need.id)} disabled={submitted || remaining <= 0}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {!submitted ? (
          <button className="btn btn-primary btn-large" onClick={handleSubmit}>
            ✅ Distribute Resources
          </button>
        ) : result && (
          <div className="share-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">⚖️</span>
              <h3>Fairness Token Earned!</h3>
            </div>

            <div className="share-results">
              {result.details.map(d => {
                const need = challenge.needs.find(n => n.id === d.id);
                return (
                  <div key={d.id} className={`share-result ${d.received >= (need?.minimum || 0) ? 'result-valid' : 'result-invalid'}`}>
                    <span>{need?.emoji}</span>
                    <span className="result-name">{need?.label}</span>
                    <span className="result-received">Got: {d.received}</span>
                    <span className="result-status">{d.status}</span>
                  </div>
                );
              })}
            </div>

            <p className="share-message">{result.fair ? challenge.feedbackFair : challenge.feedbackUnfair}</p>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
