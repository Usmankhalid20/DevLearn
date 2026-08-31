import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import {
  ChevronRight,
  LogOut,
  Server,
  Moon,
  Target,
} from 'lucide-react-native';
import { useAuth } from '../context/auth-context';
import { colors } from '../theme/colors';
import { mobileApi } from '../api/client';
import { ConfirmModal } from '../components/ConfirmModal';
import { FormInput } from '../components/ui/FormInput';

export function SettingsScreen() {
  const { user, logout } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [apiUrlModalOpen, setApiUrlModalOpen] = useState(false);
  const [currentApiUrl, setCurrentApiUrl] = useState('');
  const [inputApiUrl, setInputApiUrl] = useState('');

  useEffect(() => {
    mobileApi.getBaseUrl().then((url) => {
      setCurrentApiUrl(url);
      setInputApiUrl(url);
    });
  }, []);

  const handleSaveApiUrl = async () => {
    if (!inputApiUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend API URL.');
      return;
    }

    await mobileApi.setBaseUrl(inputApiUrl.trim());
    setCurrentApiUrl(inputApiUrl.trim());
    setApiUrlModalOpen(false);
    Alert.alert('API URL Updated', `Backend API URL set to ${inputApiUrl.trim()}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Profile Card */}
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DL'}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'DevLearn User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role || 'LEARNER'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Application &amp; Server</Text>

        {/* API Base URL Setting */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setApiUrlModalOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Edit Backend Server URL"
        >
          <View style={styles.settingLeft}>
            <Server size={18} color={colors.textSecondary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Backend Server URL</Text>
              <Text style={styles.settingValue} numberOfLines={1}>
                {currentApiUrl}
              </Text>
            </View>
          </View>
          <ChevronRight size={16} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Theme Display */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Moon size={18} color={colors.textSecondary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Visual Theme</Text>
              <Text style={styles.settingValue}>Monochrome Dark (Default)</Text>
            </View>
          </View>
        </View>

        {/* Daily Goal */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Target size={18} color={colors.textSecondary} style={styles.settingIcon} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>Daily Focus Target</Text>
              <Text style={styles.settingValue}>
                {user?.settings?.dailyGoalMinutes || 60} minutes / day
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setLogoutModalOpen(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sign Out of DevLearn"
      >
        <LogOut size={16} color={colors.red} style={{ marginRight: 8 }} />
        <Text style={styles.logoutButtonText}>Sign Out of DevLearn</Text>
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={logoutModalOpen}
        title="Sign Out"
        description="Are you sure you want to end your active mobile session?"
        confirmLabel="Sign Out"
        variant="danger"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={async () => {
          setLogoutModalOpen(false);
          await logout();
        }}
      />

      {/* API URL Config Modal */}
      <Modal
        transparent
        visible={apiUrlModalOpen}
        animationType="fade"
        onRequestClose={() => setApiUrlModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Backend API URL</Text>
            <Text style={styles.modalDescription}>
              If testing on a physical phone via Expo Go, enter your computer's local Wi-Fi IP (e.g. http://192.168.1.10:5000/api).
            </Text>

            <FormInput
              placeholder="http://192.168.1.X:5000/api"
              autoCapitalize="none"
              autoCorrect={false}
              value={inputApiUrl}
              onChangeText={setInputApiUrl}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setApiUrlModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveApiUrl}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 10,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    minHeight: 52,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  settingValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.redMuted,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.red,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    backgroundColor: colors.white,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.black,
  },
});

