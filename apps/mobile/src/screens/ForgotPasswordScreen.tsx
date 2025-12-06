import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';

const ForgotPasswordScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>): JSX.Element => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.heading}>Reset password</Text>
      <Text style={styles.copy}>Password reset flow will go here shortly. Head back to the login screen in the meantime.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back to sign-in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
