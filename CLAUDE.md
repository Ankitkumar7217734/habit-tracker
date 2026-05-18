# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important

Before writing any code, read the exact versioned Expo docs at https://docs.expo.dev/versions/v54.0.0/ — the API has changed across versions and the wrong version's docs will produce broken code.

## Commands

```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run android    # Open on Android emulator/device
npm run ios        # Open on iOS simulator/device
npm run web        # Open in browser
```

No build, lint, or test scripts are configured.

## Architecture

React Native app with Expo SDK 54, React 19, and React Navigation 7 bottom tabs. New architecture (`newArchEnabled: true`) is enabled.

### Auth gate

`App.js` wraps everything in `<AuthProvider>`. `AppContent` reads `session` from `useAuth()`. If no session, renders `AuthScreen` (email/password sign-in and sign-up). If session exists, renders the tab navigator inside `<HabitProvider>`. Supabase client lives in `src/lib/supabase.js`.

### Screen map
| Screen | File | Role |
|---|---|---|
| Auth | `src/screens/AuthScreen.js` | Sign in / sign up (shown when not logged in) |
| Today | `src/screens/TodayScreen.js` | Daily habit check-in, binary toggle + volume +/− |
| History | `src/screens/HistoryScreen.js` | 30-day dot grid per habit |
| Stats | `src/screens/StatsScreen.js` | XP/level + per-habit 7-day bar charts |
| Challenges | `src/screens/ChallengesScreen.js` | Start/track streak and all-habits challenges |

`src/components/AddHabitModal.js` is a bottom-sheet modal (not a tab). `HabitOptionsSheet.js` is a per-habit action sheet (edit/delete). `DevPanel.js` is a hidden debug panel.

### State management

Global state lives in `src/HabitContext.js` (React Context). All screens read from `useHabits()`. Mutations: `toggleHabit`, `incrementHabit`, `decrementHabit`, `addHabit`, `deleteHabit`, `startChallenge`, `abandonChallenge`.

### Persistence — local + cloud

`src/storage.js` handles AsyncStorage (local cache). `src/lib/sync.js` syncs to Supabase. On login, `HabitContext` calls `pullFromSupabase`; if the cloud has data it becomes the source of truth and overwrites local. Every write calls the matching `push*ToSupabase` function. All Supabase tables use Row Level Security — users can only access their own rows.

AsyncStorage keys (defined in `src/constants.js`):
- `@habits_v2` — habit array (migrates from old `@habits` automatically)
- `@challenges_v1` — active/completed challenge array
- `@user_profile_v1` — `{ xp: number }`

Supabase tables: `habits`, `challenges`, `profiles` (see `supabase-schema.sql`).

### Habit data shape
```js
{
  id: string,              // Date.now().toString()
  name: string,
  icon: string,            // emoji
  type: 'binary' | 'volume',
  targetCount: number,     // 1 for binary; N for volume
  completions: {           // date → count map
    'YYYY-MM-DD': number,
  },
  createdAt: string,       // ISO date string
  reminder_hour: number | null,
  reminder_minute: number | null,
}
```

### Core loop & feedback
- **Haptics**: `expo-haptics` on every interaction (medium impact on complete, light on undo/decrement, success notification on streak milestones)
- **Sound**: `expo-audio` plays `assets/chime.wav` on habit completion via `src/sound.js`
- **XP reward toast**: `src/components/RewardToast.js` — appears 600 ms after action, auto-dismisses after 2.5 s, rendered above the tab bar via `position: absolute`

### XP & levels

Earned in `HabitContext`: +10 per habit completion, +50 when all habits done for the day, +100/250/1000 for 3/7/30-day streak milestones, challenge reward XP on completion. `xpToLevel(xp)` = `floor(sqrt(xp/100)) + 1`.

### Push notifications

`src/notifications.js` — schedules 3 daily local notifications (8 AM, 12 PM, 8 PM) via `expo-notifications`. Permissions requested on first app load. Android requires a notification channel (handled automatically in `requestPermissions`). Test on a physical device; iOS Simulator does not deliver local notifications.

### Challenge data shape
```js
{
  id: string,
  templateId: string,        // key into CHALLENGE_TEMPLATES in constants.js
  habitId: string | null,    // null for 'all_habits' type
  startDate: string,         // YYYY-MM-DD
  status: 'active' | 'completed' | 'failed',
  completedDate: string | null,
}
```
Progress is recalculated dynamically in `getChallengeProgress` (utils.js). Completion is checked in `persistHabits` after every habit write.
