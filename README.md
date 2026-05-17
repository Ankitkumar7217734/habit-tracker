# Habit Tracker

A gamified daily habit tracking app built with React Native and Expo. Build streaks, earn XP, level up, and complete challenges to stay consistent.

## Features

- **Daily check-ins** — Binary toggle or volume counter habits
- **Streak tracking** — Consecutive day streaks with milestone rewards
- **XP & levels** — Earn XP for completions, streaks, and challenges
- **Challenges** — 7-day, 14-day, 30-day streak and Perfect Week challenges
- **History** — 30-day dot grid view per habit
- **Stats** — Per-habit 7-day bar charts and level progression
- **Reminders** — Per-habit push notification reminders
- **Haptic + audio feedback** — Chime and vibration on every interaction

## Tech Stack

- React Native 0.81 / React 19
- Expo SDK 54 (New Architecture enabled)
- React Navigation 6 (bottom tabs)
- AsyncStorage for persistence
- expo-audio, expo-haptics, expo-notifications

## Getting Started

**Prerequisites:** [Node.js](https://nodejs.org), [Expo Go](https://expo.dev/go) on your device or an iOS/Android emulator.

```bash
cd MyApp
npm install
npm start
```

Scan the QR code with Expo Go, or press `i` for iOS Simulator / `a` for Android Emulator.

## Project Structure

```
MyApp/
├── App.js                  # Root — tab navigator, onboarding
├── src/
│   ├── HabitContext.js     # Global state (habits, XP, challenges)
│   ├── constants.js        # Colors, XP values, challenge templates
│   ├── utils.js            # Streak calc, level formula, challenge progress
│   ├── storage.js          # AsyncStorage CRUD + v1→v2 migration
│   ├── notifications.js    # Local push notification scheduling
│   ├── sound.js            # Chime playback via expo-audio
│   ├── screens/            # Today, History, Stats, Challenges
│   └── components/         # AddHabitModal, RewardToast, OnboardingModal, etc.
└── assets/                 # Icons, splash, chime.wav
```

## XP System

| Action | XP |
|---|---|
| Complete a habit | +10 |
| All habits done for the day | +50 |
| 3-day streak | +100 |
| 7-day streak | +250 |
| 30-day streak | +1,000 |
| Challenge completion | +300–1,500 |

Level formula: `floor(sqrt(xp / 100)) + 1`
