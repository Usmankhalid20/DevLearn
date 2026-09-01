import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Server } from 'lucide-react-native';
import { useAuth } from '../context/auth-context';
import { colors } from '../theme/colors';
import { FormInput } from '../components/ui/FormInput';
import { mobileApi } from '../api/client';

export function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Server URL configuration for physical phone testing
  const [serverUrl, setServerUrl] = useState('');
  const [serverModalOpen, setServerModalOpen] = useState(false);
  const [inputServerUrl, setInputServerUrl] = useState('');

  useEffect(() => {
    mobileApi.getBaseUrl().then((url) => {
      setServerUrl(url);
      setInputServerUrl(url);
    });
  }, []);

  const handleSaveServerUrl = async () => {
    if (!inputServerUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend API URL.');
      return;
    }

    await mobileApi.setBaseUrl(inputServerUrl.trim());
    setServerUrl(inputServerUrl.trim());
    setServerModalOpen(false);
    Alert.alert('Server URL Updated', `Connected backend set to:\n${inputServerUrl.trim()}`);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const isNetworkError =
        err?.message === 'Network Error' ||
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNABORTED' ||
        !err?.response;

      if (isNetworkError) {
        Alert.alert(
          'Connection Failed',
          `Could not connect to backend server at:\n${serverUrl}\n\nMake sure your PC and phone are connected to the same Wi-Fi network and the backend server is running.`
        );
      } else {
        Alert.alert(
          'Login Failed',
          err?.response?.data?.message || 'Invalid email or password. Please verify credentials.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>DL</Text>
          </View>
          <Text style={styles.brandTitle}>DevLearn</Text>
          <Text style={styles.brandSubtitle}>Personal Learning Tracker</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>

          <FormInput
            label="Email Address"
            placeholder="user@devlearn.io"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />

          <FormInput
            label="Password"
            placeholder="••••••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign In"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.black} />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Switch to Register */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            accessibilityRole="button"
            accessibilityLabel="Create Account"
          >
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Server Config Trigger */}
        <TouchableOpacity
          style={styles.serverRow}
          onPress={() => setServerModalOpen(true)}
          activeOpacity={0.7}
        >
          <Server size={13} color={colors.textMuted} />
          <Text style={styles.serverText} numberOfLines={1}>
            Server: {serverUrl}
          </Text>
          <Text style={styles.serverEditText}>Edit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Server URL Config Modal */}
      <Modal
        transparent
        visible={serverModalOpen}
        animationType="fade"
        onRequestClose={() => setServerModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend Server URL</Text>
            <Text style={styles.modalDescription}>
              Enter your computer's Wi-Fi IP address (e.g. http://192.168.18.62:5000/api):
            </Text>

            <FormInput
              placeholder="http://192.168.18.62:5000/api"
              autoCapitalize="none"
              autoCorrect={false}
              value={inputServerUrl}
              onChangeText={setInputServerUrl}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setServerModalOpen(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveServerUrl}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSaveText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: colors.black,
    fontSize: 20,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    minHeight: 44,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  footerLink: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 28,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  serverText: {
    fontSize: 11,
    color: colors.textMuted,
    maxWidth: 240,
  },
  serverEditText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
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


