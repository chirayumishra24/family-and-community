import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../state/gameStore';
import ChallengeShell from '../../components/ChallengeShell/ChallengeShell';
import { playSound } from '../../utils/audio';
import type { FamilyChallenge } from '../../types/game';
import './WhoChallenge.css';

export default function WhoChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const challenge = state.currentChallenge as FamilyChallenge | null;

  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  if (!challenge) { navigate('/9-3-community-board'); return null; }

  const assignedTasks = Object.values(assignments).flat();

  const handleDrop = (personId: string) => {
    if (!draggedTask || submitted) return;
    const current = assignments[personId] || [];
    if (current.length >= challenge.maxTasksPerPerson) return;
    if (current.includes(draggedTask)) return;

    // Remove from other person
    const newAssignments = { ...assignments };
    for (const pid of Object.keys(newAssignments)) {
      newAssignments[pid] = newAssignments[pid].filter(t => t !== draggedTask);
    }
    newAssignments[personId] = [...(newAssignments[personId] || []).filter(t => t !== draggedTask), draggedTask];
    setAssignments(newAssignments);
    playSound('click', state.settings.soundEnabled);
    setDraggedTask(null);
  };

  const handleClickAssign = (taskId: string, personId: string) => {
    if (submitted) return;
    const current = assignments[personId] || [];
    if (current.includes(taskId)) {
      // Remove
      setAssignments({ ...assignments, [personId]: current.filter(t => t !== taskId) });
      return;
    }
    if (current.length >= challenge.maxTasksPerPerson) return;
    // Remove from others
    const newAssignments = { ...assignments };
    for (const pid of Object.keys(newAssignments)) {
      newAssignments[pid] = newAssignments[pid].filter(t => t !== taskId);
    }
    newAssignments[personId] = [...(newAssignments[personId] || []).filter(t => t !== taskId), taskId];
    setAssignments(newAssignments);
    playSound('click', state.settings.soundEnabled);
  };

  const handleSubmit = () => {
    if (assignedTasks.length < challenge.tasks.length) return;
    setSubmitted(true);

    // Check fairness: no person has more than maxTasksPerPerson and all tasks assigned
    const counts = Object.values(assignments).map(a => a.length);
    const maxCount = Math.max(...counts, 0);
    const minCount = Math.min(...counts.filter(c => c > 0), 0);
    const isBalanced = maxCount <= challenge.maxTasksPerPerson && assignedTasks.length === challenge.tasks.length;

    const points = isBalanced ? challenge.points : Math.max(1, Math.floor(challenge.points / 2));
    if (state.hintUsed) {
      dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points: Math.max(1, points - 3) });
    } else {
      dispatch({ type: 'ADD_SCORE', team: state.currentTeam, points });
    }
    dispatch({ type: 'ADD_TOKEN', team: state.currentTeam, token: 'family' });
    dispatch({ type: 'ACTIVATE_BUILDING', building: 'homes' });
    playSound(isBalanced ? 'correct' : 'incorrect', state.settings.soundEnabled);
  };

  const handleContinue = () => {
    dispatch({ type: 'COMPLETE_CATEGORY', category: 'who' });
    dispatch({ type: 'CLEAR_CHALLENGE' });
    dispatch({ type: 'NEXT_TURN' });
    dispatch({ type: 'SET_PHASE', phase: 'hub' });
    navigate('/9-3-community-board');
  };

  return (
    <ChallengeShell title={challenge.title} emoji="👨‍👩‍👧" categoryColor="var(--cat-who)" onBack={() => { dispatch({ type: 'CLEAR_CHALLENGE' }); navigate('/9-3-community-board'); }}>
      <div className="who-challenge">
        <div className="who-scenario card">
          <p className="who-prompt">{challenge.prompt}</p>
          <p className="who-scenario-text">{challenge.scenario}</p>
        </div>

        {!submitted && !showHint && challenge.hint && (
          <button className="hint-btn" onClick={() => { setShowHint(true); dispatch({ type: 'USE_HINT' }); }}>💡 Need a Hint? (−3 pts)</button>
        )}
        {showHint && <div className="hint-box">{challenge.hint}</div>}

        {/* Task Pool */}
        <div className="who-tasks">
          <h3>Tasks to Assign</h3>
          <div className="task-pool">
            {challenge.tasks.map(task => {
              const isAssigned = assignedTasks.includes(task.id);
              return (
                <div
                  key={task.id}
                  className={`task-card ${isAssigned ? 'task-assigned' : ''} ${draggedTask === task.id ? 'task-dragging' : ''}`}
                  draggable={!submitted && !isAssigned}
                  onDragStart={() => setDraggedTask(task.id)}
                  onClick={() => !submitted && !isAssigned && setDraggedTask(draggedTask === task.id ? null : task.id)}
                >
                  <span className="task-emoji">{task.emoji}</span>
                  <span>{task.label}</span>
                  {draggedTask === task.id && <span className="task-selected-indicator">✦</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* People */}
        <div className="who-people">
          {challenge.people.map(person => (
            <div
              key={person.id}
              className={`person-card ${draggedTask ? 'person-droppable' : ''}`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(person.id)}
              onClick={() => draggedTask && handleClickAssign(draggedTask, person.id)}
            >
              <div className="person-header">
                <span className="person-emoji">{person.emoji}</span>
                <span className="person-name">{person.label}</span>
                <span className="person-slots">{(assignments[person.id] || []).length}/{challenge.maxTasksPerPerson}</span>
              </div>
              <div className="person-tasks">
                {(assignments[person.id] || []).map(taskId => {
                  const task = challenge.tasks.find(t => t.id === taskId);
                  return task ? (
                    <div key={taskId} className="assigned-task" onClick={e => { e.stopPropagation(); if (!submitted) { setAssignments({ ...assignments, [person.id]: (assignments[person.id] || []).filter(t => t !== taskId) }); } }}>
                      {task.emoji} {task.label} {!submitted && <span className="remove-task">×</span>}
                    </div>
                  ) : null;
                })}
                {(assignments[person.id] || []).length === 0 && <div className="person-empty">Drop tasks here</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Submit / Feedback */}
        {!submitted ? (
          <button className="btn btn-primary btn-large who-submit" onClick={handleSubmit} disabled={assignedTasks.length < challenge.tasks.length}>
            ✅ Submit Assignment
          </button>
        ) : (
          <div className="who-feedback card">
            <div className="feedback-header">
              <span className="feedback-icon">🏠</span>
              <h3>Family Token Earned!</h3>
            </div>
            <p>{Object.values(assignments).every(a => a.length <= challenge.maxTasksPerPerson) && assignedTasks.length === challenge.tasks.length ? challenge.feedbackCorrect : challenge.feedbackIncorrect}</p>
            <button className="btn btn-success btn-large" onClick={handleContinue}>Continue →</button>
          </div>
        )}
      </div>
    </ChallengeShell>
  );
}
