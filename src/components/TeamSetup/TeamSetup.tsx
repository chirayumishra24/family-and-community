import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import './TeamSetup.css';

const crestOptions = [
  { icon: '🛡️', label: 'Guardians' },
  { icon: '🌿', label: 'Eco Stars' },
  { icon: '🦁', label: 'Lions' },
  { icon: '⚡', label: 'Sparks' },
  { icon: '☀️', label: 'Pioneers' },
  { icon: '🤝', label: 'Harmony' },
];

export default function TeamSetup() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState(state.teams.A.name);
  const [teamB, setTeamB] = useState(state.teams.B.name);
  const [iconA, setIconA] = useState(state.teams.A.icon || '🛡️');
  const [iconB, setIconB] = useState(state.teams.B.icon || '⚡');
  const [captainA, setCaptainA] = useState(state.teams.A.captain || '');
  const [captainB, setCaptainB] = useState(state.teams.B.captain || '');

  const handleStart = () => {
    dispatch({
      type: 'SET_TEAM_DETAILS',
      team: 'A',
      name: teamA || 'Community Builders',
      subtitle: 'Team A',
      icon: iconA,
      captain: captainA,
    });
    dispatch({
      type: 'SET_TEAM_DETAILS',
      team: 'B',
      name: teamB || 'Community Connectors',
      subtitle: 'Team B',
      icon: iconB,
      captain: captainB,
    });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    playSound('start', state.settings.soundEnabled);
    navigate('/9-3-community-board');
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1 className="setup-title">Choose Your Teams & Crests</h1>
        <p className="setup-subtitle">Two teams collaborate to solve community challenges and build harmony</p>
      </div>

      <div className="setup-teams">
        {/* TEAM A */}
        <div className="setup-team setup-team-a">
          <div className="setup-team-icon">{iconA}</div>
          <label className="setup-team-label">TEAM A</label>
          <input
            className="setup-team-input"
            value={teamA}
            onChange={e => setTeamA(e.target.value)}
            placeholder="Community Builders"
            maxLength={24}
          />

          <div className="setup-crest-row">
            <span className="setup-field-hint">Select Team Crest:</span>
            <div className="setup-crest-picker">
              {crestOptions.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`crest-opt-btn ${iconA === c.icon ? 'selected' : ''}`}
                  onClick={() => setIconA(c.icon)}
                  title={c.label}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-captain-field">
            <span className="setup-field-hint">Student Captain / Group Lead:</span>
            <input
              className="setup-captain-input"
              value={captainA}
              onChange={e => setCaptainA(e.target.value)}
              placeholder="e.g. Aarav / Blue House"
              maxLength={20}
            />
          </div>

          <div className="setup-team-score">Score: 0</div>
          <div className="setup-team-tokens">
            <span>🏠</span><span>🤝</span><span>🔗</span><span>💬</span><span>⚖️</span><span>🌳</span>
          </div>
        </div>

        <div className="setup-vs">VS</div>

        {/* TEAM B */}
        <div className="setup-team setup-team-b">
          <div className="setup-team-icon">{iconB}</div>
          <label className="setup-team-label">TEAM B</label>
          <input
            className="setup-team-input"
            value={teamB}
            onChange={e => setTeamB(e.target.value)}
            placeholder="Community Connectors"
            maxLength={24}
          />

          <div className="setup-crest-row">
            <span className="setup-field-hint">Select Team Crest:</span>
            <div className="setup-crest-picker">
              {crestOptions.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  className={`crest-opt-btn ${iconB === c.icon ? 'selected' : ''}`}
                  onClick={() => setIconB(c.icon)}
                  title={c.label}
                >
                  {c.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-captain-field">
            <span className="setup-field-hint">Student Captain / Group Lead:</span>
            <input
              className="setup-captain-input"
              value={captainB}
              onChange={e => setCaptainB(e.target.value)}
              placeholder="e.g. Priya / Red House"
              maxLength={20}
            />
          </div>

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
