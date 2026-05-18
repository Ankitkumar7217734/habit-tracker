import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../HabitContext';
import { COLORS } from '../constants';
import { getLast30Days, getLast7Days, getStreak } from '../utils';
import AccountButton from '../components/AccountButton';

const DAYS = getLast30Days();
const WEEK = getLast7Days();

function DotGrid({ completions, targetCount }) {
  return (
    <View style={styles.dotGrid}>
      {DAYS.map(day => {
        const count = completions?.[day] || 0;
        const done = count >= targetCount;
        const partial = count > 0 && !done;
        return (
          <View
            key={day}
            style={[styles.dot, done && styles.dotDone, partial && styles.dotPartial]}
          />
        );
      })}
    </View>
  );
}

export default function HistoryScreen() {
  const { habits } = useHabits();

  if (habits.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.headingRow}>
            <Text style={styles.heading}>History</Text>
            <AccountButton />
          </View>
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No habits tracked yet</Text>
            <Text style={styles.emptySubtext}>Add habits in the Today tab to see history here</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderHabit = ({ item }) => {
    const streak = getStreak(item.completions);
    const totalDone = Object.values(item.completions || {}).filter(v => v >= item.targetCount).length;
    const weekDone = WEEK.filter(d => (item.completions?.[d] || 0) >= item.targetCount).length;

    return (
      <View style={styles.card}>
        {/* Habit name row */}
        <View style={styles.cardHeader}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        </View>

        {/* Three stat cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.success} />
            <Text style={styles.statNum}>{totalDone}</Text>
            <Text style={styles.statDesc}>Days Done</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={20} color="#E8640E" />
            <Text style={styles.statNum}>{streak}</Text>
            <Text style={styles.statDesc}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.accent} />
            <Text style={styles.statNum}>{weekDone}/7</Text>
            <Text style={styles.statDesc}>This Week</Text>
          </View>
        </View>

        {/* Timeline label */}
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>30 days ago</Text>
          <Text style={styles.rangeText}>Today</Text>
        </View>

        <DotGrid completions={item.completions} targetCount={item.targetCount} />

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, styles.dotDone]} />
            <Text style={styles.legendText}>Done</Text>
          </View>
          {item.type === 'volume' && (
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.dotPartial]} />
              <Text style={styles.legendText}>Partial</Text>
            </View>
          )}
          <View style={styles.legendItem}>
            <View style={styles.dot} />
            <Text style={styles.legendText}>Missed</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>History</Text>
          <AccountButton />
        </View>
        <FlatList
          data={habits}
          keyExtractor={h => h.id}
          renderItem={renderHabit}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const DOT = 9;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 20 },
  headingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 20, paddingBottom: 16,
  },
  heading: { color: COLORS.text, fontSize: 26, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.card, borderRadius: 20, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  icon: { fontSize: 24 },
  name: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8,
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, gap: 3,
  },
  statNum: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  statDesc: { color: COLORS.subtext, fontSize: 11, textAlign: 'center' },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rangeText: { color: COLORS.subtext, fontSize: 10 },
  dotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: COLORS.inputBg },
  dotDone: { backgroundColor: COLORS.success },
  dotPartial: { backgroundColor: COLORS.accent + '88' },
  legendRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { color: COLORS.subtext, fontSize: 11 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { color: COLORS.text, fontSize: 20, fontWeight: '600', textAlign: 'center' },
  emptySubtext: { color: COLORS.subtext, fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
