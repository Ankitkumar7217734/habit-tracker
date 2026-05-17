import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { loadHabits, saveHabits, loadChallenges, saveChallenges, loadProfile, saveProfile } from './storage';
import { today, isHabitDoneToday, getStreak, getChallengeProgress, getChallengeInfo } from './utils';
import { XP_VALUES } from './constants';
import { playChime, initAudio } from './sound';
import { requestPermissions, scheduleDailyReminders } from './notifications';

const HabitContext = createContext(null);

export function HabitProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [profile, setProfile] = useState({ xp: 0 });
  const [rewardPopup, setRewardPopup] = useState(null);
  const rewardTimerRef = useRef(null);
  const challengesRef = useRef(challenges);
  useEffect(() => { challengesRef.current = challenges; }, [challenges]);

  useEffect(() => {
    loadHabits().then(setHabits);
    loadChallenges().then(setChallenges);
    loadProfile().then(setProfile);
    initAudio();
    requestPermissions();
  }, []);

  const showReward = useCallback((amount, reason) => {
    if (rewardTimerRef.current) clearTimeout(rewardTimerRef.current);
    rewardTimerRef.current = setTimeout(() => {
      setRewardPopup({ amount, reason });
      rewardTimerRef.current = setTimeout(() => setRewardPopup(null), 2500);
    }, 600);
  }, []);

  const addXp = useCallback((amount, reason) => {
    setProfile(prev => {
      const updated = { ...prev, xp: (prev.xp || 0) + amount };
      saveProfile(updated);
      return updated;
    });
    showReward(amount, reason);
  }, [showReward]);

  const checkChallengesAfterUpdate = useCallback((updatedHabits) => {
    const current = challengesRef.current;
    if (current.length === 0) return;
    let changed = false;
    const newChallenges = current.map(c => {
      if (c.status !== 'active') return c;
      const { current: prog, target } = getChallengeProgress(c, updatedHabits);
      if (target > 0 && prog >= target) {
        changed = true;
        const { title, xpReward } = getChallengeInfo(c);
        setTimeout(() => addXp(xpReward, `🏆 ${title} complete!`), 3500);
        return { ...c, status: 'completed', completedDate: today() };
      }
      return c;
    });
    if (changed) {
      setChallenges(newChallenges);
      saveChallenges(newChallenges);
    }
  }, [addXp]);

  const persistHabits = useCallback(async (updated) => {
    setHabits(updated);
    await saveHabits(updated);
    scheduleDailyReminders(updated);
    checkChallengesAfterUpdate(updated);
  }, [checkChallengesAfterUpdate]);

  const buildStreakXp = (newCompletions) => {
    const streak = getStreak(newCompletions);
    if (streak === 3) return { bonus: XP_VALUES.streakMilestone3, text: '🔥 3-day streak!' };
    if (streak === 7) return { bonus: XP_VALUES.streakMilestone7, text: '🔥 7-day streak!' };
    if (streak === 30) return { bonus: XP_VALUES.streakMilestone30, text: '🔥 30-day streak!' };
    return { bonus: 0, text: null };
  };

  // Binary habit: tap to toggle done/undone
  const toggleHabit = useCallback(async (id) => {
    const t = today();
    let xpEarned = 0;
    let milestoneText = null;
    let completing = false;

    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const isDone = (h.completions?.[t] || 0) >= h.targetCount;
      const newCompletions = { ...h.completions };
      if (isDone) {
        delete newCompletions[t];
      } else {
        completing = true;
        newCompletions[t] = h.targetCount;
        xpEarned += XP_VALUES.habitComplete;
        const { bonus, text } = buildStreakXp(newCompletions);
        xpEarned += bonus;
        milestoneText = text;
      }
      return { ...h, completions: newCompletions };
    });

    await Haptics.impactAsync(
      completing ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    if (completing && milestoneText) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await persistHabits(updated);

    if (xpEarned > 0) {
      const allDone = updated.every(h => isHabitDoneToday(h));
      if (allDone) xpEarned += XP_VALUES.allHabitsComplete;
      await playChime();
      addXp(xpEarned, milestoneText || (allDone ? '🎉 All habits done!' : '✓ Habit complete'));
    }
  }, [habits, persistHabits, addXp]);

  // Volume habit: increment count
  const incrementHabit = useCallback(async (id) => {
    const t = today();
    let xpEarned = 0;
    let milestoneText = null;

    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const prev = h.completions?.[t] || 0;
      const next = prev + 1;
      const wasComplete = prev >= h.targetCount;
      const isNowComplete = next >= h.targetCount;
      const newCompletions = { ...h.completions, [t]: next };
      if (isNowComplete && !wasComplete) {
        xpEarned += XP_VALUES.habitComplete;
        const { bonus, text } = buildStreakXp(newCompletions);
        xpEarned += bonus;
        milestoneText = text;
      }
      return { ...h, completions: newCompletions };
    });

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (milestoneText) await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await persistHabits(updated);

    if (xpEarned > 0) {
      const allDone = updated.every(h => isHabitDoneToday(h));
      if (allDone) xpEarned += XP_VALUES.allHabitsComplete;
      await playChime();
      addXp(xpEarned, milestoneText || (allDone ? '🎉 All habits done!' : '✓ Habit complete'));
    }
  }, [habits, persistHabits, addXp]);

  const decrementHabit = useCallback(async (id) => {
    const t = today();
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      const next = Math.max(0, (h.completions?.[t] || 0) - 1);
      const newCompletions = { ...h.completions };
      if (next === 0) delete newCompletions[t];
      else newCompletions[t] = next;
      return { ...h, completions: newCompletions };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await persistHabits(updated);
  }, [habits, persistHabits]);

  const addHabit = useCallback(async (data) => {
    const habit = { id: Date.now().toString(), completions: {}, createdAt: today(), ...data };
    await persistHabits([...habits, habit]);
  }, [habits, persistHabits]);

  const deleteHabit = useCallback(async (id) => {
    await persistHabits(habits.filter(h => h.id !== id));
  }, [habits, persistHabits]);

  const updateHabitReminder = useCallback(async (id, hour, minute) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      return { ...h, reminderHour: hour, reminderMinute: minute };
    });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await persistHabits(updated);
  }, [habits, persistHabits]);

  const clearHabitReminder = useCallback(async (id) => {
    const updated = habits.map(h => {
      if (h.id !== id) return h;
      return { ...h, reminderHour: null, reminderMinute: null };
    });
    await persistHabits(updated);
  }, [habits, persistHabits]);

  const startChallenge = useCallback(async (templateId, habitId) => {
    const challenge = {
      id: Date.now().toString(),
      templateId,
      habitId: habitId || null,
      startDate: today(),
      status: 'active',
      completedDate: null,
    };
    const updated = [...challengesRef.current, challenge];
    setChallenges(updated);
    await saveChallenges(updated);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const startCustomChallenge = useCallback(async (data) => {
    const challenge = {
      id: Date.now().toString(),
      isCustom: true,
      startDate: today(),
      status: 'active',
      completedDate: null,
      ...data,
    };
    const updated = [...challengesRef.current, challenge];
    setChallenges(updated);
    await saveChallenges(updated);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const abandonChallenge = useCallback(async (id) => {
    const updated = challengesRef.current.filter(c => c.id !== id);
    setChallenges(updated);
    await saveChallenges(updated);
  }, []);

  // Dev: simulate N days of completions to test streak rewards
  const simulateStreak = useCallback(async (habitId, numDays) => {
    const updated = habits.map(h => {
      if (h.id !== habitId) return h;
      const newCompletions = { ...h.completions };
      for (let i = 0; i < numDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        newCompletions[d.toISOString().split('T')[0]] = h.targetCount;
      }
      return { ...h, completions: newCompletions };
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await persistHabits(updated);

    const habit = updated.find(h => h.id === habitId);
    if (habit) {
      const streak = getStreak(habit.completions);
      let xpEarned = numDays * XP_VALUES.habitComplete;
      let text = `✓ ${numDays} days simulated`;
      if (streak >= 30) { xpEarned += XP_VALUES.streakMilestone30; text = '🔥 30-day streak!'; }
      else if (streak >= 7) { xpEarned += XP_VALUES.streakMilestone7; text = '🔥 7-day streak!'; }
      else if (streak >= 3) { xpEarned += XP_VALUES.streakMilestone3; text = '🔥 3-day streak!'; }
      await playChime();
      addXp(xpEarned, text);
    }
  }, [habits, persistHabits, addXp]);

  // Dev: reset a habit's completions
  const resetHabit = useCallback(async (habitId) => {
    const updated = habits.map(h =>
      h.id === habitId ? { ...h, completions: {} } : h
    );
    await persistHabits(updated);
  }, [habits, persistHabits]);

  // Dev: wipe all data
  const clearAllData = useCallback(async () => {
    await persistHabits([]);
    setChallenges([]);
    saveChallenges([]);
    setProfile({ xp: 0 });
    saveProfile({ xp: 0 });
  }, [persistHabits]);

  return (
    <HabitContext.Provider value={{
      habits, challenges, profile, rewardPopup,
      toggleHabit, incrementHabit, decrementHabit,
      addHabit, deleteHabit, updateHabitReminder, clearHabitReminder,
      startChallenge, startCustomChallenge, abandonChallenge,
      simulateStreak, resetHabit, clearAllData,
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  return useContext(HabitContext);
}
