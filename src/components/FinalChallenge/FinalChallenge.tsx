import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import { playSound } from '../../utils/audio';
import './FinalChallenge.css';

const communityParts = [
  { id: 'family', label: 'Family', emoji: '🏠', question: 'What is ONE thing families do that helps the whole community?' },
  { id: 'cooperation', label: 'Cooperation', emoji: '🤝', question: 'Why is cooperation important when solving community problems?' },
  { id: 'connection', label: 'Connection', emoji: '🔗', question: 'Name TWO places in a community that depend on each other.' },
  { id: 'communication', label: 'Communication', emoji: '💬', question: 'How does communication help prevent conflicts in a community?' },
  { id: 'fairness', label: 'Fairness', emoji: '⚖️', question: 'What does "fair" mean when different people have different needs?' },
  { id: 'community', label: 'Community', emoji: '🌳', question: 'What is ONE thing that makes a community strong?' },
];

export default function FinalChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...answers, currentAnswer.trim()];
    setAnswers(newAnswers);
    setCurrentAnswer('');
    playSound('token', state.settings.soundEnabled);

    if (currentQ < communityParts.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setCompleted(true);
      const bonusPoints = Math.min(25, newAnswers.length * 4);
      dispatch({ type: 'ADD_SCORE', team: 'A', points: Math.round(bonusPoints / 2) });
      dispatch({ type: 'ADD_SCORE', team: 'B', points: Math.round(bonusPoints / 2) });
      dispatch({ type: 'ACTIVATE_BUILDING', building: 'transport' });
      dispatch({ type: 'SET_PHASE', phase: 'results' });
      playSound('celebration', state.settings.soundEnabled);
    }
  };

  const handleFinish = () => {
    navigate('/9-11-results');
  };

  return (
    <div className="final-screen">
      <div className="final-bg-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="final-content">
        {!completed ? (
          <>
            <div className="final-header">
              <h1 className="final-title">🏆 Final Challenge</h1>
              <p className="final-subtitle">Build a Better Community — Together!</p>
              <div className="final-progress">
                {communityParts.map((_, i) => (
                  <div key={i} className={`fp-dot ${i < currentQ ? 'fp-done' : ''} ${i === currentQ ? 'fp-current' : ''}`} />
                ))}
              </div>
            </div>

            <div className="final-question card">
              <div className="fq-icon">{communityParts[currentQ].emoji}</div>
              <div className="fq-label">{communityParts[currentQ].label}</div>
              <h2 className="fq-text">{communityParts[currentQ].question}</h2>
              <textarea
                className="fq-input"
                value={currentAnswer}
                onChange={e => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                maxLength={300}
              />
              <button className="btn btn-primary" onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                {currentQ < communityParts.length - 1 ? 'Next →' : '✅ Complete!'}
              </button>
            </div>
          </>
        ) : (
          <div className="final-complete">
            <div className="complete-icon">🌟</div>
            <h1 className="complete-title">Community Complete!</h1>
            <p className="complete-text">You've reflected on what makes families and communities strong.</p>

            <div className="answers-review">
              {communityParts.map((part, i) => (
                <div key={part.id} className="answer-card" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="answer-icon">{part.emoji}</div>
                  <div>
                    <div className="answer-label">{part.label}</div>
                    <p className="answer-text">{answers[i] || '—'}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-success btn-large" onClick={handleFinish}>
              🎉 See Final Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
