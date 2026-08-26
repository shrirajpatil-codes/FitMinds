/**
 * FITMINDS Mock User Profile & Context Data
 */
export const initialUserProfile = {
  id: 'usr_student_01',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  role: 'Computer Science Undergraduate',
  age: 21,
  fitnessLevel: 'Intermediate',
  goal: 'Improve consistency & build strength around classes',
  availableTime: '20 min',
  preferredWindow: 'Evening',
  equipment: 'Basic equipment (Dumbbells, Mat)',
  lifestyleLoad: 'Moderate (Midterm Exam Week)',
  onboardingCompleted: true,
};

export const initialDailyContext = {
  readiness: 'READY', // 'READY' | 'MODERATE' | 'RECOVERY'
  energyLevel: 'Good',
  availableTimeMinutes: 20,
  scheduleWindow: 'Evening',
  academicLoad: 'Moderate',
  lastCheckinTime: 'Today at 08:30 AM',
  contextSummary: 'FITMINDS used your 20-min window & moderate academic load to shape today\'s session.',
};
