import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { showAlert } from '../utils/alert';
import { getSupabaseClient } from '../lib/supabase';
import { mobileMenuItems } from '../constants/menuItems';
import {
  fetchPartyMembers,
  leaveParty,
  PartyMember,
  markReachedStop,
  endPartyWithReason,
  RouteStop,
  fetchRouteStops,
  refreshRouteStopsFromLive,
  optimizeRouteStops,
  saveRouteOrder,
} from '../api/party';
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
  host_reached_stop_at?: string | null;
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
  const [markReachedBusy, setMarkReachedBusy] = useState(false);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeRefreshing, setRouteRefreshing] = useState(false);
  const [routeOptimizing, setRouteOptimizing] = useState(false);
  const [routeSaving, setRouteSaving] = useState(false);

  const partyIdParam = route.params?.partyId;

  const loadParty = useCallback(async (): Promise<void> => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      showAlert('Live Party', 'Supabase client is not configured.');
      setLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      showAlert('Live Party', userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      showAlert('Live Party', 'You must be signed in.');
      setLoading(false);
      return;
    }

    const partyFields = 'id, host_id, party_size, expires_at, meetup_point, drop_off, host_comments, is_active, host_reached_stop_at';
    const nowIso = new Date().toISOString();

    let target: PartyRow | null = null;

    if (partyIdParam) {
      const { data, error } = await supabase
        .from('parties')
        .select(partyFields)
        .eq('id', partyIdParam)
        .maybeSingle();

      if (error) {
        showAlert('Live Party', error.message);
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
      showAlert('Live Party', 'No live party found yet.');
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
          showAlert(
            'No Live Party', 
            'Live party requires at least one member besides the host. This party will be moved to expired parties.',
            [{ text: 'OK', onPress: () => navigation.navigate('CurrentParty') }]
          );
          return;
        }
      } catch (error: any) {
        console.error('Failed to load live party members', error);
        showAlert('Live Party', error.message || 'Failed to load members.');
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

  const loadRouteStops = useCallback(async () => {
    if (!party) return;
    try {
      setRouteLoading(true);
      const stops = await fetchRouteStops(party.id);
      setRouteStops(stops);
    } catch (error: any) {
      console.error('Failed to load route stops', error);
    } finally {
      setRouteLoading(false);
    }
  }, [party]);

  useEffect(() => {
    if (!party) {
      setRouteStops([]);
      return;
    }
    loadRouteStops();
  }, [party, loadRouteStops]);

  const host = useMemo(() => members.find((m) => m.userId === party?.host_id) ?? null, [members, party?.host_id]);
  const nonHostMembers = useMemo(() => {
    if (!party) return [];
    return members.filter((m) => m.userId !== party.host_id);
  }, [members, party]);
  const participants = useMemo(() => {
    if (!party) return [];
    const byUser = new Map<string, PartyMember>();
    members.forEach((member) => byUser.set(member.userId, member));

    if (!byUser.has(party.host_id) && host) {
      byUser.set(party.host_id, {
        ...host,
        reachedStopAt: party.host_reached_stop_at ?? null,
      });
    }

    return Array.from(byUser.values());
  }, [members, party, host]);

  const reachedCount = useMemo(
    () => participants.filter((member) => Boolean(member.reachedStopAt)).length,
    [participants]
  );
  const totalCount = participants.length;
  const me = participants.find((member) => member.userId === currentUserId);
  const myReached = Boolean(me?.reachedStopAt);

  // Rating handlers
  const openRatingModal = (member: PartyMember) => {
    if (member.userId === currentUserId) return; // Can't rate yourself
    if (ratedUserIds.has(member.userId)) {
      showAlert('Already Rated', 'You have already rated this user for this ride.');
      return;
    }
    setMemberToRate(member);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number, comment?: string) => {
    if (!memberToRate || !party) return;
    try {
      await submitRating({ ratedUserId: memberToRate.userId, partyId: party.id, score: rating, comment });
      setRatedUserIds(prev => new Set(prev).add(memberToRate.userId));
      showAlert('Success', `You rated ${displayName(memberToRate)} ${rating} stars!`);
    } catch (error: any) {
      console.error('Failed to submit rating', error);
      showAlert('Error', error?.message || 'Failed to submit rating.');
    } finally {
      setMemberToRate(null);
      setRatingModalOpen(false);
    }
  };

  const openMap = () => navigation.navigate('Map');

  const handleMarkReached = async () => {
    if (!party || !currentUserId || myReached || markReachedBusy) return;
    try {
      setMarkReachedBusy(true);
      const result = await markReachedStop(party.id);
      await loadMembers(party.id, party.host_id, party.expires_at);

      if (result.rideCompleted) {
        showAlert('Ride completed', 'All riders have confirmed their stops.', [
          { text: 'OK', onPress: () => navigation.navigate('RideHistory') },
        ]);
        return;
      }

      showAlert('Stop confirmed', `${result.reachedCount}/${result.totalCount} riders confirmed.`);
    } catch (error: any) {
      console.error('Failed to mark stop reached', error);
      showAlert('Live Party', error?.message || 'Failed to confirm your stop.');
    } finally {
      setMarkReachedBusy(false);
    }
  };

  // Check if current user is not the host (can leave)
  const isHost = party && currentUserId && party.host_id === currentUserId;
  const canLeave = party && currentUserId && !isHost;

  const handleRefreshRoute = async () => {
    if (!party || !isHost) return;
    try {
      setRouteRefreshing(true);
      const added = await refreshRouteStopsFromLive(party.id);
      await loadRouteStops();
      showAlert('Route', `Route stops refreshed (${added} updated).`);
    } catch (error: any) {
      showAlert('Route', error?.message || 'Failed to refresh route stops.');
    } finally {
      setRouteRefreshing(false);
    }
  };

  const handleOptimizeRoute = async () => {
    if (!party || !isHost) return;
    try {
      setRouteOptimizing(true);
      const stops = await optimizeRouteStops(party.id);
      setRouteStops(stops);
      showAlert('Route', 'Optimized routing has been done.');
    } catch (error: any) {
      showAlert('Route', error?.message || 'Failed to optimize route.');
    } finally {
      setRouteOptimizing(false);
    }
  };

  const moveRouteStop = (index: number, direction: -1 | 1) => {
    setRouteStops((prev) => {
      const sorted = [...prev].sort((a, b) => a.stopOrder - b.stopOrder);
      const target = index + direction;
      if (target < 0 || target >= sorted.length) return prev;
      const copy = [...sorted];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy.map((stop, i) => ({ ...stop, stopOrder: i + 1 }));
    });
  };

  const handleSaveRoute = async () => {
    if (!party || !isHost || routeStops.length === 0) return;
    try {
      setRouteSaving(true);
      const ordered = [...routeStops].sort((a, b) => a.stopOrder - b.stopOrder);
      await saveRouteOrder(party.id, ordered.map((stop) => stop.id));
      await loadRouteStops();
      showAlert('Route', 'Route order saved.');
    } catch (error: any) {
      showAlert('Route', error?.message || 'Failed to save route order.');
    } finally {
      setRouteSaving(false);
    }
  };

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
        showAlert('Leave Party', result.error || 'Failed to leave party.');
        return;
      }
      setLeaveConfirmOpen(false);
      showAlert('Left Party', 'You have left the party.', [
        { text: 'OK', onPress: () => navigation.navigate('Home', undefined) }
      ]);
    } catch (error: any) {
      console.error('Failed to leave party', error);
      showAlert('Leave Party', error?.message || 'Failed to leave party.');
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
      await endPartyWithReason(party.id, 'host_connected');
      setCancelConfirmOpen(false);
      showAlert('Ride ended', 'Your ride has been completed and added to history.', [
        { text: 'OK', onPress: () => navigation.navigate('RideHistory') }
      ]);
    } catch (error: any) {
      console.error('Failed to cancel party', error);
      showAlert('End Ride', error?.message || 'Failed to end ride.');
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

              <View style={styles.sectionBox}>
                <Text style={styles.sectionLabel}>Stop confirmations</Text>
                <Text style={styles.sectionValue}>{reachedCount}/{totalCount} reached</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${totalCount > 0 ? (reachedCount / totalCount) * 100 : 0}%` },
                    ]}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.mapButton, myReached ? styles.mapButtonDone : undefined]}
                  onPress={handleMarkReached}
                  disabled={markReachedBusy || myReached}
                >
                  <Ionicons name={myReached ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={palette.textPrimary} />
                  <Text style={styles.mapButtonText}>
                    {myReached ? 'Stop confirmed' : markReachedBusy ? 'Confirming...' : 'Mark my stop reached'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionBox}>
                <Text style={styles.sectionLabel}>Route stops</Text>
                {isHost ? (
                  <View style={styles.routeActionRow}>
                    <TouchableOpacity
                      style={[styles.smallActionButton, (routeRefreshing || routeOptimizing || routeSaving) ? styles.smallActionButtonDisabled : undefined]}
                      onPress={handleRefreshRoute}
                      disabled={routeRefreshing || routeOptimizing || routeSaving}
                    >
                      <Text style={styles.smallActionText}>{routeRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallActionButton, (routeRefreshing || routeOptimizing || routeSaving) ? styles.smallActionButtonDisabled : undefined]}
                      onPress={handleOptimizeRoute}
                      disabled={routeRefreshing || routeOptimizing || routeSaving}
                    >
                      <Text style={styles.smallActionText}>{routeOptimizing ? 'Optimizing...' : 'Optimize shortest route'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {routeLoading ? (
                  <Text style={styles.sectionValue}>Loading route stops...</Text>
                ) : routeStops.length === 0 ? (
                  <Text style={styles.sectionValue}>No route stops yet. Host can refresh and optimize.</Text>
                ) : (
                  <View style={styles.routeList}>
                    {[...routeStops].sort((a, b) => a.stopOrder - b.stopOrder).map((stop, index, arr) => (
                      <View key={stop.id} style={styles.routeRow}>
                        <View style={styles.routeRowLeft}>
                          <Text style={styles.routeRowTitle} numberOfLines={1}>{index + 1}. {stop.stopLabel}</Text>
                          <Text style={styles.routeRowMeta}>
                            {stop.source === 'host_destination' ? 'Destination' : stop.userId ? 'Rider stop' : 'Manual stop'}
                          </Text>
                        </View>
                        {isHost ? (
                          <View style={styles.routeRowActions}>
                            <TouchableOpacity
                              style={styles.routeMoveButton}
                              onPress={() => moveRouteStop(index, -1)}
                              disabled={index === 0 || routeSaving || routeOptimizing || routeRefreshing}
                            >
                              <Ionicons name="arrow-up" size={14} color={palette.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.routeMoveButton}
                              onPress={() => moveRouteStop(index, 1)}
                              disabled={index === arr.length - 1 || routeSaving || routeOptimizing || routeRefreshing}
                            >
                              <Ionicons name="arrow-down" size={14} color={palette.textPrimary} />
                            </TouchableOpacity>
                          </View>
                        ) : null}
                      </View>
                    ))}

                    {isHost ? (
                      <TouchableOpacity
                        style={[styles.mapButton, (routeSaving || routeOptimizing || routeRefreshing) ? styles.mapButtonDone : undefined]}
                        onPress={handleSaveRoute}
                        disabled={routeSaving || routeOptimizing || routeRefreshing || routeStops.length === 0}
                      >
                        <Ionicons name="save-outline" size={18} color={palette.textPrimary} />
                        <Text style={styles.mapButtonText}>{routeSaving ? 'Saving...' : 'Save changes'}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                )}
              </View>

              {isHost && (
                <Pressable style={styles.cancelButton} onPress={handleCancelParty}>
                  <Text style={styles.cancelButtonText}>End Ride</Text>
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
                  <View style={host.reachedStopAt ? styles.reachedBadge : styles.pendingBadge}>
                    <Ionicons
                      name={host.reachedStopAt ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={host.reachedStopAt ? palette.success : palette.textSecondary}
                    />
                    <Text style={host.reachedStopAt ? styles.reachedText : styles.pendingText}>
                      {host.reachedStopAt ? 'Reached' : 'Pending'}
                    </Text>
                  </View>
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
                        <View style={m.reachedStopAt ? styles.reachedBadge : styles.pendingBadge}>
                          <Ionicons
                            name={m.reachedStopAt ? 'checkmark-circle' : 'ellipse-outline'}
                            size={14}
                            color={m.reachedStopAt ? palette.success : palette.textSecondary}
                          />
                          <Text style={m.reachedStopAt ? styles.reachedText : styles.pendingText}>
                            {m.reachedStopAt ? 'Reached' : 'Pending'}
                          </Text>
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
                  if (item.label === 'Ride History') {
                    navigation.navigate('RideHistory');
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
                  showAlert(item.label, 'Navigation coming soon.');
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
            <Text style={styles.confirmTitle}>End Ride?</Text>
            <Text style={styles.confirmText}>This will end the live ride for everyone and add it to ride history.</Text>
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
                  <Text style={styles.confirmButtonText}>End ride</Text>
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
  routeActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  smallActionButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallActionButtonDisabled: {
    opacity: 0.65,
  },
  smallActionText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  routeList: {
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: palette.backgroundAlt,
  },
  routeRowLeft: {
    flex: 1,
    marginRight: 8,
  },
  routeRowTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  routeRowMeta: {
    color: palette.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  routeRowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  routeMoveButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
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
  mapButtonDone: {
    opacity: 0.85,
  },
  mapButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.success,
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
    backgroundColor: palette.surfaceAlt,
  },
  pendingText: {
    color: palette.textSecondary,
    fontWeight: '700',
    fontSize: 11,
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
