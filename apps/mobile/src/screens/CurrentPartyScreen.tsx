import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { ActiveParty, cancelParty, fetchMyActiveParties, fetchPartyMembers, PartyMember } from '../api/party';

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

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
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

  const canCancel = Boolean(selected && hostId && selected.hostId === hostId && members.some((m) => m.isHost));

  const handleCancel = async () => {
    if (!selected) return;

    Alert.alert('Cancel party', 'This will end your party immediately.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel party',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelParty(selected.id);
            await load();
          } catch (error: any) {
            console.error('Failed to cancel party', error);
            Alert.alert('Cancel party', error.message || 'Failed to cancel party.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable style={styles.topPill} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={palette.textPrimary} />
          <Text style={styles.topPillText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Current Parties</Text>

        <View style={styles.topRight}>
          <View style={styles.bellCircle}>
            <Ionicons name="notifications" size={18} color={palette.textPrimary} />
          </View>
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
        <View style={[styles.body, { flexDirection: isWide ? 'row' : 'column' }]}>
          <View style={[styles.sidebar, { width: isWide ? 320 : '100%' }]}>
            <Text style={styles.sidebarTitle}>Your Active Parties</Text>
            <ScrollView contentContainerStyle={styles.sidebarList} showsVerticalScrollIndicator={false}>
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
            </ScrollView>
          </View>

          <View style={[styles.detail, { flex: isWide ? 1 : 0 }]}>
            {selected ? (
              <View style={styles.detailCard}>
                <Text style={styles.detailTitle}>Ride to {selected.dropOff}</Text>

                <View style={styles.detailStatsRow}>
                  <View style={styles.detailStat}>
                    <Ionicons name="location-outline" size={18} color={palette.textSecondary} />
                    <Text style={styles.detailStatText} numberOfLines={1}>
                      Meetup: {selected.meetupPoint}
                    </Text>
                  </View>

                  <View style={styles.detailStat}>
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
                              <Ionicons name="star" size={16} color={palette.accent} style={styles.memberBadge} />
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

                {selected.hostId && (
                  <Pressable
                    style={[styles.cancelButton, !canCancel ? styles.cancelButtonDisabled : undefined]}
                    onPress={handleCancel}
                    disabled={!canCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel party</Text>
                  </Pressable>
                )}
              </View>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
    paddingTop: 28,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
  },
  topPillText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  title: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 20,
  },
  topRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  bellCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 18,
    gap: 18,
    paddingBottom: 20,
  },
  sidebar: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: 16,
  },
  sidebarTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 12,
  },
  sidebarList: {
    gap: 12,
    paddingBottom: 6,
  },
  partyItem: {
    borderRadius: 12,
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
  detail: {
    flex: 1,
  },
  detailCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: 18,
    gap: 14,
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
    minWidth: 220,
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
    borderRadius: 12,
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
});

export default CurrentPartyScreen;
