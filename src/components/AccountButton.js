import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { COLORS } from '../constants';

export default function AccountButton({ style }) {
  const { session, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const email = session?.user?.email ?? '';
  const initial = email ? email.charAt(0).toUpperCase() : '?';

  const handleSignOut = async () => {
    setOpen(false);
    setConfirming(false);
    await signOut();
  };

  const handleClose = () => {
    setOpen(false);
    setConfirming(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, style]}
        onPress={() => setOpen(true)}
        accessibilityLabel="Account menu"
      >
        <Text style={styles.initial}>{initial}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.signedInLabel}>Signed in as</Text>
                <Text style={styles.email} numberOfLines={1}>{email || '—'}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={COLORS.subtext} />
              </TouchableOpacity>
            </View>

            {confirming ? (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>Sign out of your account?</Text>
                <View style={styles.confirmRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setConfirming(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.signOutBtn}
                    onPress={handleSignOut}
                  >
                    <Ionicons name="log-out-outline" size={16} color="#fff" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.signOutRow}
                onPress={() => setConfirming(true)}
              >
                <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
                <Text style={styles.signOutRowText}>Sign Out</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  initial: { color: COLORS.text, fontSize: 14, fontWeight: '700' },

  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  signedInLabel: { color: COLORS.subtext, fontSize: 11, marginBottom: 2 },
  email: { color: COLORS.text, fontSize: 14, fontWeight: '600' },

  signOutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 4,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  signOutRowText: { color: COLORS.danger, fontSize: 15, fontWeight: '600' },

  confirmBox: {
    borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16,
  },
  confirmText: {
    color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 14, textAlign: 'center',
  },
  confirmRow: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border,
  },
  cancelText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  signOutBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 13, borderRadius: 12, backgroundColor: COLORS.danger,
  },
  signOutText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
