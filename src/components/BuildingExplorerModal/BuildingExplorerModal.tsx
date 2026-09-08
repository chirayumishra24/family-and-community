import { useState, useEffect } from 'react';
import { useGame } from '../../state/gameStore';
import { buildingData } from '../../data/buildingData';
import { playSound } from '../../utils/audio';
import { speakText, stopSpeech, subscribeSpeech } from '../../utils/speech';
import type { BuildingType } from '../../types/game';
import './BuildingExplorerModal.css';

interface BuildingExplorerModalProps {
  building: BuildingType | null;
  onClose: () => void;
}

export default function BuildingExplorerModal({ building, onClose }: BuildingExplorerModalProps) {
  const { state, dispatch } = useGame();
  const isHindi = state.settings.language === 'hi';
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const unsub = subscribeSpeech(setIsSpeaking);
    return () => {
      unsub();
      stopSpeech();
    };
  }, []);

  if (!building) return null;
  const data = buildingData[building];
  if (!data) return null;

  const currentTeam = state.currentTeam;
  const teamName = state.teams[currentTeam].name;

  const handleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    } else {
      const textToRead = isHindi
        ? `${data.nameHi}। ${data.civicRoleHi}। क्या आप जानते हैं? ${data.didYouKnowHi}`
        : `${data.name}. ${data.civicRole}. Did you know? ${data.didYouKnow}`;
      speakText(textToRead, isHindi ? 'hi-IN' : 'en-US');
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    if (idx === data.trivia.correctIndex) {
      playSound('correct', state.settings.soundEnabled);
      dispatch({ type: 'ADD_SCORE', team: currentTeam, points: 5 });
      dispatch({
        type: 'SET_SCORE_ANIMATION',
        data: { team: currentTeam, points: 5 }
      });
      setTimeout(() => {
        dispatch({ type: 'SET_SCORE_ANIMATION', data: null });
      }, 1500);
    } else {
      playSound('incorrect', state.settings.soundEnabled);
    }
  };

  const handleModalClose = () => {
    stopSpeech();
    onClose();
  };

  return (
    <div className="bem-backdrop" onClick={handleModalClose}>
      <div className="bem-modal" onClick={e => e.stopPropagation()}>
        {/* Header Banner */}
        <div className="bem-header">
          <div className="bem-header-left">
            <span className="bem-emoji">{data.emoji}</span>
            <div>
              <h2 className="bem-title">{isHindi ? data.nameHi : data.name}</h2>
              <span className="bem-sub">{isHindi ? data.name : data.nameHi}</span>
            </div>
          </div>
          <div className="bem-header-actions">
            <button
              className={`bem-audio-btn ${isSpeaking ? 'active' : ''}`}
              onClick={handleSpeech}
              title="Listen to Explanation"
            >
              {isSpeaking ? '🔊 Speaking...' : '🔈 Read Aloud'}
            </button>
            <button className="bem-close-btn" onClick={handleModalClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Content Body */}
        <div className="bem-body">
          {/* Top Hero: Image + Civic Purpose */}
          <div className="bem-hero">
            <div className="bem-img-wrapper">
              <img src={data.img} alt={data.name} className="bem-img" />
              <span className="bem-img-badge">{isHindi ? 'सार्वजनिक संस्थान' : 'Public Landmark'}</span>
            </div>
            <div className="bem-role-card">
              <h3>{isHindi ? '🏛️ समुदाय में इसकी भूमिका' : '🏛️ Civic Role & Mission'}</h3>
              <p>{isHindi ? data.civicRoleHi : data.civicRole}</p>
            </div>
          </div>

          {/* Key Helpers Grid */}
          <div className="bem-section">
            <h3 className="bem-section-title">
              {isHindi ? '👥 यहाँ काम करने वाले प्रमुख नागरिक साथी' : '👥 Essential Community Helpers At Work'}
            </h3>
            <div className="bem-helpers-grid">
              {data.helpers.map((h, i) => (
                <div key={i} className="bem-helper-card">
                  <div className="bem-helper-top">
                    <span className="bem-helper-emoji">{h.emoji}</span>
                    <span className="bem-helper-name">{isHindi ? h.titleHi : h.title}</span>
                  </div>
                  <p className="bem-helper-duty">{isHindi ? h.dutyHi : h.duty}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Did You Know Box */}
          <div className="bem-did-you-know">
            <span className="bem-dyk-icon">💡</span>
            <div className="bem-dyk-content">
              <strong>{isHindi ? 'क्या आप जानते हैं? (Grade 6 Civic Fact)' : 'Did You Know? (Grade 6 Civic Fact)'}</strong>
              <p>{isHindi ? data.didYouKnowHi : data.didYouKnow}</p>
            </div>
          </div>

          {/* Bonus Trivia Section */}
          <div className="bem-trivia-section">
            <div className="bem-trivia-header">
              <span className="bem-trivia-badge">🎯 {isHindi ? 'बोनस प्रश्न (+5 अंक)' : 'Bonus Community Trivia (+5 Pts)'}</span>
              <span className="bem-trivia-team">
                {isHindi ? `वर्तमान टीम:` : `Active Team:`} <strong>{teamName}</strong>
              </span>
            </div>
            <p className="bem-trivia-question">
              {isHindi ? data.trivia.questionHi : data.trivia.question}
            </p>

            <div className="bem-options-grid">
              {(isHindi ? data.trivia.optionsHi : data.trivia.options).map((opt, idx) => {
                let optClass = 'bem-opt-btn';
                if (answered) {
                  if (idx === data.trivia.correctIndex) optClass += ' correct';
                  else if (idx === selectedOption) optClass += ' wrong';
                }
                return (
                  <button
                    key={idx}
                    className={optClass}
                    onClick={() => handleOptionSelect(idx)}
                    disabled={answered}
                  >
                    <span className="bem-opt-letter">{['A', 'B', 'C', 'D'][idx]}</span>
                    <span className="bem-opt-text">{opt}</span>
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={`bem-trivia-result ${selectedOption === data.trivia.correctIndex ? 'result-win' : 'result-lose'}`}>
                <span className="bem-res-icon">
                  {selectedOption === data.trivia.correctIndex ? '🎉' : '📖'}
                </span>
                <div>
                  <strong>
                    {selectedOption === data.trivia.correctIndex
                      ? (isHindi ? `शानदार उत्तर! +5 अंक मिले ${teamName} को!` : `Brilliant! +5 Community Points awarded to ${teamName}!`)
                      : (isHindi ? 'सीखने का अवसर:' : 'Key Learning Point:')}
                  </strong>
                  <p>{isHindi ? data.trivia.explanationHi : data.trivia.explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bem-footer">
          <button className="btn btn-primary bem-return-btn" onClick={handleModalClose}>
            {isHindi ? '← समुदाय मानचित्र पर लौटें' : '← Return to Community Map'}
          </button>
        </div>
      </div>
    </div>
  );
}
