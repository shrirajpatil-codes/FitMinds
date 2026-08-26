/**
 * FITMINDS AI Decision History Mock Data
 */
export const decisionHistoryList = [
  {
    id: 'dec_01',
    date: 'TODAY — 08:30 AM',
    title: 'Workout Shortened (30 min → 20 min)',
    badge: 'REDUCED WORKLOAD',
    badgeVariant: 'reduced',
    reason: 'Limited evening availability reported during daily check-in.',
    whatChanged: 'Reduced total volume from 5 exercises to 4 exercises and capped session time to 20 minutes.',
    whyItChanged: 'Maintaining daily consistency during midterm preparation is prioritized over heavy volume.',
    signalsInfluenced: ['Check-in available time: 20 min', 'Academic workload: Moderate', 'Consistency streak: 4 days'],
    outcome: 'Session status: Ready to complete.',
  },
  {
    id: 'dec_02',
    date: 'YESTERDAY — 09:15 AM',
    title: 'Standard Workout Preserved',
    badge: 'PLAN UNCHANGED',
    badgeVariant: 'healthy',
    reason: 'High energy & ready status reported during morning check-in.',
    whatChanged: 'Maintained full 20-minute Full Body Strength protocol.',
    whyItChanged: 'Student schedule had no exam conflicts and energy reserves were optimal.',
    signalsInfluenced: ['Readiness: READY', 'Energy: Good', 'Sleep rating: 8 hrs'],
    outcome: 'Workout completed successfully (20 min).',
  },
  {
    id: 'dec_03',
    date: 'MONDAY — 07:45 AM',
    title: 'Recovery Session Suggested',
    badge: 'RECOVERY FOCUS',
    badgeVariant: 'recovery',
    reason: 'Low sleep & high assignment deadline stress detected.',
    whatChanged: 'Swapped high-intensity core work for 15-minute spine mobility & diaphragmatic breathing.',
    whyItChanged: 'High cortisol and fatigue increase burnout risk. Low-stress movement preserves habit without physical strain.',
    signalsInfluenced: ['Readiness: LOW', 'Academic load: High', 'Reported fatigue: High'],
    outcome: 'Completed 15-min recovery workout. Habit preserved.',
  }
];
