import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

function migrateHabit(h) {
  if (h.completions && h.type) return h;
  const completions = {};
  (h.completedDates || []).forEach(d => { completions[d] = 1; });
  return {
    id: h.id,
    name: h.name,
    icon: h.icon || '⭐',
    type: h.type || 'binary',
    targetCount: h.targetCount || 1,
    completions: h.completions || completions,
    createdAt: h.createdAt,
  };
}

export async function loadHabits() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.habits);
    if (raw) return JSON.parse(raw).map(migrateHabit);

    // Migrate from old storage key
    const legacy = await AsyncStorage.getItem('@habits');
    if (legacy) {
      const migrated = JSON.parse(legacy).map(migrateHabit);
      await saveHabits(migrated);
      return migrated;
    }
  } catch (_) {}
  return [];
}

export async function saveHabits(habits) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  } catch (_) {}
}

export async function loadChallenges() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.challenges);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function saveChallenges(challenges) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.challenges, JSON.stringify(challenges));
  } catch (_) {}
}

export async function loadProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
    return raw ? JSON.parse(raw) : { xp: 0 };
  } catch (_) {
    return { xp: 0 };
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  } catch (_) {}
}
