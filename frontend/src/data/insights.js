/**
 * FITMINDS Adaptive AI Insights & Strategy Health Mock Data
 */
export const adaptiveInsights = [
  {
    id: 'ins_1',
    title: 'FITMINDS INSIGHT',
    summary: 'Your 20-minute sessions have been easier to complete during evening study windows.',
    explanation: 'FITMINDS observed that workouts scheduled after 6:00 PM with durations under 25 minutes have a 92% completion rate, whereas morning workouts had frequent postponements.',
    type: 'recommendation',
    date: 'Today',
  },
  {
    id: 'ins_2',
    title: 'CONSISTENCY PATTERN',
    summary: 'Exam week workload detected. FITMINDS automatically prioritized stress-relief mobility.',
    explanation: 'When academic load rises, maintaining session momentum with reduced volume prevents the streak-reset penalty.',
    type: 'pattern',
    date: 'Yesterday',
  }
];

export const strategyHealthData = {
  status: 'HEALTHY', // 'HEALTHY' | 'ADJUSTING' | 'NEEDS ATTENTION'
  headline: 'Your current routine fits your student schedule well.',
  detail: 'FITMINDS is balancing exam week academic stress with lightweight 20-minute movement windows.',
  signals: [
    { label: 'Completion Rate', value: '88%', status: 'Good', detail: '4 of 5 sessions done this week' },
    { label: 'Schedule Fit', value: 'High', status: 'Good', detail: 'Sessions match evening availability' },
    { label: 'Recent Modifications', value: 'Low Risk', status: 'Good', detail: 'Plan adjustments kept workout momentum' },
    { label: 'Consistency Horizon', value: 'Improving', status: 'Good', detail: 'Streak maintained for 4 consecutive days' },
  ],
  upcomingAdaptations: [
    'FITMINDS will keep session durations at 15–20 minutes through Friday to accommodate midterm project deadlines.',
    'A 10-minute active recovery focus will be suggested if Friday daily check-in reports high fatigue.'
  ],
  isMockData: true,
};
