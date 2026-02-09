import React, { useState } from 'react';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { showAlert } from '../utils/alert';

const ForgotPasswordScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>): JSX.Element => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (): Promise<void> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      showAlert('Email required', 'Enter your email address to receive a password reset link.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      showAlert('Unavailable', 'Supabase is not configured. Password reset is not available.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
      if (error) {
        showAlert('Reset failed', error.message);
        return;
      }
      setSent(true);
    } catch (err) {
      showAlert('Reset failed', err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[palette.gradientStart, palette.gradientEnd]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="lock-open-outline" size={48} color={palette.primary} />
        </View>

        <Text style={styles.heading}>Reset password</Text>

        {sent ? (
          <View style={styles.successBlock}>
            <Ionicons name="checkmark-circle" size={56} color={palette.success} />
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successCopy}>
              We've sent a password reset link to {email.trim().toLowerCase()}. Follow the instructions in the email to set a new password.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Back to sign-in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formBlock}>
            <Text style={styles.copy}>
              Enter the email associated with your account and we'll send you a link to reset your password.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={palette.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={palette.textPrimary} />
              ) : (
                <Text style={styles.buttonText}>Send reset link</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.goBack()}>
              <Text style={styles.linkText}>Back to sign-in</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.cardBg,
    borderWidth: 1,
    borderColor: palette.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  copy: {
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formBlock: {
    gap: 16,
  },
  input: {
    backgroundColor: palette.inputBg,
    borderWidth: 1,
    borderColor: palette.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: palette.textPrimary,
    fontSize: 16,
  },
  button: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: palette.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    color: palette.accent,
    fontWeight: '600',
    fontSize: 15,
  },
  successBlock: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 12,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  successCopy: {
    fontSize: 15,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ForgotPasswordScreen;
