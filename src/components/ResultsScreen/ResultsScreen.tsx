import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import PrintableWorksheet from './PrintableWorksheet';
import PrintableCertificate from './PrintableCertificate';
import './ResultsScreen.css';

const tokenInfo = [
  { key: 'family', emoji: '🏠', label: 'Family' },
  { key: 'cooperation', emoji: '🤝', label: 'Cooperation' },
  { key: 'connection', emoji: '🔗', label: 'Connection' },
  { key: 'communication', emoji: '💬', label: 'Communication' },
  { key: 'fairness', emoji: '⚖️', label: 'Fairness' },
  { key: 'community', emoji: '🌳', label: 'Community' },
];

export default function ResultsScreen() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const teamA = state.teams.A;
  const teamB = state.teams.B;
  const combined = teamA.score + teamB.score;
  const winner = teamA.score > teamB.score ? 'A' : teamB.score > teamA.score ? 'B' : 'TIE';

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' });
    playSound('start', state.settings.soundEnabled);
    navigate('/9-1-intro');
  };

  return (
    <div className="results-screen">
      <div className="results-confetti">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            backgroundColor: ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][i % 6],
          }} />
        ))}
      </div>

      <div className="results-content">
        <div className="results-trophy">🏆</div>
        <h1 className="results-title">QUEST COMPLETE!</h1>
        <p className="results-subtitle">Together, both teams built a stronger community.</p>

        {/* Scoreboard */}
        <div className="results-scores">
          <div className={`score-team ${winner === 'A' ? 'score-winner' : ''}`}>
            <div className="score-team-icon">🛡️</div>
            <div className="score-team-name">{teamA.name}</div>
            <div className="score-team-points">{teamA.score}</div>
            <div className="score-team-label">points</div>
          </div>
          <div className="score-combined">
            <div className="score-combined-num">{combined}</div>
            <div className="score-combined-label">TOTAL POINTS</div>
          </div>
          <div className={`score-team ${winner === 'B' ? 'score-winner' : ''}`}>
            <div className="score-team-icon">⚡</div>
            <div className="score-team-name">{teamB.name}</div>
            <div className="score-team-points">{teamB.score}</div>
            <div className="score-team-label">points</div>
          </div>
        </div>

        {winner !== 'TIE' ? (
          <div className="winner-banner">🎉 {state.teams[winner].name} wins! But both teams helped the community! 🎉</div>
        ) : (
          <div className="winner-banner">🎉 It's a tie! Both teams contributed equally! 🎉</div>
        )}

        {/* Token Summary */}
        <div className="results-tokens">
          <h3>Community Tokens Collected</h3>
          <div className="token-summary">
            {tokenInfo.map(t => {
              const total = (teamA.tokens as any)[t.key] + (teamB.tokens as any)[t.key];
              return (
                <div key={t.key} className={`token-summary-item ${total > 0 ? 'token-earned' : ''}`}>
                  <span className="token-summary-emoji">{t.emoji}</span>
                  <span className="token-summary-label">{t.label}</span>
                  <span className="token-summary-count">{total}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Community Progress */}
        <div className="results-community">
          <h3>Community Progress</h3>
          <div className="community-progress-bar">
            <div className="cpb-fill" style={{ width: `${state.community.overallProgress}%` }}>
              {state.community.overallProgress}%
            </div>
          </div>
          <div className="community-buildings-row">
            {Object.entries(state.community.buildings).map(([key, bState]) => (
              <div key={key} className={`cb-item ${bState === 'active' || bState === 'completed' ? 'cb-active' : 'cb-inactive'}`}>
                {bState === 'active' || bState === 'completed' ? '✅' : '⬜'}
              </div>
            ))}
          </div>
        </div>

        {/* Key Learnings */}
        <div className="results-learnings card">
          <h3>🌟 What We Explored</h3>
          <ul>
            <li><strong>Families</strong> share responsibilities and support each other.</li>
            <li><strong>Communities</strong> are built on connections between people and places.</li>
            <li><strong>Cooperation</strong> helps solve problems that no one can fix alone.</li>
            <li><strong>Fairness</strong> means considering different needs, not just equal shares.</li>
            <li><strong>Communication</strong> is the foundation of trust and understanding.</li>
            <li>Every choice affects someone — and <strong>every person matters</strong>.</li>
          </ul>
        </div>

        <div className="results-actions">
          <button className="btn btn-success btn-large" onClick={() => setShowCertificate(true)}>
            🎓 Print Certificate
          </button>
          <button className="btn btn-secondary btn-large" onClick={() => setShowWorksheet(true)}>
            📝 Print Homework Worksheet
          </button>
          <button className="btn btn-primary btn-large" onClick={handleRestart}>
            🔄 Play Again
          </button>
        </div>

        <div className="results-footer">
          <span>THE COMMUNITY QUEST · Chapter 9 · Family and Community</span>
          <span>Skillizee · Grade 6 Social Science</span>
        </div>
      </div>

      {showWorksheet && (
        <PrintableWorksheet state={state} onClose={() => setShowWorksheet(false)} />
      )}

      {showCertificate && (
        <PrintableCertificate onClose={() => setShowCertificate(false)} />
      )}
    </div>
  );
}
