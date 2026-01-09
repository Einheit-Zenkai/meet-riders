import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { signup } from '../api/auth';

const SignupScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Signup'>): JSX.Element => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Missing info', 'Please fill in every field to continue.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords must match before we create your account.');
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const response = await signup({ username, email: normalizedEmail, password });
      setLoading(false);

      if (response.confirmationRequired) {
        Alert.alert('Verify your email', 'Check your inbox for the confirmation link before logging in.');
        navigation.goBack();
        return;
      }

      Alert.alert('Account created', `Signed in as ${response.user.email}`);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error: unknown) {
      setLoading(false);

      if (error instanceof Error && error.name === 'UsernameTaken') {
        Alert.alert('Username already in use', 'Please pick a different username.');
        return;
      }

      if (error instanceof Error && error.message) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      Alert.alert('Sign up failed', 'We could not create your account. Please try again.');
    }
  };

  const handleUsernameChange = (value: string): void => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(sanitized);
  };

  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.heading}>Sign Up</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={handleUsernameChange}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="john_doe or rollnumber123"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
              <Text style={styles.helper}>For students: use your roll number. Others: choose a unique username.</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="you@example.com"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={palette.textSecondary}
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={onSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerCopy}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 28,
    gap: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    width: '100%',
    maxWidth: 420,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  helper: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: palette.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerCopy: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: palette.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SignupScreen;
