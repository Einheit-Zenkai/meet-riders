import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HostPartyScreen from '../screens/HostPartyScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ConnectionsScreen from '../screens/ConnectionsScreen';
import MapScreen from '../screens/MapScreen';
import ShowInterestScreen from '../screens/ShowInterestScreen';
import CurrentPartyScreen from '../screens/CurrentPartyScreen';
import LivePartyScreen from '../screens/LivePartyScreen';
import ExpiredPartiesScreen from '../screens/ExpiredPartiesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
  Home: { email: string } | undefined;
  HostParty: undefined;
  ShowInterest: undefined;
  Settings: undefined;
  Profile: { userId?: string } | undefined;
  Connections: undefined;
  Map:
    | {
        start?: { latitude: number; longitude: number };
        destination?: { latitude: number; longitude: number };
      }
    | undefined;
  CurrentParty: undefined;
  LiveParty: { partyId?: string } | undefined;
  Leaderboard: undefined;
  Expired: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.background,
    card: palette.surface,
    primary: palette.primary,
    text: palette.textPrimary,
    border: palette.surface,
    notification: palette.primary,
  },
};

const AppNavigator = (): JSX.Element => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setInitialRoute('Login');
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setInitialRoute(data.session ? 'Home' : 'Login');
      } catch {
        if (!mounted) return;
        setInitialRoute('Login');
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Only react to actual sign-in/sign-out, not periodic token refreshes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setInitialRoute(session ? 'Home' : 'Login');
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        key={initialRoute}
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="HostParty" component={HostPartyScreen} />
        <Stack.Screen name="ShowInterest" component={ShowInterestScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Connections" component={ConnectionsScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="CurrentParty" component={CurrentPartyScreen} />
        <Stack.Screen name="LiveParty" component={LivePartyScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="Expired" component={ExpiredPartiesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
