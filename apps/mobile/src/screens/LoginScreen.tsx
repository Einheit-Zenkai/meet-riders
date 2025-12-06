import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { login } from '../api/auth';
import { palette } from '../theme/colors';

const LoginScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Enter both email and password to continue.');
      return;
    }

    try {
      setLoading(true);
      const response = await login({ email, password });
      setLoading(false);
      Alert.alert('Welcome back', `Signed in as ${response.user.email}`);
      // Navigation to dashboard will be wired in a later iteration.
    } catch (error) {
      setLoading(false);
      Alert.alert('Sign-in failed', 'We could not sign you in. Please try again.');
    }
  };

  return (
    <LinearGradient colors={[palette.background, '#111f3a']} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.content}>
        <View>
          <Text style={styles.brand}>MeetRiders</Text>
          <Text style={styles.tagline}>Commute together. Arrive together.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Sign in</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor={palette.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={palette.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.primaryButtonText}>Continue</Text>}
          </TouchableOpacity>

          <View style={styles.inlineActions}>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 56,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: palette.textSecondary,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  input: {
    backgroundColor: palette.muted,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: palette.textPrimary,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  linkText: {
    color: palette.accent,
    fontWeight: '500',
  },
});

export default LoginScreen;
