import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { fetchProfile } from '../api/profile';
import { mobileMenuItems } from '../constants/menuItems';

const HomeScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [nickname, setNickname] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
          </Pressable>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search destination (e.g. MG Road, North Gate)"
            placeholderTextColor={palette.textSecondary}
            style={styles.searchBar}
          />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome back, {welcomeName}</Text>
            <Text style={styles.welcomeSubtitle}>Plan your next ride or join one nearby.</Text>
            <TouchableOpacity
              style={styles.hostButton}
              onPress={() => navigation.navigate('HostParty')}
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
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Home', { email })}
        >
          <Ionicons name="home" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('Profile', 'Profile editing will move here soon.')}
        >
          <Ionicons name="person-circle" size={26} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('HostParty')}
        >
          <Ionicons name="add" size={32} color={palette.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('Connections', 'Connections list coming soon!')}
        >
          <Ionicons name="people" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Connections</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} animationType="fade" transparent>
        <View style={styles.menuOverlay}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menuPanel}>
            {mobileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  if (item.label === 'Home') {
                    return;
                  }
                  if (item.label === 'Host Party') {
                    navigation.navigate('HostParty');
                    return;
                  }
                  if (item.label === 'Settings') {
                    navigation.navigate('Settings');
                    return;
                  }
                  Alert.alert(item.label, 'Navigation coming soon.');
                }}
              >
                <Ionicons name={item.icon} size={22} color={palette.textPrimary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
    paddingVertical: 24,
  },
  container: {
    width: '90%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  menuStripe: {
    width: 22,
    height: 3,
    backgroundColor: palette.textPrimary,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 2,
  },
  searchBar: {
    backgroundColor: palette.surface,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
    flex: 1,
    marginLeft: 12,
  },
  scrollArea: {
    paddingBottom: 160,
  },
  scroll: {
    flex: 1,
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
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: palette.textSecondary,
    marginTop: 6,
  },
  hostButton: {
    marginTop: 18,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  sectionHelper: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 12,
  },
  secondaryAction: {
    alignSelf: 'flex-start',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  secondaryActionText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 420,
    backgroundColor: palette.backgroundAlt,
    borderRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bottomLabel: {
    color: palette.textSecondary,
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  menuPanel: {
    width: 260,
    backgroundColor: palette.surface,
    borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    zIndex: 1,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});

export default HomeScreen;
