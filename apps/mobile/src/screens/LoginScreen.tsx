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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { login, signInWithOAuth, OAuthProvider } from '../api/auth';
import { fetchProfile } from '../api/profile';
import { palette } from '../theme/colors';
import { showAlert } from '../utils/alert';

const LoginScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Login'>): JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);

  const handleOAuthSignIn = async (provider: OAuthProvider): Promise<void> => {
    try {
      setOauthLoading(provider);
      const result = await signInWithOAuth(provider);
      setOauthLoading(null);

      if (!result.success) {
        showAlert('Sign-in failed', result.error || 'Authentication was not successful.');
        return;
      }

      const routeName: keyof RootStackParamList = result.needsOnboarding ? 'Onboarding' : 'Home';
      navigation.reset({
        index: 0,
        routes: [{ name: routeName, params: routeName === 'Home' ? { email: result.user?.email } : undefined }],
      });
    } catch (error) {
      setOauthLoading(null);
      showAlert('Sign-in failed', 'An unexpected error occurred. Please try again.');
    }
  };

  const onSubmit = async (): Promise<void> => {
    if (!email || !password) {
      showAlert('Missing info', 'Enter both email and password to continue.');
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      const response = await login({ email: normalizedEmail, password });
      let routeName: keyof RootStackParamList = 'Home';
      const profile = await fetchProfile();
      const needsOnboarding = !profile || !profile.nickname;
      if (needsOnboarding) {
        routeName = 'Onboarding';
      }

      navigation.reset({
        index: 0,
        routes: [{ name: routeName, params: routeName === 'Home' ? { email: response.user.email } : undefined }],
      });
    } catch (error) {
      setLoading(false);
      if (error instanceof Error && error.message) {
        showAlert('Sign-in failed', error.message);
        return;
      }

      showAlert('Sign-in failed', 'We could not sign you in. Please try again.');
    }
  };

  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.container}>
      <StatusBar barStyle="light-content" />
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

          <TouchableOpacity style={[styles.primaryButton, loading && styles.primaryButtonDisabled]} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color={palette.textPrimary} /> : <Text style={styles.primaryButtonText}>Continue</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.oauthButton, styles.googleButton, oauthLoading === 'google' && styles.oauthButtonDisabled]}
            onPress={() => handleOAuthSignIn('google')}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'google' ? (
              <ActivityIndicator color="#1f1f1f" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#1f1f1f" />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.oauthButton, styles.microsoftButton, oauthLoading === 'azure' && styles.oauthButtonDisabled]}
            onPress={() => handleOAuthSignIn('azure')}
            disabled={oauthLoading !== null}
          >
            {oauthLoading === 'azure' ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons name="logo-microsoft" size={20} color="#ffffff" />
                <Text style={styles.microsoftButtonText}>Sign in with Microsoft</Text>
              </>
            )}
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
    color: palette.primary,
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
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.outline,
  },
  dividerText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  oauthButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  oauthButtonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: '#ffffff',
  },
  googleButtonText: {
    color: '#1f1f1f',
    fontWeight: '600',
    fontSize: 15,
  },
  microsoftButton: {
    backgroundColor: '#2f2f2f',
    borderWidth: 1,
    borderColor: '#5e5e5e',
  },
  microsoftButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
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
