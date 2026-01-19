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
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { mobileMenuItems } from '../constants/menuItems';
import { cancelParty, fetchPartyMembers, leaveParty, PartyMember } from '../api/party';
import { CrownBadge } from '../components/SharedComponents';
import RatingModal from '../components/RatingModal';
import { submitRating } from '../api/rating';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveParty'>;

type PartyRow = {
  id: string;
  host_id: string;
  party_size: number;
  expires_at: string;
  meetup_point: string;
  drop_off: string;
  host_comments: string | null;
  is_active: boolean;
};

const initials = (name?: string | null): string => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const displayName = (m: PartyMember): string => {
  return m.profile.fullName?.trim() || m.profile.username || 'Rider';
};

const LivePartyScreen = ({ navigation, route }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);

  const [party, setParty] = useState<PartyRow | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Rating state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [memberToRate, setMemberToRate] = useState<PartyMember | null>(null);
  const [ratedUserIds, setRatedUserIds] = useState<Set<string>>(new Set());

  // Leave party state
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leavingBusy, setLeavingBusy] = useState(false);

  // Cancel party state (for host)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  const partyIdParam = route.params?.partyId;

  const loadParty = useCallback(async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      Alert.alert('Live Party', 'Supabase client is not configured.');
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      Alert.alert('Live Party', userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      Alert.alert('Live Party', 'You must be signed in.');
      setLoading(false);
      return;
    }

    const partyFields = 'id, host_id, party_size, expires_at, meetup_point, drop_off, host_comments, is_active';
    const nowIso = new Date().toISOString();

    let target: PartyRow | null = null;

    if (partyIdParam) {
      const { data, error } = await supabase
        .from('parties')
        .select(partyFields)
        .eq('id', partyIdParam)
        .maybeSingle();

      if (error) {
        Alert.alert('Live Party', error.message);
        setLoading(false);
        return;
      }
      target = (data as any) || null;
    } else {
      // Fallback: user's most recent expired party (host or joined) matching web behavior.
      const { data: hosting } = await supabase
        .from('parties')
        .select(partyFields)
        .eq('host_id', user.id)
        .lte('expires_at', nowIso)
        .order('expires_at', { ascending: false })
        .limit(1);

      if (hosting && hosting.length > 0) {
        target = hosting[0] as any;
      } else {
        const { data: memberRows } = await supabase
          .from('party_members')
          .select('party_id')
          .eq('user_id', user.id)
          .eq('status', 'joined');

        const ids = (memberRows || []).map((r: any) => r.party_id).filter(Boolean);
        if (ids.length) {
          const { data: joined } = await supabase
            .from('parties')
            .select(partyFields)
            .in('id', ids)
            .lte('expires_at', nowIso)
            .order('expires_at', { ascending: false })
            .limit(1);

          if (joined && joined.length > 0) {
            target = joined[0] as any;
          }
        }
      }
    }

    if (!target) {
      Alert.alert('Live Party', 'No live party found yet.');
      navigation.navigate('CurrentParty');
      setLoading(false);
      return;
    }

    setParty(target);
    setLoading(false);
  }, [navigation, partyIdParam]);

  const loadMembers = useCallback(
    async (partyId: string, hostId: string, expiresAt: string): Promise<void> => {
      try {
        setMembersLoading(true);
        const mems = await fetchPartyMembers(partyId);
        setMembers(mems);

        const nonHost = mems.filter((m) => m.userId !== hostId);
        const isExpired = new Date(expiresAt).getTime() <= Date.now();

        // Live party is ONLY available when:
        // 1. Party has expired (timer ended)
        // 2. At least one non-host member has joined
        // If no non-host members, the party should go to "expired parties" instead
        if (nonHost.length === 0) {
          Alert.alert(
            'No Live Party', 
            'Live party requires at least one member besides the host. This party will be moved to expired parties.',
            [{ text: 'OK', onPress: () => navigation.navigate('CurrentParty') }]
          );
          return;
        }
      } catch (error: any) {
        console.error('Failed to load live party members', error);
        Alert.alert('Live Party', error.message || 'Failed to load members.');
      } finally {
        setMembersLoading(false);
      }
    },
    [navigation]
  );

  useEffect(() => {
    let mounted = true;
    const go = async () => {
      if (!mounted) return;
      setLoading(true);
      await loadParty();
    };
    go();
    return () => {
      mounted = false;
    };
  }, [loadParty]);

  // Get current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id ?? null);
      } catch (error) {
        console.error('Failed to load current user', error);
      }
    };
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!party) {
      setMembers([]);
      return;
    }
    loadMembers(party.id, party.host_id, party.expires_at);
  }, [party, loadMembers]);

  const host = useMemo(() => members.find((m) => m.userId === party?.host_id) ?? null, [members, party?.host_id]);
  const nonHostMembers = useMemo(() => {
    if (!party) return [];
    return members.filter((m) => m.userId !== party.host_id);
  }, [members, party]);

  // Rating handlers
  const openRatingModal = (member: PartyMember) => {
    if (member.userId === currentUserId) return; // Can't rate yourself
    if (ratedUserIds.has(member.userId)) {
      Alert.alert('Already Rated', 'You have already rated this user for this ride.');
      return;
    }
    setMemberToRate(member);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number, comment?: string) => {
    if (!memberToRate || !party) return;
    try {
      await submitRating(memberToRate.userId, rating, party.id, comment);
      setRatedUserIds(prev => new Set(prev).add(memberToRate.userId));
      Alert.alert('Success', `You rated ${displayName(memberToRate)} ${rating} stars!`);
    } catch (error: any) {
      console.error('Failed to submit rating', error);
      Alert.alert('Error', error?.message || 'Failed to submit rating.');
    } finally {
      setMemberToRate(null);
      setRatingModalOpen(false);
    }
  };

  const openMap = () => navigation.navigate('Map');

  // Check if current user is not the host (can leave)
  const isHost = party && currentUserId && party.host_id === currentUserId;
  const canLeave = party && currentUserId && !isHost;

  const handleLeaveParty = () => {
    if (!canLeave) return;
    setLeaveConfirmOpen(true);
  };

  const runLeaveParty = async () => {
    if (!party || leavingBusy) return;
    try {
      setLeavingBusy(true);
      const result = await leaveParty(party.id);
      if (!result.success) {
        Alert.alert('Leave Party', result.error || 'Failed to leave party.');
        return;
      }
      setLeaveConfirmOpen(false);
      Alert.alert('Left Party', 'You have left the party.', [
        { text: 'OK', onPress: () => navigation.navigate('Home', undefined) }
      ]);
    } catch (error: any) {
      console.error('Failed to leave party', error);
      Alert.alert('Leave Party', error?.message || 'Failed to leave party.');
    } finally {
      setLeavingBusy(false);
    }
  };

  // Cancel party handlers (for host)
  const handleCancelParty = () => {
    if (!isHost || !party) return;
    setCancelConfirmOpen(true);
  };

  const runCancelParty = async () => {
    if (!party || cancelBusy) return;
    try {
      setCancelBusy(true);
      await cancelParty(party.id);
      setCancelConfirmOpen(false);
      Alert.alert('Party Canceled', 'Your party has been canceled.', [
        { text: 'OK', onPress: () => navigation.navigate('Home', undefined) }
      ]);
    } catch (error: any) {
      console.error('Failed to cancel party', error);
      Alert.alert('Cancel Party', error?.message || 'Failed to cancel party.');
    } finally {
      setCancelBusy(false);
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

          <Text style={styles.title}>Live Party</Text>

          <View style={styles.bellCircle}>
            <Ionicons name="radio" size={18} color={palette.textPrimary} />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingText}>Preparing live party…</Text>
          </View>
        ) : !party ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No live party found</Text>
            <Text style={styles.emptyText}>Try again after your party ends.</Text>
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ride to {party.drop_off}</Text>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={18} color={palette.textSecondary} />
                  <Text style={styles.statText} numberOfLines={1}>
                    Meetup: {party.meetup_point}
                  </Text>
                </View>
                <View style={styles.statItemRight}>
                  <Ionicons name="people-outline" size={18} color={palette.textSecondary} />
                  <Text style={styles.statText}>Size: {members.length}/{party.party_size}</Text>
                </View>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionLabel}>Host notes</Text>
                <Text style={styles.sectionValue}>{party.host_comments?.trim() || '—'}</Text>
              </View>

              <Pressable style={styles.mapButton} onPress={openMap}>
                <Ionicons name="map-outline" size={18} color={palette.textPrimary} />
                <Text style={styles.mapButtonText}>Open map</Text>
              </Pressable>

              {isHost && (
                <Pressable style={styles.cancelButton} onPress={handleCancelParty}>
                  <Text style={styles.cancelButtonText}>Cancel Party</Text>
                </Pressable>
              )}

              {canLeave && (
                <Pressable style={styles.leaveButton} onPress={handleLeaveParty}>
                  <Ionicons name="exit-outline" size={18} color={palette.danger} />
                  <Text style={styles.leaveButtonText}>Leave Party</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Host</Text>
              {membersLoading ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator size="small" color={palette.primary} />
                  <Text style={styles.loadingTextSmall}>Loading host…</Text>
                </View>
              ) : host ? (
                <Pressable 
                  style={styles.memberRow}
                  onPress={() => host.userId !== currentUserId && openRatingModal(host)}
                >
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{initials(displayName(host))}</Text>
                  </View>
                  <View style={styles.memberMain}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {displayName(host)}
                    </Text>
                    <Text style={styles.memberHandle} numberOfLines={1}>
                      @{host.profile.username}
                    </Text>
                  </View>
                  <CrownBadge size={20} />
                  {host.userId !== currentUserId && !ratedUserIds.has(host.userId) && (
                    <TouchableOpacity 
                      style={styles.rateButton}
                      onPress={() => openRatingModal(host)}
                    >
                      <Ionicons name="star-outline" size={16} color={palette.primary} />
                      <Text style={styles.rateButtonText}>Rate</Text>
                    </TouchableOpacity>
                  )}
                  {ratedUserIds.has(host.userId) && (
                    <View style={styles.ratedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                      <Text style={styles.ratedText}>Rated</Text>
                    </View>
                  )}
                </Pressable>
              ) : (
                <Text style={styles.sectionValue}>Host profile unavailable.</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Members</Text>
              {membersLoading ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator size="small" color={palette.primary} />
                  <Text style={styles.loadingTextSmall}>Loading members…</Text>
                </View>
              ) : nonHostMembers.length === 0 ? (
                <Text style={styles.sectionValue}>No members yet.</Text>
              ) : (
                <View style={styles.memberList}>
                  {nonHostMembers.map((m) => {
                    const canShowPhone = Boolean(m.profile.showPhone && m.profile.phoneNumber);
                    const canRate = m.userId !== currentUserId;
                    const hasRated = ratedUserIds.has(m.userId);
                    return (
                      <Pressable 
                        key={m.userId} 
                        style={styles.memberRow}
                        onPress={() => canRate && !hasRated && openRatingModal(m)}
                      >
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>{initials(displayName(m))}</Text>
                        </View>
                        <View style={styles.memberMain}>
                          <Text style={styles.memberName} numberOfLines={1}>
                            {displayName(m)}
                          </Text>
                          <Text style={styles.memberHandle} numberOfLines={1}>
                            @{m.profile.username}
                          </Text>
                          {canShowPhone ? (
                            <Text style={styles.memberPhone} numberOfLines={1}>
                              {m.profile.phoneNumber}
                            </Text>
                          ) : null}
                        </View>
                        {canRate && !hasRated && (
                          <TouchableOpacity 
                            style={styles.rateButton}
                            onPress={() => openRatingModal(m)}
                          >
                            <Ionicons name="star-outline" size={16} color={palette.primary} />
                            <Text style={styles.rateButtonText}>Rate</Text>
                          </TouchableOpacity>
                        )}
                        {hasRated && (
                          <View style={styles.ratedBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={palette.success} />
                            <Text style={styles.ratedText}>Rated</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
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
                  if (item.label === 'Map') {
                    navigation.navigate('Map');
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

      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalOpen}
        onClose={() => {
          setRatingModalOpen(false);
          setMemberToRate(null);
        }}
        onSubmit={handleRatingSubmit}
        userName={memberToRate ? displayName(memberToRate) : ''}
      />

      {/* Leave Party Confirmation Modal */}
      <Modal visible={leaveConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!leavingBusy) setLeaveConfirmOpen(false);
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Leave Party?</Text>
            <Text style={styles.confirmText}>Are you sure you want to leave this party?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => setLeaveConfirmOpen(false)}
                disabled={leavingBusy}
              >
                <Text style={styles.confirmButtonText}>Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonDanger,
                  leavingBusy ? styles.confirmButtonDisabled : undefined,
                ]}
                onPress={runLeaveParty}
                disabled={leavingBusy}
              >
                {leavingBusy ? (
                  <ActivityIndicator size="small" color={palette.textPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Leave</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Party Confirmation Modal (for host) */}
      <Modal visible={cancelConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!cancelBusy) setCancelConfirmOpen(false);
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Cancel Party?</Text>
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
                onPress={runCancelParty}
                disabled={cancelBusy}
              >
                {cancelBusy ? (
                  <ActivityIndicator size="small" color={palette.textPrimary} />
                ) : (
                  <Text style={styles.confirmButtonText}>Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingTextSmall: {
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
  scroll: {
    flex: 1,
  },
  scrollArea: {
    paddingBottom: 160,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontWeight: '900',
    fontSize: 18,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
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
  sectionTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: palette.primary,
    borderRadius: 16,
    paddingVertical: 12,
  },
  mapButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: palette.danger,
    borderRadius: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  leaveButtonText: {
    color: palette.danger,
    fontWeight: '800',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberList: {
    gap: 10,
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
  memberMain: {
    flex: 1,
  },
  memberName: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  memberHandle: {
    color: palette.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  memberPhone: {
    color: palette.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: palette.primary + '20',
    borderWidth: 1,
    borderColor: palette.primary,
  },
  rateButtonText: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: palette.success + '20',
  },
  ratedText: {
    color: palette.success,
    fontWeight: '700',
    fontSize: 12,
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.outline,
    gap: 16,
  },
  confirmTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
  },
  confirmText: {
    color: palette.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonAlt: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  confirmButtonDanger: {
    backgroundColor: palette.danger,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
});

export default LivePartyScreen;
