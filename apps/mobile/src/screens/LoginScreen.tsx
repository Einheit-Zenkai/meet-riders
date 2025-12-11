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
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.content}>
        <View style={styles.brandWrapper}>
          <Text style={styles.brand}>MeetRiders</Text>
          <Text style={styles.tagline}>Connect. Ride. Explore.</Text>
        </View>

        <View style={styles.formWrapper}>
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
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  brandWrapper: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  formWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 26,
    gap: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.textPrimary,
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
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  inlineActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  linkText: {
    color: palette.accent,
    fontWeight: '600',
  },
});

export default LoginScreen;
