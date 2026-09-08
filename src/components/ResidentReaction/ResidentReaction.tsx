import type { ResidentReactionData } from '../../types/game';
import './ResidentReaction.css';

interface Props {
  reaction: ResidentReactionData | null;
  onClose: () => void;
}

export default function ResidentReaction({ reaction, onClose }: Props) {
  if (!reaction) return null;

  return (
    <div className="resident-reaction-toast" onClick={onClose}>
      <div className="resident-avatar-bubble">
        <span className="resident-avatar-emoji">{reaction.avatar}</span>
      </div>
      <div className="resident-reaction-content">
        <div className="resident-header">
          <strong className="resident-name">{reaction.name}</strong>
          <span className="resident-role">{reaction.role}</span>
        </div>
        <p className="resident-quote">"{reaction.quote}"</p>
      </div>
      <button className="resident-close" onClick={onClose} title="Dismiss">✕</button>
    </div>
  );
}
