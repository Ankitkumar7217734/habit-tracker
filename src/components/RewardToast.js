import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useHabits } from '../HabitContext';
import { COLORS } from '../constants';

export default function RewardToast() {
  const { rewardPopup } = useHabits();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (rewardPopup) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 16, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [rewardPopup, opacity, translateY]);

  return (
    <Animated.View
      style={[styles.toast, { opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.reason}>{rewardPopup?.reason ?? ''}</Text>
      <Text style={styles.xp}>+{rewardPopup?.amount ?? 0} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
    zIndex: 999,
  },
  reason: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  xp: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
});
