import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { mobileMenuItems } from '../constants/menuItems';
import { palette } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

type LeaderRow = { rank: number; name: string; points: number };

const dummyLeaders: LeaderRow[] = [
  { rank: 1, name: 'RiderOne', points: 1280 },
  { rank: 2, name: 'NightCruiser', points: 980 },
  { rank: 3, name: 'CampusCaptain', points: 860 },
  { rank: 4, name: 'RoadRunner', points: 740 },
  { rank: 5, name: 'BuddyBiker', points: 650 },
];

const LeaderboardScreen = ({ navigation }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
          </Pressable>

          <Text style={styles.title}>Leaderboard</Text>

          <View style={styles.badge}>
            <Ionicons name="trophy" size={18} color={palette.textPrimary} />
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Riders (Dummy)</Text>
            <Text style={styles.sectionSubtitle}>This is placeholder data for now.</Text>

            <View style={styles.list}>
              {dummyLeaders.map((row) => (
                <View key={row.rank} style={styles.row}>
                  <Text style={styles.rank}>#{row.rank}</Text>
                  <Text style={styles.name} numberOfLines={1}>
                    {row.name}
                  </Text>
                  <Text style={styles.points}>{row.points} pts</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
                  switch (item.label) {
                    case 'Home':
                      navigation.navigate('Home');
                      return;
                    case 'Profile':
                      navigation.navigate('Profile');
                      return;
                    case 'Map':
                      navigation.navigate('Map');
                      return;
                    case 'Host Party':
                      navigation.navigate('HostParty');
                      return;
                    case 'Current Party':
                      navigation.navigate('CurrentParty');
                      return;
                    case 'Live Party':
                      navigation.navigate('LiveParty');
                      return;
                    case 'Show of Interest':
                      navigation.navigate('ShowInterest');
                      return;
                    case 'Connections':
                      navigation.navigate('Connections');
                      return;
                    case 'Leaderboard':
                      return;
                    case 'Expired':
                      navigation.navigate('Expired');
                      return;
                    case 'Settings':
                      navigation.navigate('Settings');
                      return;
                    default:
                      Alert.alert(item.label, 'Navigation coming soon.');
                  }
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  title: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 20,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollArea: { paddingBottom: 18 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: palette.textSecondary,
    marginBottom: 14,
  },
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rank: { width: 54, color: palette.textSecondary, fontWeight: '700' },
  name: { flex: 1, color: palette.textPrimary, fontWeight: '700' },
  points: { color: palette.textSecondary, fontWeight: '700' },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
    paddingTop: 64,
    paddingHorizontal: 18,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuPanel: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.outline,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuLabel: {
    marginLeft: 12,
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LeaderboardScreen;
