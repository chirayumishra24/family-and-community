import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import type { StoryChallenge as StoryType } from '../../types/game';
import './StoryChallenge.css';

export default function StoryChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as StoryType | null;

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [activeViewpoint, setActiveViewpoint] = useState<string | null>(null);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const handleActionToggle = (actionId: string) => {
    if (submitted) return;
    if (selectedActions.includes(actionId)) {
      setSelectedActions(selectedActions.filter(a => a !== actionId));
    } else {
      setSelectedActions([...selectedActions, actionId]);
    }
    playSound('click', state.settings.soundEnabled);
  };

  const handleSubmit = () => {
    if (selectedActions.length === 0) return;
    setSubmitted(true);

    const positiveCount = selectedActions.filter(a => challenge.positiveActions.includes(a)).length;
    const negativeCount = selectedActions.filter(a => challenge.negativeActions.includes(a)).length;
    const ratio = positiveCount / (positiveCount + negativeCount || 1);

    const points = Math.round(ratio * challenge.points);
    dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: state.hintUsed ? Math.max(1, points - 3) : points });
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'community' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'healthCentre' });
    playSound(ratio >= 0.7 ? 'correct' : 'incorrect', state.settings.soundEnabled);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'stories' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  return (
    <ChallengeShell title={challenge.title} emoji="📖" categoryColor="var(--cat-stories)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="story-challenge">
        <div className="story-scenario card">
          <p className="story-prompt">{challenge.prompt}</p>
          <p className="story-situation">{challenge.situation}</p>
        </div>

        {/* Viewpoints */}
        <div className="story-viewpoints">
          <h3>Different Perspectives</h3>
          <div className="viewpoint-grid">
            {challenge.viewpoints.map(vp => (
              <button
                key={vp.id}
                className={`viewpoint-card ${activeViewpoint === vp.id ? 'vp-active' : ''}`}
                onClick={() => setActiveViewpoint(activeViewpoint === vp.id ? null : vp.id)}
              >
                <span className="vp-emoji">{vp.emoji}</span>
                <span className="vp-label">{vp.label}</span>
                {activeViewpoint === vp.id && <p className="vp-perspective">"{vp.perspective}"</p>}
              </button>
            ))}
          </div>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Actions */}
        <div className="story-actions-area">
          <h3>What should the community do? (Select all good actions)</h3>
          <div className="story-actions">
            {challenge.actions.map(action => {
              const isSelected = selectedActions.includes(action.id);
              const showResult = submitted;
              return (
                <button
                  key={action.id}
                  className={`story-action ${isSelected ? 'sa-selected' : ''} ${showResult && isSelected ? (action.isPositive ? 'sa-positive' : 'sa-negative') : ''}`}
                  onClick={() => handleActionToggle(action.id)}
                  disabled={submitted}
                >
                  <span className="sa-emoji">{action.emoji}</span>
                  <div className="sa-content">
                    <span className="sa-label">{action.label}</span>
                    {showResult && isSelected && <p className="sa-consequence">{action.consequence}</p>}
                  </div>
                  {showResult && isSelected && <span className="sa-result">{action.isPositive ? '✅' : '❌'}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {!submitted ? (
          <button className="btn btn-primary btn-large" onClick={handleSubmit} disabled={selectedActions.length === 0}>
            ✅ Submit Choices ({selectedActions.length} selected)
          </button>
        ) : (
          <div className="story-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">🌳</span>
              <h3>Community Token Earned!</h3>
            </div>
            <p className="story-message">
              {selectedActions.filter(a => challenge.positiveActions.includes(a)).length >= selectedActions.filter(a => challenge.negativeActions.includes(a)).length
                ? 'Great thinking! Your choices show empathy and understanding of different perspectives.'
                : 'Think about how your choices affect everyone. Consider each person\'s viewpoint.'}
            </p>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
