export const COLORS = {
  bg: '#FFFFFF',          // Notion page white
  card: '#F7F7F5',        // Notion block gray
  accent: '#2383E2',      // Notion blue
  accentLight: '#2383E2', // same — Notion uses one blue
  success: '#0F9B8E',     // Notion teal
  danger: '#EB5757',      // Notion red
  text: '#37352F',        // Notion warm near-black
  subtext: '#9B9A97',     // Notion muted text
  border: '#E9E9E7',      // very subtle separator
  inputBg: '#F1F1EF',     // slightly off-white inputs
  gold: '#DFAB01',        // Notion yellow (XP)
  tabBar: '#FFFFFF',
};

export const STORAGE_KEYS = {
  habits: '@habits_v2',
  challenges: '@challenges_v1',
  profile: '@user_profile_v1',
};

export const XP_VALUES = {
  habitComplete: 10,
  allHabitsComplete: 50,
  streakMilestone3: 100,
  streakMilestone7: 250,
  streakMilestone30: 1000,
};

export const PRESET_HABITS = [
  { icon: '💧', name: 'Drink 8 glasses of water', type: 'volume', targetCount: 8 },
  { icon: '🏃', name: 'Exercise 30 minutes', type: 'binary', targetCount: 1 },
  { icon: '📚', name: 'Read for 20 minutes', type: 'binary', targetCount: 1 },
  { icon: '🧘', name: 'Meditate', type: 'binary', targetCount: 1 },
  { icon: '😴', name: 'Sleep by 11 PM', type: 'binary', targetCount: 1 },
  { icon: '💪', name: 'Work out 3 sets', type: 'volume', targetCount: 3 },
  { icon: '🌅', name: 'Morning Run', type: 'binary', targetCount: 1 },
  { icon: '🥗', name: 'Eat a Healthy Meal', type: 'binary', targetCount: 1 },
  { icon: '📝', name: 'Journal', type: 'binary', targetCount: 1 },
  { icon: '💊', name: 'Take Vitamins', type: 'binary', targetCount: 1 },
  { icon: '🚶', name: 'Walk 10,000 Steps', type: 'binary', targetCount: 1 },
];

export const CHALLENGE_TEMPLATES = [
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Complete a habit 7 days in a row',
    icon: '🔥',
    type: 'streak',
    target: 7,
    xpReward: 300,
  },
  {
    id: 'streak_14',
    title: 'Fortnight Warrior',
    description: 'Maintain a habit for 14 consecutive days',
    icon: '⚔️',
    type: 'streak',
    target: 14,
    xpReward: 700,
  },
  {
    id: 'streak_30',
    title: '30-Day Champion',
    description: 'Maintain a habit for 30 days straight',
    icon: '🏆',
    type: 'streak',
    target: 30,
    xpReward: 1500,
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete ALL habits every day for 7 days',
    icon: '⭐',
    type: 'all_habits',
    target: 7,
    xpReward: 500,
  },
];
