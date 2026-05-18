import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Platform,
} from 'react-native';
import { useHabits } from '../HabitContext';
import { useAuth } from '../AuthContext';
import { COLORS } from '../constants';
import { getStreak } from '../utils';

export default function DevPanel({ visible, onClose }) {
  const { habits, simulateStreak, resetHabit, clearAllData } = useHabits();
  const { signOut, session } = useAuth();
  const [selected, setSelected] = useState(null);

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again to access your habits.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); onClose(); } },
    ]);
  };

  const handleSimulate = async (days) => {
    if (!selected) {
      Alert.alert('Pick a habit first', 'Tap a habit row to select it, then choose a simulation.');
      return;
    }
    await simulateStreak(selected, days);
  };

  const handleReset = (id) => {
    Alert.alert('Reset habit?', 'This clears all completions for this habit.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetHabit(id) },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear ALL data?', 'Habits, challenges, and XP will be wiped.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Wipe it', style: 'destructive', onPress: () => { clearAllData(); onClose(); } },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>🛠 Developer Panel</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Select a habit below, then simulate a streak to trigger XP rewards.
          </Text>

          {/* Habit list */}
          <Text style={styles.sectionLabel}>SELECT HABIT</Text>
          <ScrollView style={styles.habitList} showsVerticalScrollIndicator={false}>
            {habits.length === 0 ? (
              <Text style={styles.emptyText}>No habits yet — add some first.</Text>
            ) : (
              habits.map(h => {
                const isSelected = selected === h.id;
                const streak = getStreak(h.completions);
                return (
                  <TouchableOpacity
                    key={h.id}
                    style={[styles.habitRow, isSelected && styles.habitRowSelected]}
                    onPress={() => setSelected(isSelected ? null : h.id)}
                  >
                    <Text style={styles.habitIcon}>{h.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.habitName}>{h.name}</Text>
                      <Text style={styles.habitMeta}>
                        Current streak: {streak} day{streak !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleReset(h.id)}>
                      <Text style={styles.resetBtn}>Reset</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Simulate buttons */}
          <Text style={styles.sectionLabel}>SIMULATE STREAK</Text>
          <View style={styles.simRow}>
            {[3, 7, 14, 30].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.simBtn, !selected && styles.simBtnDisabled]}
                onPress={() => handleSimulate(d)}
              >
                <Text style={styles.simBtnText}>{d}d</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.simNote}>
            Adds completions for past N days and triggers streak rewards instantly.
          </Text>

          {/* Account */}
          {session?.user?.email && (
            <Text style={styles.accountText}>
              Signed in as {session.user.email}
            </Text>
          )}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Danger zone */}
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
            <Text style={styles.dangerText}>🗑 Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1, borderColor: COLORS.border,
    maxHeight: '85%',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  closeBtn: { color: COLORS.subtext, fontSize: 20, padding: 4 },
  hint: { color: COLORS.subtext, fontSize: 13, marginBottom: 16, lineHeight: 18 },
  sectionLabel: {
    color: COLORS.subtext, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  },
  habitList: { maxHeight: 200, marginBottom: 16 },
  habitRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.inputBg, borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  habitRowSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent + '22' },
  habitIcon: { fontSize: 22, marginRight: 10 },
  habitName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  habitMeta: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  resetBtn: { color: COLORS.danger, fontSize: 12, fontWeight: '600', padding: 4 },
  emptyText: { color: COLORS.subtext, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  simRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  simBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  simBtnDisabled: { backgroundColor: COLORS.inputBg },
  simBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  simNote: { color: COLORS.subtext, fontSize: 12, marginBottom: 16, lineHeight: 16 },
  dangerBtn: {
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: COLORS.danger + '22', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger + '44',
  },
  dangerText: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
  accountText: {
    color: COLORS.subtext, fontSize: 12, textAlign: 'center', marginBottom: 8,
  },
  signOutBtn: {
    paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.inputBg,
  },
  signOutText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
});
