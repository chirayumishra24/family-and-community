export interface ConsequenceResult {
  steps: { text: string; emoji: string; isPositive: boolean }[];
  overallSuccess: boolean;
  message: string;
}

export function evaluateDecisions(
  selectedActions: string[],
  correctOrder: string[],
  allActions: { id: string; label: string }[]
): ConsequenceResult {
  const steps: ConsequenceResult['steps'] = [];
  let correctCount = 0;

  selectedActions.forEach((actionId, idx) => {
    const action = allActions.find(a => a.id === actionId);
    const isCorrectPosition = correctOrder[idx] === actionId;
    const isInCorrectSet = correctOrder.includes(actionId);

    if (isCorrectPosition) {
      steps.push({ text: `${action?.label || actionId} — Good choice at the right time!`, emoji: '✅', isPositive: true });
      correctCount++;
    } else if (isInCorrectSet) {
      steps.push({ text: `${action?.label || actionId} — Right idea, but the timing could be better.`, emoji: '🔄', isPositive: true });
      correctCount += 0.5;
    } else {
      steps.push({ text: `${action?.label || actionId} — This might not help right now.`, emoji: '⚠️', isPositive: false });
    }
  });

  const ratio = correctCount / correctOrder.length;
  const overallSuccess = ratio >= 0.6;

  return {
    steps,
    overallSuccess,
    message: ratio >= 0.8
      ? 'Excellent planning! The community benefits from your thoughtful approach.'
      : ratio >= 0.5
      ? 'Good effort! A few adjustments would make your plan even better.'
      : 'Think about the order of steps. What needs to happen first before other things can work?',
  };
}

export function evaluateDistribution(
  distribution: Record<string, number>,
  needs: { id: string; minimum: number; requested: number }[],
  totalTokens: number
): { fair: boolean; message: string; details: { id: string; received: number; status: string }[] } {
  const details = needs.map(need => {
    const received = distribution[need.id] || 0;
    let status = '';
    if (received >= need.requested) status = 'Fully supported';
    else if (received >= need.minimum) status = 'Basic needs met';
    else if (received > 0) status = 'Needs more support';
    else status = 'Not supported';
    return { id: need.id, received, status };
  });

  const allMinMet = needs.every(n => (distribution[n.id] || 0) >= n.minimum);
  const totalUsed = Object.values(distribution).reduce((s, v) => s + v, 0);
  const withinBudget = totalUsed <= totalTokens;

  return {
    fair: allMinMet && withinBudget,
    message: allMinMet
      ? 'Well done! You considered everyone\'s basic needs while working within the available resources.'
      : 'Some places did not receive enough support. Fair decisions consider different needs and the resources available.',
    details,
  };
}
