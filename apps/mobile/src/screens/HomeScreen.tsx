import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { fetchProfile } from '../api/profile';

const HomeScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [nickname, setNickname] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const welcomeName = useMemo(() => {
    if (nickname.trim()) return nickname;
    if (email.trim()) return email.split('@')[0];
    return 'Rider';
  }, [nickname, email]);

  useEffect(() => {
    let mounted = true;
    const load = async (): Promise<void> => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted && user?.email) {
        setEmail(user.email);
      }

      if (mounted) {
        try {
          const profile = await fetchProfile();
          if (profile?.nickname) {
            setNickname(profile.nickname);
          }
        } catch (error) {
          console.error('Failed to load profile info', error);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search destination (e.g. MG Road, North Gate)"
          placeholderTextColor={palette.textSecondary}
          style={styles.searchBar}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back, {welcomeName}</Text>
          <Text style={styles.welcomeSubtitle}>Plan your next ride or join one nearby.</Text>
          <TouchableOpacity
            style={styles.hostButton}
            onPress={() => Alert.alert('Host a ride', 'Hosting rides will be available soon!')}
          >
            <Text style={styles.hostButtonText}>Host a Ride</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Rides</Text>
          <Text style={styles.sectionHelper}>No rides match your filters right now.</Text>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => Alert.alert('Explore rides', 'Ride discovery coming soon!')}
          >
            <Text style={styles.secondaryActionText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Rides (SOI)</Text>
          <Text style={styles.sectionHelper}>No upcoming rides.</Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Home', { email })}>
          <Text style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('Profile', 'Profile editing will move here soon.')}
        >
          <Text style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => Alert.alert('Host a ride', 'Hosting rides will be available soon!')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('Connections', 'Connections list coming soon!')}
        >
          <Text style={styles.bottomLabel}>Connections</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('Settings', 'Settings page coming soon!')}
        >
          <Text style={styles.bottomLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  scrollArea: {
    paddingBottom: 160,
    gap: 24,
  },
  welcomeCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
  },
  hostButton: {
    marginTop: 8,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  section: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  sectionHelper: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  secondaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  secondaryActionText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  signOutButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
  },
  bottomLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  fab: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  fabText: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 32,
    marginTop: -4,
  },
});

export default HomeScreen;
