import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import InstructionsModal from '../InstructionsModal/InstructionsModal';
import './IntroScreen.css';

export default function IntroScreen() {
  const navigate = useNavigate();
  const { dispatch, state } = useGame();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleStart = () => {
    playSound('start', state.settings.soundEnabled);
    dispatch({ type: 'SET_PHASE', phase: 'setup' });
    navigate('/9-2-team-setup');
  };

  return (
    <div className="intro-screen">
      <div className="intro-bg">
        <img src="./images/intro-bg.jpg" alt="Community neighbourhood" className="intro-bg-img" />
        <div className="intro-overlay" />
      </div>

      <div className="intro-content">
        <div className="intro-badge">Chapter 9 · Family and Community</div>
        <h1 className="intro-title">
          <span className="intro-title-the">THE</span>
          <span className="intro-title-main">COMMUNITY QUEST</span>
        </h1>
        <p className="intro-subtitle">Family and Community</p>
        <p className="intro-tagline">"Every choice affects someone."</p>

        <div className="intro-actions">
          <button className="btn btn-primary btn-large intro-start" onClick={handleStart}>
            🚀 START THE QUEST
          </button>
          <button className="btn btn-secondary btn-large intro-guide-btn" onClick={() => setShowInstructions(true)}>
            📖 How to Play / Guide
          </button>
        </div>

        <div className="intro-features">
          <div className="intro-feature"><span>🤝</span> Work Together</div>
          <div className="intro-feature"><span>🧠</span> Make Choices</div>
          <div className="intro-feature"><span>🏘️</span> Build Community</div>
        </div>
      </div>

      <div className="intro-footer">
        <span>Skillizee · Grade 6 Social Science</span>
      </div>

      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />
    </div>
  );
}
