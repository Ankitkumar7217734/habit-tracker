import { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../HabitContext';
import { COLORS } from '../constants';
import { getLast7Days, getStreak, xpToLevel, xpForLevel, shortDay, today } from '../utils';
import DevPanel from '../components/DevPanel';
import AccountButton from '../components/AccountButton';

function MiniBar({ frac, isToday }) {
  const h = Math.max(4, Math.round(60 * frac));
  const color = frac >= 1 ? COLORS.success : frac > 0 ? COLORS.accent : COLORS.border;
  return (
    <View style={barS.col}>
      <View style={[barS.bar, { height: h, backgroundColor: color, opacity: isToday ? 1 : 0.8 }]} />
    </View>
  );
}
const barS = StyleSheet.create({
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 60 },
  bar: { width: '65%', borderRadius: 4 },
});

function HabitChart({ habit, last7 }) {
  const t = today();
  const doneDays = last7.filter(d => (habit.completions?.[d] || 0) >= habit.targetCount).length;
  const streak = getStreak(habit.completions);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartIcon}>{habit.icon}</Text>
        <Text style={styles.chartName} numberOfLines={1}>{habit.name}</Text>
        <View style={styles.chartBadge}>
          <Text style={styles.chartBadgeText}>
            {doneDays}/7
          </Text>
        </View>
      </View>
      <View style={styles.barsRow}>
        {last7.map(day => {
          const frac = Math.min(1, (habit.completions?.[day] || 0) / habit.targetCount);
          return <MiniBar key={day} frac={frac} isToday={day === t} />;
        })}
      </View>
      <View style={styles.labelsRow}>
        {last7.map(day => (
          <Text
            key={day}
            style={[styles.dayLabel, day === t && styles.dayLabelToday]}
          >
            {shortDay(day)}
          </Text>
        ))}
      </View>
      {streak > 0 && (
        <Text style={styles.streakTag}>🔥 {streak}-day streak</Text>
      )}
    </View>
  );
}

export default function StatsScreen() {
  const { habits, profile } = useHabits();
  const [devVisible, setDevVisible] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const xp = profile?.xp ?? 0;
  const level = xpToLevel(xp);
  const xpThisLevel = xp - xpForLevel(level);
  const xpNeeded = xpForLevel(level + 1) - xpForLevel(level);
  const levelPct = Math.min(1, xpThisLevel / Math.max(1, xpNeeded));

  const bestStreak = habits.reduce((mx, h) => Math.max(mx, getStreak(h.completions)), 0);
  const t = today();
  const completedToday = habits.filter(h => (h.completions?.[t] || 0) >= h.targetCount).length;
  const todayPct = habits.length > 0 ? Math.round(completedToday / habits.length * 100) : 0;

  const last7 = getLast7Days();

  const handleHeadingTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1200);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setDevVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <TouchableOpacity onPress={handleHeadingTap} activeOpacity={1}>
            <Text style={styles.heading}>Stats</Text>
          </TouchableOpacity>
          <View style={styles.headingActions}>
            <TouchableOpacity onPress={() => setDevVisible(true)} style={styles.devBtn}>
              <Ionicons name="construct-outline" size={16} color={COLORS.text} />
            </TouchableOpacity>
            <AccountButton />
          </View>
        </View>

        {/* Summary card */}
        <View style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.gold }]}>Lv {level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.accentLight }]}>{bestStreak}d</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>{todayPct}%</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
          <Text style={styles.levelLabel}>Lv {level} → Lv {level + 1}</Text>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${Math.round(levelPct * 100)}%` }]} />
          </View>
          <Text style={styles.xpDetail}>{xpThisLevel} / {xpNeeded} XP to next level</Text>
        </View>

        {/* Per-habit charts */}
        {habits.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Add habits to see stats</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Last 7 Days — per habit</Text>
            {habits.map(h => (
              <HabitChart key={h.id} habit={h} last7={last7} />
            ))}
          </>
        )}
      </ScrollView>

      <DevPanel visible={devVisible} onClose={() => setDevVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 16 },
  heading: { color: COLORS.text, fontSize: 26, fontWeight: '700' },
  headingActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  devBtn: {
    backgroundColor: COLORS.inputBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 20,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.border,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  statLabel: { color: COLORS.subtext, fontSize: 11, marginTop: 2 },
  levelLabel: { color: COLORS.subtext, fontSize: 12, marginBottom: 6 },
  xpBarBg: { height: 8, backgroundColor: COLORS.inputBg, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  xpBarFill: { height: 8, backgroundColor: COLORS.gold, borderRadius: 4 },
  xpDetail: { color: COLORS.subtext, fontSize: 11, textAlign: 'right' },
  sectionLabel: {
    color: COLORS.subtext, fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  chartIcon: { fontSize: 20 },
  chartName: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '600' },
  chartBadge: {
    backgroundColor: COLORS.inputBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  chartBadgeText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  barsRow: { flexDirection: 'row', height: 60, alignItems: 'flex-end', gap: 4, marginBottom: 6 },
  labelsRow: { flexDirection: 'row' },
  dayLabel: { flex: 1, textAlign: 'center', color: COLORS.subtext, fontSize: 10 },
  dayLabelToday: { color: COLORS.accentLight, fontWeight: '700' },
  streakTag: { color: COLORS.accentLight, fontSize: 12, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.subtext, fontSize: 16 },
});
