import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { selectChallenge } from '../../utils/challengeSelection';
import { playSound } from '../../utils/audio';
import type { ChallengeCategory, BuildingType, BuildingState } from '../../types/game';
import InstructionsModal from '../InstructionsModal/InstructionsModal';
import './CommunityBoard.css';

const categories: { id: ChallengeCategory; title: string; subtitle: string; emoji: string; route: string; color: string }[] = [
  { id: 'who', title: 'WHO?', subtitle: 'Family Roles', emoji: '👨‍👩‍👧', route: '/9-4-family-challenge', color: 'var(--cat-who)' },
  { id: 'connect', title: 'CONNECT', subtitle: 'Relationships', emoji: '🔗', route: '/9-5-connect-challenge', color: 'var(--cat-connect)' },
  { id: 'solve', title: 'SOLVE', subtitle: 'Community Problems', emoji: '🛠️', route: '/9-6-community-crisis', color: 'var(--cat-solve)' },
  { id: 'share', title: 'SHARE', subtitle: 'Fairness & Needs', emoji: '⚖️', route: '/9-7-sharing-challenge', color: 'var(--cat-share)' },
  { id: 'detective', title: 'DETECTIVE', subtitle: 'Find the Cause', emoji: '🔍', route: '/9-8-community-detective', color: 'var(--cat-detective)' },
  { id: 'stories', title: 'STORIES', subtitle: 'Perspectives', emoji: '📖', route: '/9-9-community-stories', color: 'var(--cat-stories)' },
];

const buildingMap: { type: BuildingType; label: string; emoji: string; img: string; x: string; y: string }[] = [
  { type: 'homes', label: 'Homes', emoji: '🏠', img: './images/home.jpg', x: '6%', y: '16%' },
  { type: 'school', label: 'School', emoji: '🏫', img: './images/school.jpg', x: '38%', y: '6%' },
  { type: 'shop', label: 'Local Shop', emoji: '🏪', img: './images/shop.jpg', x: '6%', y: '58%' },
  { type: 'communityCentre', label: 'Community Centre', emoji: '🏛️', img: './images/community-centre.jpg', x: '38%', y: '37%' },
  { type: 'park', label: 'Park', emoji: '🌳', img: './images/park.jpg', x: '38%', y: '68%' },
  { type: 'healthCentre', label: 'Health Centre', emoji: '🏥', img: './images/health.jpg', x: '72%', y: '12%' },
  { type: 'transport', label: 'Transport', emoji: '🚌', img: './images/transport.jpg', x: '72%', y: '58%' },
];

const tokenLabels: Record<string, { emoji: string; label: string }> = {
  family: { emoji: '🏠', label: 'Family' },
  cooperation: { emoji: '🤝', label: 'Cooperation' },
  connection: { emoji: '🔗', label: 'Connection' },
  communication: { emoji: '💬', label: 'Communication' },
  fairness: { emoji: '⚖️', label: 'Fairness' },
  community: { emoji: '🌳', label: 'Community' },
};

function getBuildingClass(s: BuildingState) {
  if (s === 'active' || s === 'completed') return 'building-active';
  if (s === 'highlighted') return 'building-highlighted';
  return 'building-inactive';
}

export default function CommunityBoard() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedCat, setSelectedCat] = useState<ChallengeCategory | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSelectCategory = (cat: ChallengeCategory) => {
    playSound('click', state.settings.soundEnabled);
    setSelectedCat(selectedCat === cat ? null : cat);
  };

  const handleStartChallenge = () => {
    if (!selectedCat) return;
    const challenge = selectChallenge(selectedCat, state.usedChallengeIds);
    dispatch({ type: 'SET_CHALLENGE', challenge, category: selectedCat });
    dispatch({ type: 'USE_CHALLENGE', id: challenge.id });
    playSound('start', state.settings.soundEnabled);
    const cat = categories.find(c => c.id === selectedCat);
    if (cat) navigate(cat.route);
  };

  const handleFinalChallenge = () => {
    if (state.completedCategories.length >= 4) {
      playSound('start', state.settings.soundEnabled);
      navigate('/9-10-final-challenge');
    }
  };

  const handleReset = () => {
    if (confirm('Reset the entire game? All progress will be lost.')) {
      dispatch({ type: 'RESET_GAME' });
      navigate('/9-1-intro');
    }
  };

  return (
    <div className="board-screen">
      {/* Header */}
      <header className="board-header">
        <div className="board-title-area">
          <h1 className="board-title">🏘️ THE COMMUNITY QUEST</h1>
        </div>
        <div className="board-info">
          <div className="board-round">Round <strong>{state.round}</strong> / {state.totalRounds}</div>
          <div className={`board-turn ${state.currentTeam === 'A' ? 'turn-a' : 'turn-b'}`}>
            {state.currentTeam === 'A' ? '🔵' : '🔴'} {state.teams[state.currentTeam].name}'s Turn
          </div>
          <button className="board-instructions-btn" onClick={() => setShowInstructions(true)} title="Activity Instructions">📖 Instructions</button>
          <button className="board-settings-btn" onClick={() => setShowSettings(!showSettings)} title="Settings">⚙️</button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <label><input type="checkbox" checked={state.settings.timerEnabled} onChange={() => dispatch({ type: 'TOGGLE_SETTING', setting: 'timerEnabled' })} /> Timer</label>
          <label><input type="checkbox" checked={state.settings.soundEnabled} onChange={() => dispatch({ type: 'TOGGLE_SETTING', setting: 'soundEnabled' })} /> Sound</label>
          <label><input type="checkbox" checked={state.settings.animationsEnabled} onChange={() => dispatch({ type: 'TOGGLE_SETTING', setting: 'animationsEnabled' })} /> Animations</label>
          <button className="btn btn-secondary" style={{fontSize:'0.8rem',padding:'6px 12px'}} onClick={handleReset}>🔄 Reset Game</button>
        </div>
      )}

      {/* Main Layout */}
      <div className="board-main">
        {/* Team A Panel */}
        <aside className={`team-panel team-panel-a ${state.currentTeam === 'A' ? 'team-active' : ''}`}>
          <div className="team-panel-header">
            <span className="team-icon">🛡️</span>
            <div>
              <div className="team-name">{state.teams.A.name}</div>
              <div className="team-label">Team A</div>
            </div>
          </div>
          <div className="team-score-display">
            <span className="team-score-star">⭐</span>
            <span className="team-score-num">{state.teams.A.score}</span>
            <span className="team-score-label">points</span>
          </div>
          <div className="team-tokens">
            {Object.entries(state.teams.A.tokens).map(([key, val]) => (
              <div key={key} className="token-row">
                <span>{tokenLabels[key]?.emoji}</span>
                <span className="token-label">{tokenLabels[key]?.label}</span>
                <span className="token-count">{val}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Community Map */}
        <div className="community-map-area">
          <div className="community-map">
            <img src="./images/map-bg.jpg" alt="" className="map-bg" />
            <div className="map-buildings">
              {buildingMap.map(b => {
                const bState = state.community.buildings[b.type];
                return (
                  <div key={b.type} className={`map-building ${getBuildingClass(bState)}`} style={{ left: b.x, top: b.y }}>
                    <img src={b.img} alt={b.label} className="building-img" />
                    <div className="building-label">{b.emoji} {b.label}</div>
                  </div>
                );
              })}
            </div>
            {/* Community Web SVG */}
            {state.community.webConnections.length > 0 && (
              <svg className="community-web-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                {state.community.webConnections.map((conn, i) => {
                  const fromB = buildingMap.find(b => b.type === conn.from || b.label.toLowerCase().includes(conn.from));
                  const toB = buildingMap.find(b => b.type === conn.to || b.label.toLowerCase().includes(conn.to));
                  if (!fromB || !toB) return null;
                  const x1 = parseInt(fromB.x) + 10;
                  const y1 = parseInt(fromB.y) + 10;
                  const x2 = parseInt(toB.x) + 10;
                  const y2 = parseInt(toB.y) + 10;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(139,92,246,0.6)" strokeWidth="0.5" strokeDasharray="2,1" className="web-line" />;
                })}
              </svg>
            )}
            <div className="map-center-label">
              <div className="map-center-title">OUR COMMUNITY</div>
              <div className="map-center-sub">People · Places · Possibilities</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-strip">
            {buildingMap.map(b => {
              const active = state.community.buildings[b.type] === 'active' || state.community.buildings[b.type] === 'completed';
              return (
                <div key={b.type} className={`progress-item ${active ? 'progress-active' : ''}`}>
                  <span>{b.emoji}</span>
                </div>
              );
            })}
            <div className="progress-bar-fill" style={{ width: `${state.community.overallProgress}%` }} />
          </div>
        </div>

        {/* Team B Panel */}
        <aside className={`team-panel team-panel-b ${state.currentTeam === 'B' ? 'team-active' : ''}`}>
          <div className="team-panel-header">
            <span className="team-icon">⚡</span>
            <div>
              <div className="team-name">{state.teams.B.name}</div>
              <div className="team-label">Team B</div>
            </div>
          </div>
          <div className="team-score-display">
            <span className="team-score-star">⭐</span>
            <span className="team-score-num">{state.teams.B.score}</span>
            <span className="team-score-label">points</span>
          </div>
          <div className="team-tokens">
            {Object.entries(state.teams.B.tokens).map(([key, val]) => (
              <div key={key} className="token-row">
                <span>{tokenLabels[key]?.emoji}</span>
                <span className="token-label">{tokenLabels[key]?.label}</span>
                <span className="token-count">{val}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Challenge Categories */}
      <div className="challenge-categories">
        {categories.map(cat => {
          const isCompleted = state.completedCategories.includes(cat.id);
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              className={`cat-btn ${isSelected ? 'cat-selected' : ''} ${isCompleted ? 'cat-completed' : ''}`}
              style={{ '--cat-color': cat.color } as React.CSSProperties}
              onClick={() => {
                if (isSelected) {
                  handleStartChallenge();
                } else {
                  handleSelectCategory(cat.id);
                }
              }}
              disabled={isCompleted}
              title={isSelected ? 'Click again to Start Challenge' : `Select ${cat.title}`}
            >
              <span className="cat-emoji">{cat.emoji}</span>
              <span className="cat-title">{cat.title}</span>
              <span className="cat-subtitle">{cat.subtitle}</span>
              {isSelected && (
                <span
                  className="cat-inline-start-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartChallenge();
                  }}
                >
                  ▶️ START
                </span>
              )}
              {isCompleted && <span className="cat-check">✅</span>}
            </button>
          );
        })}
      </div>

      {/* Final Challenge Button */}
      {state.completedCategories.length >= 4 && (
        <div className="final-challenge-bar">
          <button className="btn btn-warning btn-large" onClick={handleFinalChallenge}>
            🏆 FINAL CHALLENGE — Build a Better Community
          </button>
        </div>
      )}

      {/* Complete Activity Instructions Modal */}
      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
