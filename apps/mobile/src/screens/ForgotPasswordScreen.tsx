import React from 'react';
import { StatusBar, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

const ForgotPasswordScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>): JSX.Element => {
  return (
    <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.heading}>Reset password</Text>
        <Text style={styles.copy}>Password reset flow will go here shortly. Head back to the login screen in the meantime.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to sign-in</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  copy: {
    fontSize: 16,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default ForgotPasswordScreen;
