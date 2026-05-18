import { supabase } from './supabase';

// ── Habit mapping ────────────────────────────────────────────────────────────

function habitToRow(habit, userId) {
  return {
    id: habit.id,
    user_id: userId,
    name: habit.name,
    icon: habit.icon,
    type: habit.type,
    target_count: habit.targetCount,
    completions: habit.completions || {},
    created_at: habit.createdAt,
    reminder_hour: habit.reminderHour ?? null,
    reminder_minute: habit.reminderMinute ?? null,
  };
}

function rowToHabit(row) {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    type: row.type,
    targetCount: row.target_count,
    completions: row.completions || {},
    createdAt: row.created_at,
    reminderHour: row.reminder_hour,
    reminderMinute: row.reminder_minute,
  };
}

// ── Challenge mapping ────────────────────────────────────────────────────────

function challengeToRow(c, userId) {
  return {
    id: c.id,
    user_id: userId,
    template_id: c.templateId ?? null,
    habit_id: c.habitId ?? null,
    start_date: c.startDate,
    status: c.status,
    completed_date: c.completedDate ?? null,
    is_custom: c.isCustom ?? false,
    title: c.title ?? null,
    description: c.description ?? null,
    icon: c.icon ?? null,
    type: c.type ?? null,
    target: c.target ?? null,
    xp_reward: c.xpReward ?? null,
  };
}

function rowToChallenge(row) {
  return {
    id: row.id,
    templateId: row.template_id,
    habitId: row.habit_id,
    startDate: row.start_date,
    status: row.status,
    completedDate: row.completed_date,
    isCustom: row.is_custom,
    title: row.title,
    description: row.description,
    icon: row.icon,
    type: row.type,
    target: row.target,
    xpReward: row.xp_reward,
  };
}

// ── Pull ─────────────────────────────────────────────────────────────────────

export async function pullFromSupabase(userId) {
  const [habitsRes, challengesRes, profileRes] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('challenges').select('*').eq('user_id', userId),
    supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  return {
    habits: (habitsRes.data || []).map(rowToHabit),
    challenges: (challengesRes.data || []).map(rowToChallenge),
    profile: profileRes.data ? { xp: profileRes.data.xp } : null,
  };
}

// ── Push ─────────────────────────────────────────────────────────────────────

export async function pushHabitsToSupabase(userId, habits) {
  if (!userId || habits.length === 0) return;
  await supabase
    .from('habits')
    .upsert(habits.map(h => habitToRow(h, userId)), { onConflict: 'id' });
}

export async function pushChallengesToSupabase(userId, challenges) {
  if (!userId) return;
  if (challenges.length === 0) return;
  await supabase
    .from('challenges')
    .upsert(challenges.map(c => challengeToRow(c, userId)), { onConflict: 'id' });
}

export async function pushProfileToSupabase(userId, profile) {
  if (!userId) return;
  await supabase
    .from('profiles')
    .upsert({ user_id: userId, xp: profile.xp }, { onConflict: 'user_id' });
}

export async function deleteHabitFromSupabase(userId, habitId) {
  if (!userId) return;
  await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId);
}

// Upload all local data to a fresh Supabase account (first-time migration).
export async function uploadLocalDataToSupabase(userId, { habits, challenges, profile }) {
  await Promise.all([
    habits.length > 0 ? pushHabitsToSupabase(userId, habits) : Promise.resolve(),
    challenges.length > 0 ? pushChallengesToSupabase(userId, challenges) : Promise.resolve(),
    pushProfileToSupabase(userId, profile),
  ]);
}
