import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../HabitContext';
import { COLORS } from '../constants';
import { getStreak, isHabitDoneToday, getTodayCount, getTimeOfDay, formatReminderTime } from '../utils';
import AddHabitModal from '../components/AddHabitModal';
import HabitOptionsSheet from '../components/HabitOptionsSheet';

export default function TodayScreen() {
  const { habits, toggleHabit, incrementHabit, decrementHabit, profile } = useHabits();
  const [addVisible, setAddVisible] = useState(false);
  const [optionsHabit, setOptionsHabit] = useState(null);

  const completedToday = habits.filter(isHabitDoneToday).length;
  const progress = habits.length > 0 ? completedToday / habits.length : 0;
  const pct = Math.round(progress * 100);

  const renderHabit = ({ item }) => {
    const done = isHabitDoneToday(item);
    const streak = getStreak(item.completions);
    const count = getTodayCount(item);
    const hasReminder = item.reminderHour != null;

    if (item.type === 'volume') {
      return (
        <View style={[styles.card, done && styles.cardDone]}>
          <View style={styles.volRow}>
            <Text style={styles.habitIcon}>{item.icon}</Text>
            <Text style={[styles.habitName, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.volControls}>
              <TouchableOpacity style={styles.volBtn} onPress={() => decrementHabit(item.id)}>
                <Text style={styles.volBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.volCount, done && { color: COLORS.success }]}>
                {count}/{item.targetCount}
              </Text>
              <TouchableOpacity
                style={[styles.volBtn, done && styles.volBtnDone]}
                onPress={() => incrementHabit(item.id)}
              >
                <Text style={styles.volBtnText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setOptionsHabit(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.subtext} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.card, done && styles.cardDone]}
        onPress={() => toggleHabit(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardMain}>
          <View style={[styles.check, done && styles.checkDone]}>
            {done && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <View style={styles.cardLeft}>
            <Text style={styles.habitIcon}>{item.icon}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.habitName, done && styles.habitNameDone]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.metaRow}>
                {streak > 0 && <Text style={styles.streak}>🔥 {streak}d</Text>}
                {hasReminder && (
                  <Text style={styles.reminderBadge}>
                    🔔 {formatReminderTime(item.reminderHour, item.reminderMinute)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.optionsBtn}
          onPress={() => setOptionsHabit(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={COLORS.subtext} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.title}>Today's Habits</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddVisible(true)}>
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress card */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressLabel}>Today's Progress</Text>
              <Text style={styles.progressCount}>{completedToday} / {habits.length} habits</Text>
              {pct === 100 && habits.length > 0 && (
                <Text style={styles.allDone}>🎉 All done today!</Text>
              )}
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpValue}>{profile?.xp ?? 0}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${pct}%`, backgroundColor: pct === 100 ? COLORS.success : COLORS.accent },
              ]}
            />
          </View>
        </View>

        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first habit</Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={item => item.id}
            renderItem={renderHabit}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AddHabitModal visible={addVisible} onClose={() => setAddVisible(false)} />
      <HabitOptionsSheet
        habit={optionsHabit}
        visible={!!optionsHabit}
        onClose={() => setOptionsHabit(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 20, paddingBottom: 16,
  },
  greeting: { color: COLORS.subtext, fontSize: 14 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '700' },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  progressCard: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  progressLabel: { color: COLORS.subtext, fontSize: 13, marginBottom: 4 },
  progressCount: { color: COLORS.text, fontSize: 22, fontWeight: '700' },
  allDone: { color: COLORS.success, fontSize: 13, marginTop: 4 },
  xpBadge: {
    backgroundColor: COLORS.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  xpValue: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  xpLabel: { color: COLORS.subtext, fontSize: 10, fontWeight: '600' },
  barBg: { height: 6, backgroundColor: COLORS.inputBg, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  cardDone: { borderColor: COLORS.success + '55', opacity: 0.88 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: COLORS.subtext,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
    backgroundColor: 'transparent', overflow: 'hidden',
  },
  checkDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkMark: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', lineHeight: 20 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  habitIcon: { fontSize: 24, marginRight: 10 },
  habitName: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  habitNameDone: { color: COLORS.subtext, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  streak: { color: COLORS.accentLight, fontSize: 12 },
  reminderBadge: { color: COLORS.subtext, fontSize: 11 },
  optionsBtn: { position: 'absolute', top: 0, right: 0, padding: 4 },
  volRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  volControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  volBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  volBtnDone: { backgroundColor: COLORS.success },
  volBtnText: { color: '#fff', fontSize: 18, lineHeight: 22 },
  volCount: { color: COLORS.text, fontSize: 14, fontWeight: '700', minWidth: 34, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { color: COLORS.text, fontSize: 20, fontWeight: '600' },
  emptySubtext: { color: COLORS.subtext, fontSize: 14, marginTop: 6 },
});
