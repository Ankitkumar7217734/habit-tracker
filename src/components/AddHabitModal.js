import { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, Switch,
} from 'react-native';
import { COLORS, PRESET_HABITS } from '../constants';
import { useHabits } from '../HabitContext';
import { formatReminderTime } from '../utils';
import { Ionicons } from '@expo/vector-icons';

function TimePicker({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <View style={tp.row}>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => onHourChange((hour + 23) % 24)}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={tp.val}>{String(hour).padStart(2, '0')}</Text>
        <TouchableOpacity onPress={() => onHourChange((hour + 1) % 24)}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <Text style={tp.sep}>:</Text>
      <View style={tp.unit}>
        <TouchableOpacity onPress={() => onMinuteChange((minute + 45) % 60)}>
          <Text style={tp.arrow}>▲</Text>
        </TouchableOpacity>
        <Text style={tp.val}>{String(minute).padStart(2, '0')}</Text>
        <TouchableOpacity onPress={() => onMinuteChange((minute + 15) % 60)}>
          <Text style={tp.arrow}>▼</Text>
        </TouchableOpacity>
      </View>
      <Text style={tp.ampm}>{hour < 12 ? 'AM' : 'PM'}</Text>
    </View>
  );
}

const tp = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  unit: { alignItems: 'center', gap: 2 },
  arrow: { color: COLORS.accentLight, fontSize: 16, paddingHorizontal: 10 },
  val: { color: COLORS.text, fontSize: 30, fontWeight: '700', minWidth: 52, textAlign: 'center' },
  sep: { color: COLORS.text, fontSize: 30, fontWeight: '700', marginBottom: 4 },
  ampm: { color: COLORS.subtext, fontSize: 14, fontWeight: '600', marginLeft: 4 },
});

export default function AddHabitModal({ visible, onClose }) {
  const { addHabit } = useHabits();
  const [type, setType] = useState('binary');
  const [icon, setIcon] = useState('⭐');
  const [name, setName] = useState('');
  const [targetCount, setTargetCount] = useState(3);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);

  const reset = () => {
    setType('binary'); setIcon('⭐'); setName('');
    setTargetCount(3); setReminderOn(false);
    setReminderHour(9); setReminderMinute(0);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleAdd = () => {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      icon,
      type,
      targetCount: type === 'binary' ? 1 : targetCount,
      reminderHour: reminderOn ? reminderHour : null,
      reminderMinute: reminderOn ? reminderMinute : null,
    });
    handleClose();
  };

  const handlePreset = (p) => {
    addHabit({
      name: p.name,
      icon: p.icon,
      type: p.type,
      targetCount: p.targetCount,
      reminderHour: null,
      reminderMinute: null,
    });
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add a Habit</Text>

          {/* Type toggle */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'binary' && styles.typeBtnActive]}
              onPress={() => setType('binary')}
            >
              <Text style={[styles.typeBtnText, type === 'binary' && styles.typeBtnTextActive]}>
                ✓ Once a day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'volume' && styles.typeBtnActive]}
              onPress={() => setType('volume')}
            >
              <Text style={[styles.typeBtnText, type === 'volume' && styles.typeBtnTextActive]}>
                🔢 Volume
              </Text>
            </TouchableOpacity>
          </View>

          {/* Icon + Name */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.iconInput}
              value={icon}
              onChangeText={setIcon}
              maxLength={2}
              placeholder="⭐"
              placeholderTextColor={COLORS.subtext}
            />
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Habit name…"
              placeholderTextColor={COLORS.subtext}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              autoFocus
            />
          </View>

          {/* Volume target */}
          {type === 'volume' && (
            <View style={styles.stepperRow}>
              <Text style={styles.stepperLabel}>Target per day</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetCount(c => Math.max(2, c - 1))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepValue}>{targetCount}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTargetCount(c => Math.min(50, c + 1))}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reminder */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.text} />
                <Text style={styles.reminderLabel}>Daily Reminder</Text>
              </View>
              <Switch
                value={reminderOn}
                onValueChange={setReminderOn}
                trackColor={{ false: COLORS.border, true: COLORS.accent }}
                thumbColor={reminderOn ? COLORS.accentLight : COLORS.subtext}
              />
            </View>
            {reminderOn && (
              <>
                <View style={styles.reminderDivider} />
                <TimePicker
                  hour={reminderHour}
                  minute={reminderMinute}
                  onHourChange={setReminderHour}
                  onMinuteChange={setReminderMinute}
                />
                <View style={styles.reminderConfirm}>
                  <Text style={styles.reminderConfirmText}>
                    ✓ Reminder set for {formatReminderTime(reminderHour, reminderMinute)} daily
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Quick presets */}
          <Text style={styles.sectionLabel}>Quick add</Text>
          {PRESET_HABITS.map(p => (
            <TouchableOpacity key={p.name} style={styles.preset} onPress={() => handlePreset(p)}>
              <Text style={styles.presetIcon}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.presetName}>{p.name}</Text>
                <Text style={styles.presetMeta}>
                  {p.type === 'volume' ? `${p.targetCount}× per day` : 'Once a day'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addText}>Add Habit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheetScroll: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: COLORS.border,
    maxHeight: '92%',
  },
  sheetContent: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.accent + '33', borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  typeBtnTextActive: { color: COLORS.accentLight, fontWeight: '700' },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  iconInput: {
    width: 52, backgroundColor: COLORS.inputBg, borderRadius: 12, color: COLORS.text,
    fontSize: 22, textAlign: 'center', paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  nameInput: {
    flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 12, color: COLORS.text,
    fontSize: 15, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  stepperRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14, backgroundColor: COLORS.inputBg, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  stepperLabel: { color: COLORS.text, fontSize: 14 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  stepBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBtnText: { color: '#fff', fontSize: 20, lineHeight: 24 },
  stepValue: { color: COLORS.text, fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  reminderCard: {
    backgroundColor: COLORS.inputBg, borderRadius: 14, padding: 14,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  reminderDivider: { height: 1, backgroundColor: COLORS.border, marginTop: 12 },
  reminderConfirm: {
    backgroundColor: COLORS.accent + '18', borderRadius: 10, paddingVertical: 10,
    paddingHorizontal: 14, marginTop: 4, borderWidth: 1, borderColor: COLORS.accent + '40',
    alignItems: 'center',
  },
  reminderConfirmText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  sectionLabel: {
    color: COLORS.subtext, fontSize: 11, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 8,
  },
  preset: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    backgroundColor: COLORS.inputBg, borderRadius: 12, marginBottom: 6,
    borderWidth: 1, borderColor: COLORS.border,
  },
  presetIcon: { fontSize: 22, marginRight: 12 },
  presetName: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
  presetMeta: { color: COLORS.subtext, fontSize: 11, marginTop: 2 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.inputBg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.text, fontWeight: '600' },
  addBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700' },
});
