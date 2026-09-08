import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import './TeamSetup.css';

export default function TeamSetup() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState(state.teams.A.name);
  const [teamB, setTeamB] = useState(state.teams.B.name);

  const handleStart = () => {
    dispatch({ type: 'SET_TEAM_NAME', team: 'A', name: teamA || 'Community Builders', subtitle: 'Team A' });
    dispatch({ type: 'SET_TEAM_NAME', team: 'B', name: teamB || 'Community Connectors', subtitle: 'Team B' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    playSound('start', state.settings.soundEnabled);
    navigate('/9-3-community-board');
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1 className="setup-title">Choose Your Teams</h1>
        <p className="setup-subtitle">Two teams will work together to build a stronger community</p>
      </div>

      <div className="setup-teams">
        <div className="setup-team setup-team-a">
          <div className="setup-team-icon">🛡️</div>
          <label className="setup-team-label">TEAM A</label>
          <input
            className="setup-team-input"
            value={teamA}
            onChange={e => setTeamA(e.target.value)}
            placeholder="Community Builders"
            maxLength={24}
          />
          <div className="setup-team-score">Score: 0</div>
          <div className="setup-team-tokens">
            <span>🏠</span><span>🤝</span><span>🔗</span><span>💬</span><span>⚖️</span><span>🌳</span>
          </div>
        </div>

        <div className="setup-vs">VS</div>

        <div className="setup-team setup-team-b">
          <div className="setup-team-icon">⚡</div>
          <label className="setup-team-label">TEAM B</label>
          <input
            className="setup-team-input"
            value={teamB}
            onChange={e => setTeamB(e.target.value)}
            placeholder="Community Connectors"
            maxLength={24}
          />
          <div className="setup-team-score">Score: 0</div>
          <div className="setup-team-tokens">
            <span>🏠</span><span>🤝</span><span>🔗</span><span>💬</span><span>⚖️</span><span>🌳</span>
          </div>
        </div>
      </div>

      <button className="btn btn-success btn-large setup-enter" onClick={handleStart}>
        🏘️ ENTER THE COMMUNITY
      </button>
    </div>
  );
}
