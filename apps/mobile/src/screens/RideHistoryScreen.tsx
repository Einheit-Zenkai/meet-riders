import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { showAlert } from '../utils/alert';
import { mobileMenuItems } from '../constants/menuItems';
import { fetchRideHistory, RideHistoryItem, deleteMyRideHistory } from '../api/party';

type Props = NativeStackScreenProps<RootStackParamList, 'RideHistory'>;

const formatReason = (reason: string | null): string => {
  if (!reason) return 'Completed';
  return reason
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const displayName = (item: RideHistoryItem['participants'][number]): string => {
  return item.profile.fullName?.trim() || item.profile.username || 'Rider';
};

const RideHistoryScreen = ({ navigation }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [items, setItems] = useState<RideHistoryItem[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchRideHistory();
      setItems(data);
    } catch (error: any) {
      console.error('Failed to load ride history', error);
      showAlert('Ride history', error?.message || 'Failed to load ride history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleDeleteOne = (rideId: string) => {
    showAlert('Delete history', 'Delete this ride history entry forever?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(rideId);
            await deleteMyRideHistory(rideId);
            setItems((prev) => prev.filter((item) => item.id !== rideId));
          } catch (error: any) {
            showAlert('Ride history', error?.message || 'Failed to delete ride history entry.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    showAlert('Delete all history', 'Delete ALL your ride history forever? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingAll(true);
            await deleteMyRideHistory();
            setItems([]);
          } catch (error: any) {
            showAlert('Ride history', error?.message || 'Failed to delete all ride history.');
          } finally {
            setDeletingAll(false);
          }
        },
      },
    ]);
  };

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

          <Text style={styles.title}>Ride History</Text>

          <TouchableOpacity style={styles.badge} onPress={load}>
            <Text style={styles.badgeText}>R</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.deleteAllButton, (loading || deletingAll || items.length === 0) ? styles.deleteDisabled : undefined]}
            onPress={handleDeleteAll}
            disabled={loading || deletingAll || items.length === 0}
          >
            <Text style={styles.deleteAllText}>{deletingAll ? 'Deleting...' : 'Delete all my history'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={palette.primary} />
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No completed rides yet</Text>
              <Text style={styles.emptyText}>Finished rides will show up here.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((ride) => (
                <View key={ride.id} style={styles.card}>
                  <View style={styles.rowTop}>
                    <Text style={styles.rowTitle} numberOfLines={1}>Ride to {ride.dropOff}</Text>
                    <Text style={styles.rowTime}>
                      {new Date(ride.completedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.rowMeta} numberOfLines={1}>Meet: {ride.meetupPoint}</Text>
                  <Text style={styles.rowMeta}>Result: {formatReason(ride.endReason)}</Text>

                  <View style={styles.participantsWrap}>
                    <Text style={styles.participantsTitle}>Who you rode with</Text>
                    {ride.participants.map((participant) => (
                      <View key={`${ride.id}-${participant.userId}`} style={styles.participantRow}>
                        <View style={styles.participantLeft}>
                          <Text style={styles.participantName} numberOfLines={1}>{displayName(participant)}</Text>
                          <Text style={styles.participantRole}>{participant.role === 'host' ? 'Host' : 'Member'}</Text>
                        </View>
                        <View style={participant.reachedStopAt ? styles.reachedBadge : styles.pendingBadge}>
                          <Text style={participant.reachedStopAt ? styles.reachedText : styles.pendingText}>
                            {participant.reachedStopAt ? 'Reached' : 'Not marked'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.deleteOneButton, deletingId === ride.id ? styles.deleteDisabled : undefined]}
                    onPress={() => handleDeleteOne(ride.id)}
                    disabled={deletingId === ride.id}
                  >
                    <Text style={styles.deleteOneText}>{deletingId === ride.id ? 'Deleting...' : 'Delete this entry'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
                    case 'Ride History':
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
                      navigation.navigate('Expired');
                      return;
                    case 'Settings':
                      navigation.navigate('Settings');
                      return;
                    default:
                      showAlert(item.label, 'Navigation coming soon.');
                  }
                }}
              >
                <Text style={styles.menuIconDot}>•</Text>
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
  actionsRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteAllButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteAllText: {
    color: '#fecaca',
    fontWeight: '700',
    fontSize: 12,
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
  badgeText: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  scroll: { flex: 1 },
  scrollArea: { paddingBottom: 20 },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  emptyText: {
    color: palette.textSecondary,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: 16,
    gap: 8,
  },
  deleteOneButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteOneText: {
    color: '#fecaca',
    fontWeight: '700',
    fontSize: 12,
  },
  deleteDisabled: {
    opacity: 0.6,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 15,
  },
  rowTime: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  rowMeta: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  participantsWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    padding: 10,
    gap: 8,
  },
  participantsTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  participantLeft: {
    flex: 1,
  },
  participantName: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  participantRole: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.success + '20',
  },
  reachedText: {
    color: palette.success,
    fontWeight: '700',
    fontSize: 11,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: palette.surface,
  },
  pendingText: {
    color: palette.textSecondary,
    fontWeight: '700',
    fontSize: 11,
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuIconDot: {
    color: palette.textSecondary,
    fontSize: 16,
    width: 10,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default RideHistoryScreen;
