import { useState, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import { COLORS } from '../constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '🌱',
    title: 'Build Better Habits',
    body: "Small actions, done consistently, create big results. This app keeps you accountable — one day at a time.",
  },
  {
    icon: '⚙️',
    title: 'How It Works',
    bullets: [
      { icon: '📋', text: 'Create habits — binary (once/day) or volume (N times/day)' },
      { icon: '✅', text: 'Check in daily — tap to log and earn +10 XP each time' },
      { icon: '🔥', text: 'Hit milestones — bonus XP at 3, 7, and 30-day streaks' },
      { icon: '🔔', text: 'Get reminded — set a custom notification time per habit' },
    ],
  },
  {
    icon: '🏆',
    title: 'Take On Challenges',
    body: "7-day kickstarts, fortnight warriors, 30-day champions. Accept a challenge, link it to a habit, and earn big XP when you crush it.",
  },
  {
    icon: '🚀',
    title: "You're Ready!",
    body: "Tap + on the Today tab to add your first habit. The streak starts now.",
    isLast: true,
  },
];

export default function OnboardingModal({ onDone }) {
  const [page, setPage] = useState(0);

  const next = () => {
    if (page < SLIDES.length - 1) setPage(p => p + 1);
    else onDone();
  };

  const slide = SLIDES[page];

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        {/* Skip */}
        {!slide.isLast && (
          <TouchableOpacity style={styles.skip} onPress={onDone}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.bigIcon}>{slide.icon}</Text>
          <Text style={styles.title}>{slide.title}</Text>

          {slide.body && (
            <Text style={styles.body}>{slide.body}</Text>
          )}

          {slide.bullets && (
            <View style={styles.bullets}>
              {slide.bullets.map((b, i) => (
                <View key={i} style={styles.bullet}>
                  <Text style={styles.bulletIcon}>{b.icon}</Text>
                  <Text style={styles.bulletText}>{b.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === page && styles.dotActive]}
            />
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={next}>
          <Text style={styles.ctaText}>
            {slide.isLast ? "Let's Go! 🚀" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  skip: { alignSelf: 'flex-end' },
  skipText: { color: COLORS.subtext, fontSize: 15 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigIcon: { fontSize: 80, marginBottom: 28, textAlign: 'center' },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  body: {
    color: COLORS.subtext,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  bullets: { width: '100%', gap: 14, marginTop: 8 },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bulletIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  bulletText: { color: COLORS.text, fontSize: 14, flex: 1, lineHeight: 20 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.accent, width: 24 },
  cta: {
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
