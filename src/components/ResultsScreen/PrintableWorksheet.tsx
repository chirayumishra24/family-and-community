import type { GameState } from '../../types/game';
import './PrintableWorksheet.css';

interface Props {
  state: GameState;
  onClose: () => void;
}

export default function PrintableWorksheet({ state, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-backdrop" onClick={onClose}>
      <div className="printable-dialog" onClick={e => e.stopPropagation()}>
        <div className="printable-actions no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨️ Print / Save as PDF
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        <div className="printable-page">
          <header className="worksheet-header">
            <div className="worksheet-badge">GRADE 6 SOCIAL SCIENCE · WINTER HOLIDAY HOMEWORK</div>
            <h1 className="worksheet-title">THE COMMUNITY QUEST: REFLECTION PORTFOLIO</h1>
            <p className="worksheet-subtitle">Theme D: Governance & Democracy · Chapter 9: Family and Community</p>
          </header>

          <div className="student-details-grid">
            <div className="detail-field"><strong>Student Name:</strong> ___________________________</div>
            <div className="detail-field"><strong>Class & Section:</strong> 6 - _____</div>
            <div className="detail-field"><strong>Roll Number:</strong> _______</div>
            <div className="detail-field"><strong>Date:</strong> ______________</div>
          </div>

          <section className="worksheet-section">
            <h2 className="section-title">📊 Part 1: Quest Summary & Community Vitality</h2>
            <div className="summary-boxes">
              <div className="summary-box">
                <span className="summary-num">{state.teams.A.score + state.teams.B.score}</span>
                <span className="summary-lbl">Total Community Score</span>
              </div>
              <div className="summary-box">
                <span className="summary-num">{state.vitality.happiness}%</span>
                <span className="summary-lbl">Happiness Index</span>
              </div>
              <div className="summary-box">
                <span className="summary-num">{state.vitality.fairness}%</span>
                <span className="summary-lbl">Fairness & Equity</span>
              </div>
              <div className="summary-box">
                <span className="summary-num">{state.vitality.environment}%</span>
                <span className="summary-lbl">Environment & Health</span>
              </div>
            </div>
          </section>

          <section className="worksheet-section">
            <h2 className="section-title">✍️ Part 2: Critical Thinking & Reflections</h2>
            <div className="question-item">
              <label>1. Interdependence: Name two everyday examples of how your family depends on workers and places in your local community (e.g. sanitation, local store, clinic, bus driver).</label>
              <div className="answer-lines">
                <div className="line" />
                <div className="line" />
              </div>
            </div>

            <div className="question-item">
              <label>2. Fairness vs. Equality: In the Sharing Challenge, why is it fairer to give more resources to those with greater needs instead of dividing everything equally?</label>
              <div className="answer-lines">
                <div className="line" />
                <div className="line" />
              </div>
            </div>

            <div className="question-item">
              <label>3. Shared Responsibility: Mention one chore or responsibility you can take up at home or in your neighborhood this week to practice cooperation.</label>
              <div className="answer-lines">
                <div className="line" />
                <div className="line" />
              </div>
            </div>
          </section>

          <section className="worksheet-certificate">
            <div className="cert-border">
              <h3>📜 CERTIFICATE OF CIVIC PARTICIPATION</h3>
              <p>This certifies that _________________________ has successfully explored the principles of cooperation, mutual care, and community governance in Class VI Social Science.</p>
              <div className="signature-row">
                <div className="sig-block">
                  <div className="sig-line" />
                  <span>Student Signature</span>
                </div>
                <div className="sig-block">
                  <div className="sig-line" />
                  <span>Teacher / Parent Signature</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
