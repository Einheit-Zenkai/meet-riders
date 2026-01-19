import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { mobileMenuItems } from '../constants/menuItems';
import { ActiveParty, cancelParty, fetchMyActiveParties, fetchPartyMembers, leaveParty, PartyMember } from '../api/party';
import { CrownBadge } from '../components/SharedComponents';

type Props = NativeStackScreenProps<RootStackParamList, 'CurrentParty'>;

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

const initials = (label: string): string => {
  const parts = label.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const memberLabel = (m: PartyMember): string => {
  const full = m.profile.fullName?.trim();
  if (full) return full;
  return m.profile.username || 'Rider';
};

const genderIcon = (gender: string | null): { name: keyof typeof Ionicons.glyphMap; color: string } | null => {
  const g = (gender ?? '').toLowerCase();
  if (!g) return null;
  if (g.startsWith('m')) return { name: 'male', color: '#38bdf8' };
  if (g.startsWith('f')) return { name: 'female', color: '#fb7185' };
  return { name: 'person', color: palette.textSecondary };
};

const CurrentPartyScreen = ({ navigation }: Props): JSX.Element => {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [parties, setParties] = useState<ActiveParty[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);

  const selected = useMemo(() => parties.find((p) => p.id === selectedId) ?? null, [parties, selectedId]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchMyActiveParties();
      setParties(data);
      setSelectedId((prev) => {
        if (prev && data.some((p) => p.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (error: any) {
      console.error('Failed to load current parties', error);
      Alert.alert('Current Parties', error.message || 'Failed to load current parties.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMembers = useCallback(async (partyId: string) => {
    try {
      setLoadingMembers(true);
      const data = await fetchPartyMembers(partyId);
      setMembers(data);
    } catch (error: any) {
      console.error('Failed to load party members', error);
      Alert.alert('Members', error.message || 'Failed to load members.');
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
      } catch (error) {
        console.error('Failed to read current user', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMembers([]);
      return;
    }
    loadMembers(selectedId);
  }, [selectedId, loadMembers]);

  const hostId = selected?.hostId ?? null;
  const nonHostCount = useMemo(() => {
    if (!hostId) return members.length;
    return members.filter((m) => m.userId !== hostId).length;
  }, [members, hostId]);

  const isHost = Boolean(selected && currentUserId && selected.hostId === currentUserId);
  const canCancel = isHost;
  const canLeave = Boolean(selected && currentUserId && !isHost);

  const handleCancel = () => {
    if (!selected || !canCancel) return;
    setCancelConfirmOpen(true);
  };

  const runCancel = async () => {
    if (!selected || cancelBusy) return;
    try {
      setCancelBusy(true);
      await cancelParty(selected.id);
      setCancelConfirmOpen(false);
      await load();
      Alert.alert('Party', 'Party canceled.');
    } catch (error: any) {
      console.error('Failed to cancel party', error);
      Alert.alert('Cancel party', error?.message || 'Failed to cancel party.');
    } finally {
      setCancelBusy(false);
    }
  };

  const handleLeave = () => {
    if (!selected || !canLeave) return;
    setLeaveConfirmOpen(true);
  };

  const runLeave = async () => {
    if (!selected || leaveBusy) return;
    try {
      setLeaveBusy(true);
      const result = await leaveParty(selected.id);
      if (!result.success) {
        Alert.alert('Leave Party', result.error || 'Failed to leave party.');
        return;
      }
      setLeaveConfirmOpen(false);
      await load();
      Alert.alert('Left Party', 'You have left the party.');
    } catch (error: any) {
      console.error('Failed to leave party', error);
      Alert.alert('Leave party', error?.message || 'Failed to leave party.');
    } finally {
      setLeaveBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
            <View style={styles.menuStripe} />
          </Pressable>

          <Text style={styles.title}>Current Parties</Text>

          <View style={styles.bellCircle}>
            <Ionicons name="notifications" size={18} color={palette.textPrimary} />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingText}>Loading parties…</Text>
          </View>
        ) : parties.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No active parties</Text>
            <Text style={styles.emptyText}>Host a party or join one to see it here.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[styles.scrollArea, isWide ? styles.scrollAreaWide : undefined]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Your Active Parties</Text>
              <View style={styles.partyList}>
                {parties.map((party) => {
                  const active = party.id === selectedId;
                  return (
                    <Pressable
                      key={party.id}
                      style={[styles.partyItem, active ? styles.partyItemActive : undefined]}
                      onPress={() => setSelectedId(party.id)}
                    >
                      <View style={styles.partyItemRow}>
                        <Text style={styles.partyItemTitle} numberOfLines={1}>
                          {party.dropOff}
                        </Text>
                        <Text style={styles.partyItemTime}>{formatTime(party.expiresAt)}</Text>
                      </View>
                      <Text style={styles.partyItemMeta} numberOfLines={1}>
                        Meet: {party.meetupPoint}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {selected ? (
              <View style={styles.card}>
                <Text style={styles.detailTitle}>Ride to {selected.dropOff}</Text>

                <View style={styles.detailStatsRow}>
                  <View style={styles.detailStat}>
                    <Ionicons name="location-outline" size={18} color={palette.textSecondary} />
                    <Text style={styles.detailStatText} numberOfLines={1}>
                      Meetup: {selected.meetupPoint}
                    </Text>
                  </View>

                  <View style={styles.detailStatRight}>
                    <Ionicons name="people-outline" size={18} color={palette.textSecondary} />
                    <Text style={styles.detailStatText}>Size: {nonHostCount}/{selected.partySize}</Text>
                  </View>
                </View>

                <View style={styles.sectionBox}>
                  <Text style={styles.sectionLabel}>Host notes</Text>
                  <Text style={styles.sectionValue}>{selected.hostComments?.trim() || '—'}</Text>
                </View>

                <View style={styles.sectionBox}>
                  <Text style={styles.sectionLabel}>Members</Text>
                  {loadingMembers ? (
                    <View style={styles.membersLoading}>
                      <ActivityIndicator size="small" color={palette.primary} />
                      <Text style={styles.membersLoadingText}>Loading members…</Text>
                    </View>
                  ) : members.length === 0 ? (
                    <Text style={styles.sectionValue}>No members yet.</Text>
                  ) : (
                    <View style={styles.memberList}>
                      {members.map((m) => {
                        const label = memberLabel(m);
                        const icon = genderIcon(m.profile.gender);
                        return (
                          <View key={m.userId} style={styles.memberRow}>
                            <View style={styles.memberAvatar}>
                              <Text style={styles.memberAvatarText}>{initials(label)}</Text>
                            </View>
                            <Text style={styles.memberName} numberOfLines={1}>
                              {m.profile.username || label}
                            </Text>
                            {m.isHost && (
                              <View style={styles.memberBadge}>
                                <CrownBadge size={18} />
                              </View>
                            )}
                            {icon && (
                              <Ionicons name={icon.name} size={16} color={icon.color} style={styles.memberBadge} />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <Pressable
                  style={[styles.cancelButton, !canCancel ? styles.cancelButtonDisabled : undefined]}
                  onPress={handleCancel}
                  disabled={!canCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel party</Text>
                </Pressable>

                {canLeave && (
                  <Pressable style={styles.leaveButton} onPress={handleLeave}>
                    <Ionicons name="exit-outline" size={18} color={palette.danger} />
                    <Text style={styles.leaveButtonText}>Leave Party</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Home', undefined)}>
          <Ionicons name="home" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={26} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('HostParty')}>
          <Ionicons name="add" size={32} color={palette.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Connections')}>
          <Ionicons name="people" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Connections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings" size={24} color={palette.textSecondary} />
          <Text style={styles.bottomLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={cancelConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!cancelBusy) setCancelConfirmOpen(false);
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Cancel party?</Text>
            <Text style={styles.confirmText}>This will end your party immediately for everyone.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => setCancelConfirmOpen(false)}
                disabled={cancelBusy}
              >
                <Text style={styles.confirmButtonText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonDanger,
                  cancelBusy ? styles.confirmButtonDisabled : undefined,
                ]}
                onPress={runCancel}
                disabled={cancelBusy}
              >
                <Text style={styles.confirmButtonText}>{cancelBusy ? 'Canceling…' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={leaveConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!leaveBusy) setLeaveConfirmOpen(false);
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Leave party?</Text>
            <Text style={styles.confirmText}>Are you sure you want to leave this party?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => setLeaveConfirmOpen(false)}
                disabled={leaveBusy}
              >
                <Text style={styles.confirmButtonText}>Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonDanger,
                  leaveBusy ? styles.confirmButtonDisabled : undefined,
                ]}
                onPress={runLeave}
                disabled={leaveBusy}
              >
                {leaveBusy ? (
                  <ActivityIndicator size="small" color={palette.textPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Leave</Text>
                )}
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
                  if (item.label === 'Home') {
                    navigation.navigate('Home', undefined);
                    return;
                  }
                  if (item.label === 'Host Party') {
                    navigation.navigate('HostParty');
                    return;
                  }
                  if (item.label === 'Current Party') {
                    navigation.navigate('CurrentParty');
                    return;
                  }
                  if (item.label === 'Live Party') {
                    navigation.navigate('LiveParty');
                    return;
                  }
                  if (item.label === 'Show of Interest') {
                    navigation.navigate('ShowInterest');
                    return;
                  }
                  if (item.label === 'Connections') {
                    navigation.navigate('Connections');
                    return;
                  }
                  if (item.label === 'Profile') {
                    navigation.navigate('Profile');
                    return;
                  }
                  if (item.label === 'Map') {
                    navigation.navigate('Map');
                    return;
                  }
                  if (item.label === 'Leaderboard') {
                    navigation.navigate('Leaderboard');
                    return;
                  }
                  if (item.label === 'Expired') {
                    navigation.navigate('Expired');
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
  bellCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollArea: {
    paddingBottom: 160,
    gap: 16,
  },
  scrollAreaWide: {
    maxWidth: 1100,
    alignSelf: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  emptyText: {
    color: palette.textSecondary,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: 18,
    gap: 14,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  partyList: {
    gap: 12,
  },
  partyItem: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    padding: 12,
  },
  partyItemActive: {
    borderColor: palette.primary,
    backgroundColor: palette.backgroundAlt,
  },
  partyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  partyItemTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    flex: 1,
  },
  partyItemTime: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  partyItemMeta: {
    marginTop: 6,
    color: palette.textSecondary,
  },
  detailTitle: {
    color: palette.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  detailStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  detailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailStatRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailStatText: {
    color: palette.textPrimary,
    fontWeight: '700',
    flexShrink: 1,
  },
  sectionBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    padding: 14,
    gap: 6,
  },
  sectionLabel: {
    color: palette.textSecondary,
    fontWeight: '800',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionValue: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  membersLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  membersLoadingText: {
    color: palette.textSecondary,
    fontWeight: '600',
  },
  memberList: {
    gap: 10,
    marginTop: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    color: palette.textPrimary,
    fontWeight: '900',
    fontSize: 12,
  },
  memberName: {
    color: palette.textPrimary,
    fontWeight: '800',
    flex: 1,
  },
  memberBadge: {
    marginLeft: 2,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    backgroundColor: palette.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: palette.textPrimary,
    fontWeight: '900',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  leaveButtonText: {
    color: palette.danger,
    fontWeight: '800',
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
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonAlt: {
    backgroundColor: palette.surfaceAlt,
  },
  confirmButtonDanger: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: palette.textPrimary,
    fontWeight: '900',
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
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default CurrentPartyScreen;
