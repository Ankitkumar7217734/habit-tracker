import { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Platform, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useHabits } from '../HabitContext';
import { COLORS } from '../constants';
import { formatReminderTime } from '../utils';

function TimePicker({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <View style={tp.row}>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => onHourChange((hour + 23) % 24)}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={tp.value}>{String(hour).padStart(2, '0')}</Text>
        <TouchableOpacity onPress={() => onHourChange((hour + 1) % 24)}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <Text style={tp.sep}>:</Text>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => onMinuteChange((minute + 45) % 60)}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={tp.value}>{String(minute).padStart(2, '0')}</Text>
        <TouchableOpacity onPress={() => onMinuteChange((minute + 15) % 60)}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <Text style={tp.ampm}>{hour < 12 ? 'AM' : 'PM'}</Text>
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 12 },
  unit: { alignItems: 'center', gap: 4 },
  arrow: { color: COLORS.accentLight, fontSize: 18, paddingHorizontal: 12 },
  value: { color: COLORS.text, fontSize: 36, fontWeight: '700', minWidth: 60, textAlign: 'center' },
  sep: { color: COLORS.text, fontSize: 36, fontWeight: '700', marginBottom: 4 },
  ampm: { color: COLORS.subtext, fontSize: 16, fontWeight: '600', marginLeft: 4 },
});

export default function HabitOptionsSheet({ habit, visible, onClose }) {
  const { updateHabitReminder, clearHabitReminder, deleteHabit } = useHabits();
  const hasReminder = habit?.reminderHour != null;
  const [hour, setHour] = useState(habit?.reminderHour ?? 9);
  const [minute, setMinute] = useState(habit?.reminderMinute ?? 0);
  const [showPicker, setShowPicker] = useState(false);

  if (!habit) return null;

  const handleSaveReminder = async () => {
    await updateHabitReminder(habit.id, hour, minute);
    setShowPicker(false);
    onClose();
  };

  const handleClearReminder = async () => {
    await clearHabitReminder(habit.id);
    setShowPicker(false);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete Habit', `Remove "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => { deleteHabit(habit.id); onClose(); },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Habit header */}
          <View style={styles.habitHeader}>
            <Text style={styles.habitIcon}>{habit.icon}</Text>
            <Text style={styles.habitName}>{habit.name}</Text>
          </View>

          {/* Reminder section */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Daily Reminder</Text>
                <Text style={styles.sectionSub}>
                  {hasReminder
                    ? `Set for ${formatReminderTime(habit.reminderHour, habit.reminderMinute)}`
                    : 'No reminder set'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setShowPicker(p => !p)}
              >
                <Text style={styles.editBtnText}>{showPicker ? 'Cancel' : hasReminder ? 'Edit' : 'Set'}</Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <>
                <TimePicker
                  hour={hour} minute={minute}
                  onHourChange={setHour} onMinuteChange={setMinute}
                />
                <View style={styles.pickerBtns}>
                  {hasReminder && (
                    <TouchableOpacity style={styles.clearBtn} onPress={handleClearReminder}>
                      <Text style={styles.clearBtnText}>Remove Reminder</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.saveBtn, !hasReminder && { flex: 1 }]} onPress={handleSaveReminder}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Delete */}
          <TouchableOpacity style={styles.deleteRow} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete Habit</Text>
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelRow} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  habitHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  habitIcon: { fontSize: 28 },
  habitName: { color: COLORS.text, fontSize: 17, fontWeight: '700', flex: 1 },
  section: {
    backgroundColor: COLORS.inputBg, borderRadius: 16,
    padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  sectionSub: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  editBtn: {
    backgroundColor: COLORS.accent + '33', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1, borderColor: COLORS.accent + '66',
  },
  editBtnText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '600' },
  pickerBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  clearBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: COLORS.danger + '22', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger + '44',
  },
  clearBtnText: { color: COLORS.danger, fontWeight: '600', fontSize: 13 },
  saveBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  deleteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, backgroundColor: COLORS.danger + '11', borderRadius: 14,
    marginBottom: 10, borderWidth: 1, borderColor: COLORS.danger + '33',
  },
  deleteText: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },
  cancelRow: {
    paddingVertical: 14, alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 14,
  },
  cancelText: { color: COLORS.subtext, fontWeight: '600', fontSize: 15 },
});
