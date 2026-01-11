import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { mobileMenuItems } from '../constants/menuItems';
import { ExpiredParty, fetchMyExpiredParties, restoreParty } from '../api/party';
import { getSupabaseClient } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Expired'>;

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const formatCountdown = (ms: number): string => {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const ExpiredPartiesScreen = ({ navigation }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ExpiredParty[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<ExpiredParty | null>(null);
  const [restoreBusy, setRestoreBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        setCurrentUserId(data.user?.id ?? null);
      }
      const data = await fetchMyExpiredParties();
      setItems(data);
    } catch (error: any) {
      console.error('Failed to load expired parties', error);
      Alert.alert('Expired parties', error?.message || 'Failed to load expired parties.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…';
    if (items.length === 0) return 'No recent expired parties.';
    return 'Recently expired/cancelled (last ~5 minutes).';
  }, [items.length, loading]);

  const requestRestore = useCallback((party: ExpiredParty) => {
    setRestoreTarget(party);
    setRestoreConfirmOpen(true);
  }, []);

  const runRestore = useCallback(async () => {
    if (!restoreTarget || restoreBusy) return;
    try {
      setRestoreBusy(true);
      await restoreParty(restoreTarget.id);
      setRestoreConfirmOpen(false);
      setRestoreTarget(null);
      await load();
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'CurrentParty' }] });
    } catch (error: any) {
      console.error('Failed to restore party', error);
      setRestoreConfirmOpen(false);
      Alert.alert('Restore party', error?.message || 'Failed to restore party.');
    } finally {
      setRestoreBusy(false);
    }
  }, [load, navigation, restoreBusy, restoreTarget]);

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

          <Text style={styles.title}>Expired</Text>

          <TouchableOpacity style={styles.badge} onPress={load}>
            <Ionicons name="refresh" size={18} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Expired Parties</Text>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>

            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={palette.primary} />
              </View>
            ) : items.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyText}>Create or join a party to see it here after it ends.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {items.map((party) => {
                  const endedAtMs = new Date(party.endedAt).getTime();
                  const remainingMs = endedAtMs + 5 * 60_000 - nowTick;
                  const canRestore =
                    Boolean(currentUserId && party.hostId === currentUserId) &&
                    Number.isFinite(remainingMs) &&
                    remainingMs > 0;

                  return (
                    <View key={party.id} style={styles.row}>
                      <View style={styles.rowTop}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {party.dropOff}
                        </Text>
                        <Text style={styles.rowTime}>{formatTime(party.endedAt)}</Text>
                      </View>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        Meet: {party.meetupPoint}
                      </Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        Ended: {party.endedReason}
                        {Number.isFinite(remainingMs) ? ` • Restore: ${formatCountdown(remainingMs)}` : ''}
                      </Text>

                      {canRestore ? (
                        <View style={styles.rowActions}>
                          <TouchableOpacity style={styles.restoreButton} onPress={() => requestRestore(party)}>
                            <Text style={styles.restoreText}>Restore</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <Modal visible={restoreConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!restoreBusy) {
                setRestoreConfirmOpen(false);
                setRestoreTarget(null);
              }
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Restore party?</Text>
            <Text style={styles.confirmText}>
              This will make the party active again and reset the timer to the original duration.
            </Text>
            {restoreTarget ? (
              <Text style={styles.confirmMeta}>
                Duration: {restoreTarget.durationMinutes} min
              </Text>
            ) : null}
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => {
                  setRestoreConfirmOpen(false);
                  setRestoreTarget(null);
                }}
                disabled={restoreBusy}
              >
                <Text style={styles.confirmButtonText}>Not now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonPrimary, restoreBusy ? styles.confirmButtonDisabled : undefined]}
                onPress={runRestore}
                disabled={restoreBusy}
              >
                <Text style={styles.confirmButtonText}>{restoreBusy ? 'Restoring…' : 'Restore'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
                      navigation.navigate('Leaderboard');
                      return;
                    case 'Expired':
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
  loadingWrap: {
    paddingVertical: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  emptyText: { color: palette.textSecondary, textAlign: 'center' },
  list: { gap: 10 },
  row: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  rowTitle: { flex: 1, color: palette.textPrimary, fontWeight: '800' },
  rowTime: { color: palette.textSecondary, fontWeight: '700' },
  rowMeta: { color: palette.textSecondary, marginTop: 2 },
  rowActions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  restoreButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  restoreText: {
    color: palette.textPrimary,
    fontWeight: '900',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.outline,
    padding: 18,
  },
  confirmTitle: {
    color: palette.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  confirmText: {
    color: palette.textSecondary,
    fontWeight: '600',
    marginTop: 8,
  },
  confirmMeta: {
    color: palette.textSecondary,
    fontWeight: '700',
    marginTop: 10,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  confirmButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonAlt: {
    backgroundColor: palette.surfaceAlt,
  },
  confirmButtonPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: palette.textPrimary,
    fontWeight: '900',
  },
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

export default ExpiredPartiesScreen;
