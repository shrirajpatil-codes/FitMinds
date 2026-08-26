/**
 * FITMINDS Mock Progress & Consistency Data
 */
export const progressData = {
  currentStreakDays: 4,
  weeklyCompletedSessions: 4,
  weeklyTargetSessions: 5,
  totalSessionsCompleted: 28,
  sessionsModifiedCount: 6,
  completionRatePercent: 88,
  
  weeklyTrend: [
    { day: 'Mon', completed: true, duration: 20, status: 'Full Session', energy: 'Good' },
    { day: 'Tue', completed: true, duration: 15, status: 'Adjusted (-5m)', energy: 'Moderate' },
    { day: 'Wed', completed: true, duration: 20, status: 'Full Session', energy: 'High' },
    { day: 'Thu', completed: true, duration: 20, status: 'Full Session', energy: 'Good' },
    { day: 'Fri', completed: false, duration: 0, status: 'Scheduled (Today)', energy: 'Pending' },
    { day: 'Sat', completed: false, duration: 0, status: 'Rest / Optional', energy: 'Pending' },
    { day: 'Sun', completed: false, duration: 0, status: 'Planned 15m', energy: 'Pending' },
  ],

  insightNote: "What's changing? You completed 100% of your 20-minute sessions during high exam load weeks compared to only 40% completion when assigned 45-minute workouts.",
  isMockData: true,
};
