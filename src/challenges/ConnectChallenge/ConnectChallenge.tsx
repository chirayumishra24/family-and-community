import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import type { ConnectChallenge as ConnectType } from '../../types/game';
import './ConnectChallenge.css';

interface Connection { from: string; to: string }

export default function ConnectChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as ConnectType | null;

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [matchResults, setMatchResults] = useState<{ conn: Connection; valid: boolean; explanation: string }[]>([]);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const handleEntityClick = (entityId: string) => {
    if (submitted) return;
    if (!selectedEntity) {
      setSelectedEntity(entityId);
      playSound('click', state.settings.soundEnabled);
    } else if (selectedEntity === entityId) {
      setSelectedEntity(null);
    } else {
      const exists = connections.some(c => (c.from === selectedEntity && c.to === entityId) || (c.from === entityId && c.to === selectedEntity));
      if (exists) {
        setConnections(connections.filter(c => !((c.from === selectedEntity && c.to === entityId) || (c.from === entityId && c.to === selectedEntity))));
      } else {
        setConnections([...connections, { from: selectedEntity, to: entityId }]);
        playSound('token', state.settings.soundEnabled);
      }
      setSelectedEntity(null);
    }
  };

  const handleSubmit = () => {
    if (connections.length < challenge.targetConnections) return;
    setSubmitted(true);

    const results = connections.map(conn => {
      const valid = challenge.validConnections.find(v =>
        (v.from === conn.from && v.to === conn.to) || (v.from === conn.to && v.to === conn.from)
      );
      return { conn, valid: !!valid, explanation: valid?.explanation || 'This connection is not commonly recognized.' };
    });
    setMatchResults(results);

    const correctCount = results.filter(r => r.valid).length;
    const points = Math.round((correctCount / challenge.targetConnections) * challenge.points);
    dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: state.hintUsed ? Math.max(1, points - 3) : points });
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'connection' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'communityCentre' });
    playSound(correctCount >= challenge.targetConnections ? 'correct' : 'incorrect', state.settings.soundEnabled);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'connect' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  const isConnected = (a: string, b: string) => connections.some(c => (c.from === a && c.to === b) || (c.from === b && c.to === a));

  return (
    <ChallengeShell title={challenge.title} emoji="🔗" categoryColor="var(--cat-connect)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="connect-challenge">
        <div className="connect-scenario card">
          <p className="connect-prompt">{challenge.prompt}</p>
          <p className="connect-target">Draw at least <strong>{challenge.targetConnections}</strong> connections between places and people.</p>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Entity Grid */}
        <div className="connect-entities">
          {challenge.entities.map(entity => (
            <button
              key={entity.id}
              className={`entity-btn ${selectedEntity === entity.id ? 'entity-selected' : ''}`}
              onClick={() => handleEntityClick(entity.id)}
              disabled={submitted}
            >
              <span className="entity-emoji">{entity.emoji}</span>
              <span className="entity-label">{entity.label}</span>
            </button>
          ))}
        </div>

        {/* Connection Lines Visualization */}
        <div className="connect-lines">
          {connections.map((conn, i) => {
            const fromE = challenge.entities.find(e => e.id === conn.from);
            const toE = challenge.entities.find(e => e.id === conn.to);
            const result = matchResults.find(r => r.conn === conn);
            return (
              <div key={i} className={`connection-tag ${result ? (result.valid ? 'conn-valid' : 'conn-invalid') : ''}`}>
                {fromE?.emoji} {fromE?.label} ↔ {toE?.label} {toE?.emoji}
                {result && <span className="conn-status">{result.valid ? '✅' : '❌'}</span>}
                {!submitted && <button className="conn-remove" onClick={() => setConnections(connections.filter((_, j) => j !== i))}>×</button>}
              </div>
            );
          })}
          {connections.length === 0 && <div className="connect-empty">Click two entities to connect them</div>}
        </div>

        {/* Submit / Feedback */}
        {!submitted ? (
          <button className="btn btn-primary btn-large" onClick={handleSubmit} disabled={connections.length < challenge.targetConnections}>
            ✅ Check Connections ({connections.length}/{challenge.targetConnections})
          </button>
        ) : (
          <div className="connect-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">🔗</span>
              <h3>Connection Token Earned!</h3>
            </div>
            <div className="connect-results">
              {matchResults.map((r, i) => (
                <div key={i} className={`connect-result ${r.valid ? 'result-valid' : 'result-invalid'}`}>
                  <span>{r.valid ? '✅' : '❌'}</span>
                  <p>{r.explanation}</p>
                </div>
              ))}
            </div>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
