import { CHALLENGE_TEMPLATES } from './constants';

export function today() {
  return new Date().toISOString().split('T')[0];
}

export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function isHabitDoneToday(habit) {
  const t = today();
  return (habit.completions?.[t] || 0) >= habit.targetCount;
}

export function getTodayCount(habit) {
  return habit.completions?.[today()] || 0;
}

export function getStreak(completions) {
  if (!completions) return 0;
  const donedays = Object.entries(completions)
    .filter(([, v]) => v > 0)
    .map(([d]) => d)
    .sort((a, b) => (a < b ? 1 : -1));
  if (donedays.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateStr of donedays) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor - d) / 86400000);
    if (diff === 0 || diff === 1) { streak++; cursor = d; }
    else break;
  }
  return streak;
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

export function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
}

export function xpToLevel(xp) {
  return Math.floor(Math.sqrt((xp || 0) / 100)) + 1;
}

export function xpForLevel(level) {
  return Math.pow(level - 1, 2) * 100;
}

export function shortDay(dateStr) {
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][new Date(dateStr + 'T12:00:00').getDay()];
}

// Works for both predefined and custom (isCustom) challenges
export function getChallengeProgress(challenge, habits) {
  let type, target;
  if (challenge.isCustom) {
    type = challenge.type;
    target = challenge.target;
  } else {
    const template = CHALLENGE_TEMPLATES.find(t => t.id === challenge.templateId);
    if (!template) return { current: 0, target: 0 };
    type = template.type;
    target = template.target;
  }

  if (type === 'streak') {
    const habit = habits.find(h => h.id === challenge.habitId);
    if (!habit) return { current: 0, target };
    return { current: Math.min(getStreak(habit.completions), target), target };
  }

  if (type === 'all_habits') {
    if (habits.length === 0) return { current: 0, target };
    const startDate = new Date(challenge.startDate);
    let count = 0;
    for (let i = 0; i < target; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (new Date(dateStr) > new Date()) break;
      const allDone = habits.every(h => (h.completions?.[dateStr] || 0) >= h.targetCount);
      if (allDone) count++;
      else break;
    }
    return { current: count, target };
  }

  return { current: 0, target };
}

export function getChallengeInfo(challenge) {
  if (challenge.isCustom) {
    return { title: challenge.title, icon: challenge.icon, xpReward: challenge.xpReward };
  }
  const t = CHALLENGE_TEMPLATES.find(t => t.id === challenge.templateId);
  return { title: t?.title ?? '', icon: t?.icon ?? '🏆', xpReward: t?.xpReward ?? 0 };
}

export function formatReminderTime(hour, minute) {
  const h = hour % 12 || 12;
  const m = String(minute).padStart(2, '0');
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${m} ${ampm}`;
}
