/**
 * FITMINDS Fitness Experiments Mock Data
 */
export const activeExperiments = [
  {
    id: 'exp_01',
    title: '20-Minute Evening Micro-Sessions',
    status: 'ACTIVE',
    badgeVariant: 'brand',
    currentStrategy: '30-minute standard workouts',
    testStrategy: '20-minute concentrated micro-workouts',
    reason: 'Your completion rate dropped during 30-minute sessions on assignment submission days. Testing if 20-minute caps preserve habit momentum.',
    startDate: '3 days ago',
    durationDays: 7,
    metrics: {
      completionRate: '100% (3/3 sessions)',
      perceivedExertion: 'Optimal (7/10)',
      scheduleFitScore: '9.4/10',
    },
    userFeedback: 'Felt much more manageable after 4 hours of coding lab.',
  }
];

export const pastExperiments = [
  {
    id: 'exp_00',
    title: 'Post-Lecture Mobility Stretch',
    status: 'COMPLETED',
    badgeVariant: 'ready',
    currentStrategy: 'No post-lecture movement',
    testStrategy: '5-minute posture relief after 3-hour lectures',
    outcome: 'Adopted into core routine — reduced back fatigue by 35%.',
  }
];
