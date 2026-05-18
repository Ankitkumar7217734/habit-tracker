import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  ScrollView, StyleSheet, Platform, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '../HabitContext';
import { COLORS, CHALLENGE_TEMPLATES } from '../constants';
import { getChallengeProgress, getChallengeInfo } from '../utils';
import AccountButton from '../components/AccountButton';

function ProgressBar({ current, target }) {
  const pct = target > 0 ? Math.min(1, current / target) : 0;
  return (
    <View style={pb.bg}>
      <View style={[pb.fill, { width: `${Math.round(pct * 100)}%` }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  bg: { height: 6, backgroundColor: COLORS.inputBg, borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  fill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
});

/* ──────────── Habit Picker Modal ──────────── */
function HabitPickerModal({ visible, habits, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={hp.overlay}>
        <View style={hp.sheet}>
          <Text style={hp.title}>Which habit is this for?</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
            {habits.map(h => (
              <TouchableOpacity key={h.id} style={hp.row} onPress={() => onSelect(h.id)}>
                <Text style={hp.icon}>{h.icon}</Text>
                <Text style={hp.name}>{h.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={hp.cancel} onPress={onClose}>
            <Text style={hp.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
const hp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: COLORS.inputBg, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  icon: { fontSize: 22, marginRight: 12 },
  name: { color: COLORS.text, fontSize: 15 },
  cancel: { marginTop: 8, padding: 14, alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 14 },
  cancelText: { color: COLORS.text, fontWeight: '600' },
});

/* ──────────── Create Custom Challenge Modal ──────────── */
const TARGET_PRESETS = [7, 14, 21, 30];

function CreateChallengeModal({ visible, habits, onClose, onCreateChallenge }) {
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [type, setType] = useState('streak');
  const [target, setTarget] = useState(7);
  const [customTarget, setCustomTarget] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [habitId, setHabitId] = useState(null);

  const reset = () => {
    setTitle(''); setIcon('🎯'); setType('streak');
    setTarget(7); setCustomTarget(''); setUseCustom(false);
    setHabitId(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const finalTarget = useCustom ? (parseInt(customTarget) || 7) : target;
  const xpReward = Math.round(finalTarget * 25);

  const handleCreate = () => {
    if (!title.trim()) { Alert.alert('Add a name', 'Give your challenge a name.'); return; }
    if (type === 'streak' && !habitId) { setPickerVisible(true); return; }
    onCreateChallenge({
      title: title.trim(),
      icon,
      type,
      target: finalTarget,
      xpReward,
      habitId: type === 'streak' ? habitId : null,
    });
    handleClose();
  };

  const selectedHabit = habits.find(h => h.id === habitId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={cc.overlay}>
        <ScrollView style={cc.sheet} contentContainerStyle={cc.content} keyboardShouldPersistTaps="handled">
          <Text style={cc.title}>Create Challenge</Text>

          {/* Icon + Name */}
          <View style={cc.nameRow}>
            <TextInput
              style={cc.iconInput}
              value={icon}
              onChangeText={setIcon}
              maxLength={2}
              placeholderTextColor={COLORS.subtext}
            />
            <TextInput
              style={cc.nameInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Challenge name…"
              placeholderTextColor={COLORS.subtext}
              autoFocus
            />
          </View>

          {/* Type */}
          <Text style={cc.label}>TYPE</Text>
          <View style={cc.typeRow}>
            <TouchableOpacity
              style={[cc.typeBtn, type === 'streak' && cc.typeBtnActive]}
              onPress={() => setType('streak')}
            >
              <Text style={[cc.typeBtnText, type === 'streak' && cc.typeBtnTextActive]}>🔥 Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cc.typeBtn, type === 'all_habits' && cc.typeBtnActive]}
              onPress={() => setType('all_habits')}
            >
              <Text style={[cc.typeBtnText, type === 'all_habits' && cc.typeBtnTextActive]}>⭐ All Habits</Text>
            </TouchableOpacity>
          </View>

          {/* Target days */}
          <Text style={cc.label}>TARGET DAYS</Text>
          <View style={cc.targetRow}>
            {TARGET_PRESETS.map(d => (
              <TouchableOpacity
                key={d}
                style={[cc.targetBtn, !useCustom && target === d && cc.targetBtnActive]}
                onPress={() => { setTarget(d); setUseCustom(false); }}
              >
                <Text style={[cc.targetBtnText, !useCustom && target === d && cc.targetBtnTextActive]}>
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[cc.targetBtn, useCustom && cc.targetBtnActive]}
              onPress={() => setUseCustom(true)}
            >
              <Text style={[cc.targetBtnText, useCustom && cc.targetBtnTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>
          {useCustom && (
            <TextInput
              style={cc.customInput}
              value={customTarget}
              onChangeText={setCustomTarget}
              placeholder="e.g. 45"
              placeholderTextColor={COLORS.subtext}
              keyboardType="number-pad"
            />
          )}

          {/* Habit (streak type only) */}
          {type === 'streak' && (
            <>
              <Text style={cc.label}>HABIT</Text>
              <TouchableOpacity
                style={cc.habitPicker}
                onPress={() => setPickerVisible(true)}
              >
                {selectedHabit ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 20 }}>{selectedHabit.icon}</Text>
                    <Text style={cc.habitPickerText}>{selectedHabit.name}</Text>
                  </View>
                ) : (
                  <Text style={cc.habitPickerPlaceholder}>Tap to select a habit →</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* XP preview */}
          <View style={cc.xpPreview}>
            <Text style={cc.xpIcon}>⚡</Text>
            <Text style={cc.xpText}>
              Complete for <Text style={{ color: COLORS.gold, fontWeight: '700' }}>+{xpReward} XP</Text>
            </Text>
          </View>

          {/* Buttons */}
          <View style={cc.btnRow}>
            <TouchableOpacity style={cc.cancelBtn} onPress={handleClose}>
              <Text style={cc.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cc.createBtn} onPress={handleCreate}>
              <Text style={cc.createText}>Create & Start</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <HabitPickerModal
        visible={pickerVisible}
        habits={habits}
        onSelect={id => { setHabitId(id); setPickerVisible(false); }}
        onClose={() => setPickerVisible(false)}
      />
    </Modal>
  );
}

const cc = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderTopWidth: 1, borderColor: COLORS.border, maxHeight: '92%',
  },
  content: { padding: 24, paddingBottom: Platform.OS === 'ios' ? 44 : 24 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  nameRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  iconInput: {
    width: 52, backgroundColor: COLORS.inputBg, borderRadius: 12, color: COLORS.text,
    fontSize: 22, textAlign: 'center', paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  nameInput: {
    flex: 1, backgroundColor: COLORS.inputBg, borderRadius: 12, color: COLORS.text,
    fontSize: 15, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  label: {
    color: COLORS.subtext, fontSize: 11, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', marginBottom: 8, marginTop: 4,
  },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderWidth: 1.5, borderColor: COLORS.border,
  },
  typeBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  typeBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  typeBtnTextActive: { color: '#fff', fontWeight: '700' },
  targetRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 10 },
  targetBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
  },
  targetBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  targetBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  targetBtnTextActive: { color: '#fff', fontWeight: '700' },
  customInput: {
    backgroundColor: COLORS.inputBg, borderRadius: 12, color: COLORS.text,
    fontSize: 15, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1,
    borderColor: COLORS.accent, marginBottom: 10,
  },
  habitPicker: {
    backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14,
  },
  habitPickerText: { color: COLORS.text, fontSize: 15 },
  habitPickerPlaceholder: { color: COLORS.subtext, fontSize: 15 },
  xpPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.gold + '22', borderRadius: 12, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.gold + '44',
  },
  xpIcon: { fontSize: 18 },
  xpText: { color: COLORS.text, fontSize: 14 },
  btnRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.inputBg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.text, fontWeight: '600' },
  createBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.accent, alignItems: 'center',
  },
  createText: { color: '#fff', fontWeight: '700' },
});

/* ──────────── Main Screen ──────────── */
export default function ChallengesScreen() {
  const { habits, challenges, startChallenge, startCustomChallenge, abandonChallenge } = useHabits();
  const [pickerTemplate, setPickerTemplate] = useState(null);
  const [createVisible, setCreateVisible] = useState(false);

  const activeIds = new Set(
    challenges.filter(c => c.status === 'active').map(c => c.templateId).filter(Boolean)
  );

  const handleStartTemplate = (template) => {
    if (template.type === 'streak') {
      if (habits.length === 0) { Alert.alert('No habits', 'Add a habit first.'); return; }
      setPickerTemplate(template);
    } else {
      startChallenge(template.id, null);
    }
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const renderActive = (c) => {
    const info = getChallengeInfo(c);
    const { current, target } = getChallengeProgress(c, habits);
    const habit = habits.find(h => h.id === c.habitId);

    return (
      <View key={c.id} style={[s.card, s.cardActive]}>
        <View style={s.cardRow}>
          <Text style={s.cIcon}>{info.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cTitle}>{info.title}</Text>
            {habit && <Text style={s.cMeta}>{habit.icon} {habit.name}</Text>}
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert('Abandon?', 'Remove this challenge?', [
              { text: 'Keep going', style: 'cancel' },
              { text: 'Abandon', style: 'destructive', onPress: () => abandonChallenge(c.id) },
            ]);
          }}>
            <Text style={s.abandon}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.progressText}>{current} / {target} days</Text>
        <ProgressBar current={current} target={target} />
        <Text style={s.xpSmall}>+{info.xpReward} XP on completion</Text>
      </View>
    );
  };

  const renderTemplate = ({ item }) => {
    const isActive = activeIds.has(item.id);
    return (
      <View style={[s.card, isActive && s.cardActive]}>
        <View style={s.cardRow}>
          <Text style={s.cIcon}>{item.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cTitle}>{item.title}</Text>
            <Text style={s.cMeta}>{item.description}</Text>
          </View>
          <View style={s.rightCol}>
            <Text style={s.xpReward}>+{item.xpReward}</Text>
            <Text style={s.xpLabel}>XP</Text>
          </View>
        </View>
        <View style={s.cardFooter}>
          <Text style={s.targetText}>{item.target} days</Text>
          {!isActive ? (
            <TouchableOpacity style={s.startBtn} onPress={() => handleStartTemplate(item)}>
              <Text style={s.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <Text style={s.activeLabel}>Active ✓</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={s.headingRow}>
              <Text style={s.heading}>Challenges</Text>
              <View style={s.headingActions}>
                <TouchableOpacity style={s.createBtn2} onPress={() => setCreateVisible(true)}>
                  <Text style={s.createBtn2Text}>+ Create</Text>
                </TouchableOpacity>
                <AccountButton />
              </View>
            </View>

            {activeChallenges.length > 0 && (
              <>
                <Text style={s.sectionLabel}>In Progress</Text>
                {activeChallenges.map(renderActive)}
              </>
            )}

            {completedChallenges.length > 0 && (
              <View style={s.completedBanner}>
                <Text style={s.completedText}>
                  🏅 {completedChallenges.length} challenge{completedChallenges.length !== 1 ? 's' : ''} completed
                </Text>
              </View>
            )}

            <Text style={s.sectionLabel}>Available</Text>
          </>
        }
        data={CHALLENGE_TEMPLATES}
        keyExtractor={t => t.id}
        renderItem={renderTemplate}
      />

      <HabitPickerModal
        visible={!!pickerTemplate}
        habits={habits}
        onSelect={id => { startChallenge(pickerTemplate.id, id); setPickerTemplate(null); }}
        onClose={() => setPickerTemplate(null)}
      />

      <CreateChallengeModal
        visible={createVisible}
        habits={habits}
        onClose={() => setCreateVisible(false)}
        onCreateChallenge={startCustomChallenge}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 16 },
  heading: { color: COLORS.text, fontSize: 26, fontWeight: '700' },
  headingActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  createBtn2: {
    backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10,
  },
  createBtn2Text: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionLabel: {
    color: COLORS.subtext, fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 10, marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  cardActive: { borderColor: COLORS.accent + '66' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  cIcon: { fontSize: 28 },
  cTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  cMeta: { color: COLORS.subtext, fontSize: 12, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
  xpReward: { color: COLORS.gold, fontSize: 16, fontWeight: '700' },
  xpLabel: { color: COLORS.subtext, fontSize: 10 },
  xpSmall: { color: COLORS.gold, fontSize: 12, marginTop: 6 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  targetText: { color: COLORS.subtext, fontSize: 13 },
  startBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  activeLabel: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  progressText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  abandon: { color: COLORS.subtext, fontSize: 18, padding: 4 },
  completedBanner: {
    backgroundColor: COLORS.success + '22', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.success + '44',
  },
  completedText: { color: COLORS.success, fontSize: 14, fontWeight: '600' },
});
