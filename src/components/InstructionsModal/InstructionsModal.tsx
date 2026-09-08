import { useState, useEffect } from 'react';
import './InstructionsModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'overview' | 'flow' | 'challenges' | 'tokens' | 'final';

export default function InstructionsModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="instructions-backdrop" onClick={onClose}>
      <div className="instructions-modal" onClick={e => e.stopPropagation()}>
        <div className="instructions-header">
          <div className="instructions-header-title">
            <span className="instructions-header-icon">📖</span>
            <div>
              <h2>Activity Guide & Instructions</h2>
              <p>Class VI Social Science · Theme D: Governance & Democracy · Chapter 9: Family & Community</p>
            </div>
          </div>
          <button className="instructions-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <nav className="instructions-tabs">
          <button
            className={`instructions-tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            🌟 Overview
          </button>
          <button
            className={`instructions-tab ${activeTab === 'flow' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('flow')}
          >
            🔄 How to Play
          </button>
          <button
            className={`instructions-tab ${activeTab === 'challenges' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('challenges')}
          >
            🎯 6 Challenges
          </button>
          <button
            className={`instructions-tab ${activeTab === 'tokens' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            🪙 Tokens & Map
          </button>
          <button
            className={`instructions-tab ${activeTab === 'final' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('final')}
          >
            🏆 Final Project
          </button>
        </nav>

        <div className="instructions-body">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h3>🏘️ Welcome to The Community Quest!</h3>
              <p>
                In this interactive digital activity, your class explores how families and communities depend on each other,
                solve real-world challenges, share responsibilities, and work toward the common good.
              </p>

              <div className="guide-card-grid">
                <div className="guide-card">
                  <span className="guide-card-icon">👨‍👩‍👦</span>
                  <h4>The Family Foundation</h4>
                  <p>Discover how family members divide roles, support each other with care, and balance household responsibilities.</p>
                </div>
                <div className="guide-card">
                  <span className="guide-card-icon">🌐</span>
                  <h4>Interdependence</h4>
                  <p>No family is an island. See how we rely on health centres, schools, transport, sanitation, and markets every day.</p>
                </div>
                <div className="guide-card">
                  <span className="guide-card-icon">🤝</span>
                  <h4>Cooperation & Fairness</h4>
                  <p>Learn to resolve neighborhood disputes, allocate scarce resources with equity, and value every citizen's perspective.</p>
                </div>
              </div>

              <div className="guide-highlight-box">
                <strong>Core Theme:</strong> "Every choice affects someone. A strong community is built when everyone participates and cares for each other."
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="tab-content">
              <h3>🔄 How the Activity Works</h3>
              <ol className="flow-steps">
                <li className="flow-step-item">
                  <div className="flow-step-num">1</div>
                  <div className="flow-step-content">
                    <h4>Form Two Teams</h4>
                    <p>Divide the class into <strong>Team A</strong> (Community Builders) and <strong>Team B</strong> (Community Connectors). Both teams can customize their names.</p>
                  </div>
                </li>
                <li className="flow-step-item">
                  <div className="flow-step-num">2</div>
                  <div className="flow-step-content">
                    <h4>Take Turns on the Community Board</h4>
                    <p>Teams alternate turns across 6 rounds. The active team selects an available challenge category and clicks <strong>START CHALLENGE</strong>.</p>
                  </div>
                </li>
                <li className="flow-step-item">
                  <div className="flow-step-num">3</div>
                  <div className="flow-step-content">
                    <h4>Collaborate & Solve</h4>
                    <p>Discuss as a group! Drag tasks, draw connections, sequence emergency actions, or distribute resources fairly.</p>
                  </div>
                </li>
                <li className="flow-step-item">
                  <div className="flow-step-num">4</div>
                  <div className="flow-step-content">
                    <h4>Earn Points & Community Tokens</h4>
                    <p>Correct decisions earn points and unlock special tokens that build and activate neighborhood buildings on the map.</p>
                  </div>
                </li>
                <li className="flow-step-item">
                  <div className="flow-step-num">5</div>
                  <div className="flow-step-content">
                    <h4>Collaborative Final Project</h4>
                    <p>After completing at least 4 challenges, both teams join forces in the grand Final Project to build a better community together!</p>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="tab-content">
              <h3>🎯 The 6 Challenge Categories</h3>
              <div className="challenge-guide-list">
                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-who)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-who)' }}>👨‍👩‍👧 WHO?</div>
                  <div className="challenge-guide-text">
                    <h4>Family Roles & Mutual Care</h4>
                    <p>Assign daily chores and caregiving responsibilities fairly. Learn that housework and caring for family members is valuable work that everyone should share.</p>
                  </div>
                </div>

                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-connect)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-connect)' }}>🔗 CONNECT</div>
                  <div className="challenge-guide-text">
                    <h4>Relationships & Public Institutions</h4>
                    <p>Draw meaningful links between families and key community places like the school, clinic, local store, public transport, and community park.</p>
                  </div>
                </div>

                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-solve)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-solve)' }}>🛠️ SOLVE</div>
                  <div className="challenge-guide-text">
                    <h4>Community Crises & Team Action</h4>
                    <p>When an unexpected crisis strikes (e.g. water pipeline burst, park clean-up needed), sequence actions in the right order to fix the problem safely.</p>
                  </div>
                </div>

                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-share)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-share)' }}>⚖️ SHARE</div>
                  <div className="challenge-guide-text">
                    <h4>Fairness & Meeting Needs</h4>
                    <p>Allocate limited community resources (water rations, relief kits, library books) based on actual needs and equity, not just equal division.</p>
                  </div>
                </div>

                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-detective)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-detective)' }}>🔍 DETECTIVE</div>
                  <div className="challenge-guide-text">
                    <h4>Find the Root Cause</h4>
                    <p>Examine clue cards in sequence to find out why a neighborhood issue happened, and identify positive civic habits to prevent it in the future.</p>
                  </div>
                </div>

                <div className="challenge-guide-item" style={{ borderColor: 'var(--cat-stories)' }}>
                  <div className="challenge-guide-badge" style={{ background: 'var(--cat-stories)' }}>📖 STORIES</div>
                  <div className="challenge-guide-text">
                    <h4>Empathy & Diverse Perspectives</h4>
                    <p>Read what different neighbors (elderly residents, shopkeepers, working parents, children) feel about a local issue and choose solutions that respect all voices.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="tab-content">
              <h3>🪙 Community Tokens & The Map</h3>
              <p>Every successful challenge rewards your team with Community Values Tokens. Each token represents an essential pillar of community life:</p>

              <div className="tokens-grid">
                <div className="token-card">
                  <span className="token-card-emoji">🏠</span>
                  <strong>Family Token</strong>
                  <span>Supports caring relationships, shared chores, and respect at home.</span>
                </div>
                <div className="token-card">
                  <span className="token-card-emoji">🤝</span>
                  <strong>Cooperation Token</strong>
                  <span>Awarded when teams work together to solve shared challenges.</span>
                </div>
                <div className="token-card">
                  <span className="token-card-emoji">🔗</span>
                  <strong>Connection Token</strong>
                  <span>Links families with public facilities and local support networks.</span>
                </div>
                <div className="token-card">
                  <span className="token-card-emoji">💬</span>
                  <strong>Communication Token</strong>
                  <span>Earned by listening, discussing, and resolving misunderstandings.</span>
                </div>
                <div className="token-card">
                  <span className="token-card-emoji">⚖️</span>
                  <strong>Fairness Token</strong>
                  <span>Reflects just resource sharing, equity, and inclusion for all.</span>
                </div>
                <div className="token-card">
                  <span className="token-card-emoji">🌳</span>
                  <strong>Community Token</strong>
                  <span>Protects public spaces, clean environment, and civic pride.</span>
                </div>
              </div>

              <div className="guide-highlight-box" style={{ marginTop: '16px' }}>
                <strong>The Community Map:</strong> Watch grey buildings transform into colorful, active institutions as you solve challenges! Web lines will connect families to schools, shops, and clinics.
              </div>
            </div>
          )}

          {activeTab === 'final' && (
            <div className="tab-content">
              <h3>🏆 The Final Challenge & Community Celebration</h3>
              <div className="guide-card-grid">
                <div className="guide-card">
                  <span className="guide-card-icon">🏗️</span>
                  <h4>Build a Better Community</h4>
                  <p>Unlocks when 4 categories are completed. Both teams collaborate on a 3-phase master project such as creating a Community Garden or a Safe Neighborhood Route.</p>
                </div>
                <div className="guide-card">
                  <span className="guide-card-icon">📊</span>
                  <h4>Balancing Priorities</h4>
                  <p>Make joint decisions to balance budget, volunteer hours, and community happiness without running out of resources.</p>
                </div>
                <div className="guide-card">
                  <span className="guide-card-icon">📜</span>
                  <h4>Certificate of Achievement</h4>
                  <p>View your team's collective civic impact report, key learning reflections, and print or download your Class Certificate!</p>
                </div>
              </div>

              <div className="guide-highlight-box" style={{ marginTop: '16px' }}>
                <strong>Tip for Success:</strong> There are no losers in a healthy community! Teams earn individual points, but the final score reflects how well the community thrived together.
              </div>
            </div>
          )}
        </div>

        <div className="instructions-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Got it, Let's Play! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
