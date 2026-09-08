import type { VitalityMetrics } from '../../types/game';
import './VitalityBar.css';

interface Props {
  vitality: VitalityMetrics;
  isHindi?: boolean;
}

export default function VitalityBar({ vitality, isHindi = false }: Props) {
  return (
    <div className="vitality-bar-container">
      <div className="vitality-metric">
        <div className="vitality-label">
          <span>😊</span>
          <span className="vitality-name">{isHindi ? 'समुदाय की खुशी' : 'Community Happiness'}</span>
          <span className="vitality-value">{vitality.happiness}%</span>
        </div>
        <div className="vitality-track">
          <div
            className="vitality-fill fill-happiness"
            style={{ width: `${vitality.happiness}%` }}
          />
        </div>
      </div>

      <div className="vitality-metric">
        <div className="vitality-label">
          <span>⚖️</span>
          <span className="vitality-name">{isHindi ? 'समानता और न्याय' : 'Fairness & Equity'}</span>
          <span className="vitality-value">{vitality.fairness}%</span>
        </div>
        <div className="vitality-track">
          <div
            className="vitality-fill fill-fairness"
            style={{ width: `${vitality.fairness}%` }}
          />
        </div>
      </div>

      <div className="vitality-metric">
        <div className="vitality-label">
          <span>🌿</span>
          <span className="vitality-name">{isHindi ? 'पर्यावरण व स्वास्थ्य' : 'Environment & Health'}</span>
          <span className="vitality-value">{vitality.environment}%</span>
        </div>
        <div className="vitality-track">
          <div
            className="vitality-fill fill-environment"
            style={{ width: `${vitality.environment}%` }}
          />
        </div>
      </div>
    </div>
  );
}
