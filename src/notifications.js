import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPermissions() {
  if (Platform.OS === 'web') return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7C3AED',
      });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (_) {
    return false;
  }
}

export async function scheduleDailyReminders(habits) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (habits.length === 0) return;

    const habitsWithReminder = habits.filter(
      h => h.reminderHour != null && h.reminderMinute != null
    );
    const habitsWithout = habits.filter(
      h => h.reminderHour == null || h.reminderMinute == null
    );

    // Per-habit reminders
    for (const h of habitsWithReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Time for your habit! ${h.icon}`,
          body: h.name,
        },
        trigger: { hour: h.reminderHour, minute: h.reminderMinute, repeats: true },
      });
    }

    // Single evening fallback for habits without a specific reminder
    if (habitsWithout.length > 0) {
      const icons = habitsWithout.slice(0, 4).map(h => h.icon).join(' ');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't break your streak! 🔥",
          body: `Check in: ${icons}`,
        },
        trigger: { hour: 20, minute: 0, repeats: true },
      });
    }
  } catch (_) {}
}
