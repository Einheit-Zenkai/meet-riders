import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { fetchProfile } from '../api/profile';
import { mobileMenuItems } from '../constants/menuItems';
import { 
  FeedParty, 
  fetchActivePartyFeed, 
  joinParty, 
  cancelParty,
  PartyJoinRequest,
  fetchMyPartyJoinRequests,
  acceptJoinRequest,
  declineJoinRequest,
} from '../api/party';
import { fetchConnectionsBundle } from '../api/connections';
import { CrownBadge, RatingStars } from '../components/SharedComponents';
import { SoiParty, fetchActiveSoiFeed, cancelSoi, joinSoi } from '../api/soi';

const HomeScreen = ({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Home'>): JSX.Element => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [nickname, setNickname] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedParty[]>([]);

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<FeedParty | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);

  // Notification/Join Requests state
  const [joinRequests, setJoinRequests] = useState<PartyJoinRequest[]>([]);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [showJoinDropdown, setShowJoinDropdown] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PartyJoinRequest | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [requestActionBusy, setRequestActionBusy] = useState(false);

  // SOI (Show of Interest) state
  const [soiFeed, setSoiFeed] = useState<SoiParty[]>([]);
  const [soiLoading, setSoiLoading] = useState(true);
  const [soiError, setSoiError] = useState<string | null>(null);
  const [soiCancelConfirmOpen, setSoiCancelConfirmOpen] = useState(false);
  const [soiCancelTarget, setSoiCancelTarget] = useState<SoiParty | null>(null);
  const [soiCancelBusy, setSoiCancelBusy] = useState(false);

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

      if (mounted) {
        setCurrentUserId(user?.id ?? null);
      }

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

  // Load join requests (for hosts) and friend requests
  const loadNotifications = useCallback(async () => {
    try {
      // Load party join requests if user is a host
      const requests = await fetchMyPartyJoinRequests();
      setJoinRequests(requests);
      
      // Load friend request count
      const connectionsBundle = await fetchConnectionsBundle();
      setFriendRequestCount(connectionsBundle.incomingRequests.length);
    } catch (error) {
      console.error('Failed to load notifications', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const totalNotifications = joinRequests.length + friendRequestCount;

  const showInlineNotice = useCallback((message: string) => {
    setInlineNotice(message);
    setTimeout(() => setInlineNotice(null), 2500);
  }, []);

  const loadFeed = useCallback(async () => {
    try {
      setInlineNotice(null);
      setFeedError(null);
      setFeedLoading(true);
      const parties = await fetchActivePartyFeed();
      setFeed(parties);
    } catch (error: any) {
      console.error('Failed to load party feed', error);
      setFeedError(error?.message || 'Failed to load rides.');
      setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  // Load SOI feed
  const loadSoiFeed = useCallback(async () => {
    try {
      setSoiError(null);
      setSoiLoading(true);
      const sois = await fetchActiveSoiFeed();
      setSoiFeed(sois);
    } catch (error: any) {
      console.error('Failed to load SOI feed', error);
      setSoiError(error?.message || 'Failed to load SOIs.');
      setSoiFeed([]);
    } finally {
      setSoiLoading(false);
    }
  }, []);

  // Cancel SOI handler
  const requestSoiCancel = useCallback((soi: SoiParty) => {
    setSoiCancelTarget(soi);
    setSoiCancelConfirmOpen(true);
  }, []);

  const runSoiCancel = useCallback(async () => {
    if (!soiCancelTarget || soiCancelBusy) return;
    try {
      setSoiCancelBusy(true);
      const result = await cancelSoi(soiCancelTarget.id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel SOI');
      }
      setSoiCancelConfirmOpen(false);
      setSoiCancelTarget(null);
      await loadSoiFeed();
      showInlineNotice('SOI canceled.');
    } catch (error: any) {
      console.error('Failed to cancel SOI', error);
      const msg = error?.message || 'Failed to cancel SOI.';
      setSoiCancelConfirmOpen(false);
      showInlineNotice(msg);
    } finally {
      setSoiCancelBusy(false);
    }
  }, [soiCancelBusy, soiCancelTarget, loadSoiFeed, showInlineNotice]);

  // Join SOI handler
  const handleJoinSoi = useCallback(async (soi: SoiParty) => {
    try {
      const result = await joinSoi(soi.id);
      if (!result.success) {
        Alert.alert('Join failed', result.error || 'Unable to join SOI.');
        return;
      }
      await loadSoiFeed();
      Alert.alert('Joined', 'You joined the SOI.');
    } catch (error: any) {
      console.error('Failed to join SOI', error);
      Alert.alert('Join failed', error?.message || 'Unable to join SOI.');
    }
  }, [loadSoiFeed]);

  const handleAcceptRequest = useCallback(async (request: PartyJoinRequest) => {
    if (requestActionBusy) return;
    try {
      setRequestActionBusy(true);
      await acceptJoinRequest(request.requestId);
      setJoinRequests((prev) => prev.filter((r) => r.requestId !== request.requestId));
      setSelectedRequest(null);
      setProfileModalOpen(false);
      setShowJoinDropdown(false);
      showInlineNotice(`${request.profile.username} has joined your party!`);
      await loadFeed();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept request');
    } finally {
      setRequestActionBusy(false);
    }
  }, [requestActionBusy, loadFeed, showInlineNotice]);

  const handleDeclineRequest = useCallback(async (request: PartyJoinRequest) => {
    if (requestActionBusy) return;
    try {
      setRequestActionBusy(true);
      await declineJoinRequest(request.requestId);
      setJoinRequests((prev) => prev.filter((r) => r.requestId !== request.requestId));
      setSelectedRequest(null);
      setProfileModalOpen(false);
      setShowJoinDropdown(false);
      showInlineNotice(`Declined ${request.profile.username}'s request`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to decline request');
    } finally {
      setRequestActionBusy(false);
    }
  }, [requestActionBusy, showInlineNotice]);

  const openRequestProfile = useCallback((request: PartyJoinRequest) => {
    setSelectedRequest(request);
    setProfileModalOpen(true);
    setShowJoinDropdown(false);
  }, []);

  const requestCancel = useCallback((party: FeedParty) => {
    setCancelTarget(party);
    setCancelConfirmOpen(true);
  }, []);

  const runCancel = useCallback(async () => {
    if (!cancelTarget || cancelBusy) return;
    try {
      setCancelBusy(true);
      await cancelParty(cancelTarget.id);
      setCancelConfirmOpen(false);
      setCancelTarget(null);
      await loadFeed();
      showInlineNotice('Party canceled.');
    } catch (error: any) {
      console.error('Failed to cancel party from home', error);
      const msg = error?.message || 'Failed to cancel party.';
      setCancelConfirmOpen(false);
      showInlineNotice(msg);
    } finally {
      setCancelBusy(false);
    }
  }, [cancelBusy, cancelTarget, loadFeed, showInlineNotice]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    void loadSoiFeed();
  }, [loadSoiFeed]);

  const formatExpiry = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatSoiStartTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today ${time}`;
    if (isTomorrow) return `Tomorrow ${time}`;
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ` ${time}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header Row with Menu, Search, and Notification Bell */}
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
          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.notificationBell}
            onPress={() => setNotificationModalOpen(true)}
          >
            <Ionicons name="notifications" size={24} color={palette.textPrimary} />
            {totalNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Join Requests Dropdown (shown below header for hosts) */}
        {joinRequests.length > 0 && (
          <View style={styles.joinRequestsDropdown}>
            <Text style={styles.joinRequestsTitle}>Join Requests</Text>
            {joinRequests.slice(0, 3).map((request) => (
              <Pressable
                key={request.requestId}
                style={styles.joinRequestItem}
                onPress={() => openRequestProfile(request)}
              >
                <View style={styles.joinRequestInfo}>
                  {request.profile.avatarUrl ? (
                    <Image source={{ uri: request.profile.avatarUrl }} style={styles.joinRequestAvatar} />
                  ) : (
                    <View style={[styles.joinRequestAvatar, styles.joinRequestAvatarPlaceholder]}>
                      <Ionicons name="person" size={16} color={palette.textSecondary} />
                    </View>
                  )}
                  <View style={styles.joinRequestTextContainer}>
                    <Text style={styles.joinRequestUsername}>@{request.profile.username}</Text>
                    {request.rating.totalRatings > 0 && (
                      <View style={styles.joinRequestRating}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={styles.joinRequestRatingText}>
                          {request.rating.averageRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.joinRequestActions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAcceptRequest(request);
                    }}
                    disabled={requestActionBusy}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeclineRequest(request);
                    }}
                    disabled={requestActionBusy}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Pressable>
            ))}
            {joinRequests.length > 3 && (
              <TouchableOpacity
                style={styles.seeMoreRequests}
                onPress={() => setNotificationModalOpen(true)}
              >
                <Text style={styles.seeMoreRequestsText}>
                  +{joinRequests.length - 3} more requests
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
            {inlineNotice ? <Text style={styles.inlineNotice}>{inlineNotice}</Text> : null}
            {feedLoading ? (
              <View style={styles.feedLoadingRow}>
                <ActivityIndicator size="small" color={palette.primary} />
                <Text style={styles.sectionHelper}>Loading rides…</Text>
              </View>
            ) : feedError ? (
              <View>
                <Text style={styles.sectionHelper}>{feedError}</Text>
                <TouchableOpacity style={styles.secondaryAction} onPress={loadFeed}>
                  <Text style={styles.secondaryActionText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : feed.length === 0 ? (
              <View>
                <Text style={styles.sectionHelper}>No rides available right now.</Text>
                <TouchableOpacity style={styles.secondaryAction} onPress={loadFeed}>
                  <Text style={styles.secondaryActionText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.feedList}>
                {feed
                  .filter((p) => {
                    const query = searchQuery.trim().toLowerCase();
                    if (!query) return true;
                    return (
                      p.dropOff.toLowerCase().includes(query) ||
                      p.meetupPoint.toLowerCase().includes(query)
                    );
                  })
                  .map((party) => (
                    <View key={party.id} style={styles.feedCard}>
                      <View style={styles.feedCardRow}>
                        <Text style={styles.feedTitle} numberOfLines={1}>
                          {party.dropOff}
                        </Text>
                        <Text style={styles.feedMeta}>{formatExpiry(party.expiresAt)}</Text>
                      </View>
                      <Text style={styles.feedSub} numberOfLines={1}>
                        Meet: {party.meetupPoint}
                      </Text>
                      <View style={styles.hostRow}>
                        <CrownBadge size={14} />
                        <Text style={styles.hostText}>
                          {currentUserId === party.hostId ? 'You are hosting' : `Host: @${party.hostProfile?.username || 'unknown'}`}
                        </Text>
                      </View>
                      <View style={styles.feedBadges}>
                        {party.isFriendsOnly ? (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>Connections</Text>
                          </View>
                        ) : (
                          <View style={styles.badgeAlt}>
                            <Text style={styles.badgeText}>Public</Text>
                          </View>
                        )}
                        <View style={styles.badgeAlt}>
                          <Text style={styles.badgeText}>Size: {party.partySize}</Text>
                        </View>
                      </View>
                      <View style={styles.feedActions}>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonAlt]}
                          onPress={() => {
                            if (currentUserId && party.hostId === currentUserId) {
                              navigation.navigate('CurrentParty');
                              return;
                            }
                            navigation.navigate('LiveParty', { partyId: party.id });
                          }}
                        >
                          <Text style={styles.actionButtonText}>View</Text>
                        </TouchableOpacity>

                        {currentUserId && party.hostId === currentUserId ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonDanger]}
                            onPress={() => requestCancel(party)}
                          >
                            <Text style={styles.actionButtonText}>Cancel</Text>
                          </TouchableOpacity>
                        ) : party.isJoined ? (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonAlt]}
                            onPress={() => navigation.navigate('CurrentParty')}
                          >
                            <Text style={styles.actionButtonText}>Joined</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonPrimary]}
                            onPress={async () => {
                              try {
                                await joinParty(party.id);
                                await loadFeed();
                                Alert.alert('Joined', 'You joined the party.');
                                navigation.navigate('CurrentParty');
                              } catch (error: any) {
                                console.error('Failed to join party', error);
                                Alert.alert('Join failed', error?.message || 'Unable to join party.');
                              }
                            }}
                          >
                            <Text style={styles.actionButtonText}>Join</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                <TouchableOpacity style={styles.secondaryAction} onPress={loadFeed}>
                  <Text style={styles.secondaryActionText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Rides (SOI)</Text>
            {soiLoading ? (
              <View style={styles.feedLoadingRow}>
                <ActivityIndicator size="small" color={palette.primary} />
                <Text style={styles.sectionHelper}>Loading SOIs…</Text>
              </View>
            ) : soiError ? (
              <View>
                <Text style={styles.sectionHelper}>{soiError}</Text>
                <TouchableOpacity style={styles.secondaryAction} onPress={loadSoiFeed}>
                  <Text style={styles.secondaryActionText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : soiFeed.length === 0 ? (
              <View>
                <Text style={styles.sectionHelper}>No upcoming rides.</Text>
                <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('ShowInterest')}>
                  <Text style={styles.secondaryActionText}>Create SOI</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.feedList}>
                {soiFeed.map((soi) => (
                  <View key={soi.id} style={styles.feedCard}>
                    <View style={styles.feedCardRow}>
                      <Text style={styles.feedTitle} numberOfLines={1}>
                        {soi.dropOff}
                      </Text>
                      <View style={styles.soiTimeBadge}>
                        <Ionicons name="time-outline" size={14} color={palette.accent} />
                        <Text style={styles.soiTimeText}>{formatSoiStartTime(soi.startTime)}</Text>
                      </View>
                    </View>
                    <Text style={styles.feedSub} numberOfLines={1}>
                      Meet: {soi.meetupPoint}
                    </Text>
                    <View style={styles.hostRow}>
                      <Ionicons name="calendar-outline" size={14} color={palette.accent} />
                      <Text style={styles.hostText}>
                        {currentUserId === soi.hostId ? 'You are hosting' : 'SOI'}
                      </Text>
                    </View>
                    <View style={styles.feedBadges}>
                      <View style={styles.badgeAlt}>
                        <Text style={styles.badgeText}>
                          {soi.currentMemberCount || 1}/{soi.partySize} joined
                        </Text>
                      </View>
                      {soi.rideOptions.slice(0, 2).map((ride) => (
                        <View key={ride} style={styles.badgeAlt}>
                          <Text style={styles.badgeText}>{ride}</Text>
                        </View>
                      ))}
                      {soi.displayUniversity && soi.hostUniversity && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{soi.hostUniversity}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.feedActions}>
                      {currentUserId && soi.hostId === currentUserId ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonDanger]}
                          onPress={() => requestSoiCancel(soi)}
                        >
                          <Text style={styles.actionButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      ) : soi.userIsMember ? (
                        <View style={[styles.actionButton, styles.actionButtonAlt]}>
                          <Text style={styles.actionButtonText}>Joined</Text>
                        </View>
                      ) : (soi.currentMemberCount || 1) >= soi.partySize ? (
                        <View style={[styles.actionButton, styles.actionButtonAlt]}>
                          <Text style={styles.actionButtonText}>Full</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.actionButtonPrimary]}
                          onPress={() => handleJoinSoi(soi)}
                        >
                          <Text style={styles.actionButtonText}>Join</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
                <TouchableOpacity style={styles.secondaryAction} onPress={loadSoiFeed}>
                  <Text style={styles.secondaryActionText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* SOI Cancel Confirmation Modal */}
      <Modal visible={soiCancelConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!soiCancelBusy) {
                setSoiCancelConfirmOpen(false);
                setSoiCancelTarget(null);
              }
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Cancel SOI?</Text>
            <Text style={styles.confirmText}>This will end your Show of Interest immediately.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => {
                  setSoiCancelConfirmOpen(false);
                  setSoiCancelTarget(null);
                }}
                disabled={soiCancelBusy}
              >
                <Text style={styles.confirmButtonText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.confirmButtonDanger,
                  soiCancelBusy ? styles.confirmButtonDisabled : undefined,
                ]}
                onPress={runSoiCancel}
                disabled={soiCancelBusy}
              >
                <Text style={styles.confirmButtonText}>{soiCancelBusy ? 'Canceling…' : 'Cancel'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={cancelConfirmOpen} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <Pressable
            style={styles.confirmBackdrop}
            onPress={() => {
              if (!cancelBusy) {
                setCancelConfirmOpen(false);
                setCancelTarget(null);
              }
            }}
          />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Cancel party?</Text>
            <Text style={styles.confirmText}>This will end your party immediately for everyone.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonAlt]}
                onPress={() => {
                  setCancelConfirmOpen(false);
                  setCancelTarget(null);
                }}
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

      {/* Notification Modal - Shows all friend requests and join requests */}
      <Modal visible={notificationModalOpen} animationType="slide" transparent>
        <View style={styles.notificationModalOverlay}>
          <Pressable style={styles.notificationModalBackdrop} onPress={() => setNotificationModalOpen(false)} />
          <View style={styles.notificationModalCard}>
            <View style={styles.notificationModalHeader}>
              <Text style={styles.notificationModalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setNotificationModalOpen(false)}>
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationModalScroll}>
              {/* Friend Requests Section */}
              {friendRequestCount > 0 && (
                <View style={styles.notificationSection}>
                  <TouchableOpacity
                    style={styles.notificationSectionHeader}
                    onPress={() => {
                      setNotificationModalOpen(false);
                      navigation.navigate('Connections');
                    }}
                  >
                    <Ionicons name="people" size={20} color={palette.accent} />
                    <Text style={styles.notificationSectionTitle}>Friend Requests</Text>
                    <View style={styles.notificationCountBadge}>
                      <Text style={styles.notificationCountText}>{friendRequestCount}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Join Requests Section */}
              {joinRequests.length > 0 && (
                <View style={styles.notificationSection}>
                  <View style={styles.notificationSectionHeader}>
                    <Ionicons name="car" size={20} color={palette.primary} />
                    <Text style={styles.notificationSectionTitle}>Party Join Requests</Text>
                    <View style={styles.notificationCountBadge}>
                      <Text style={styles.notificationCountText}>{joinRequests.length}</Text>
                    </View>
                  </View>
                  {joinRequests.map((request) => (
                    <Pressable
                      key={request.requestId}
                      style={styles.notificationRequestItem}
                      onPress={() => {
                        setNotificationModalOpen(false);
                        openRequestProfile(request);
                      }}
                    >
                      {request.profile.avatarUrl ? (
                        <Image source={{ uri: request.profile.avatarUrl }} style={styles.notificationAvatar} />
                      ) : (
                        <View style={[styles.notificationAvatar, styles.notificationAvatarPlaceholder]}>
                          <Ionicons name="person" size={20} color={palette.textSecondary} />
                        </View>
                      )}
                      <View style={styles.notificationRequestInfo}>
                        <Text style={styles.notificationUsername}>@{request.profile.username}</Text>
                        <Text style={styles.notificationSubtext}>wants to join your party</Text>
                      </View>
                      <View style={styles.notificationRequestActions}>
                        <TouchableOpacity
                          style={styles.acceptButtonSmall}
                          onPress={() => handleAcceptRequest(request)}
                          disabled={requestActionBusy}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.declineButtonSmall}
                          onPress={() => handleDeclineRequest(request)}
                          disabled={requestActionBusy}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {totalNotifications === 0 && (
                <View style={styles.emptyNotifications}>
                  <Ionicons name="notifications-off" size={48} color={palette.textSecondary} />
                  <Text style={styles.emptyNotificationsText}>No notifications</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile Detail Modal - Shows full user info before accepting/declining */}
      <Modal visible={profileModalOpen} animationType="slide" transparent>
        <View style={styles.profileModalOverlay}>
          <Pressable style={styles.profileModalBackdrop} onPress={() => setProfileModalOpen(false)} />
          <View style={styles.profileModalCard}>
            {selectedRequest && (
              <>
                <View style={styles.profileModalHeader}>
                  <Text style={styles.profileModalTitle}>Join Request</Text>
                  <TouchableOpacity onPress={() => setProfileModalOpen(false)}>
                    <Ionicons name="close" size={24} color={palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.profileModalScroll}>
                  {/* Avatar & Username */}
                  <View style={styles.profileAvatarSection}>
                    {selectedRequest.profile.avatarUrl ? (
                      <Image
                        source={{ uri: selectedRequest.profile.avatarUrl }}
                        style={styles.profileLargeAvatar}
                      />
                    ) : (
                      <View style={[styles.profileLargeAvatar, styles.profileLargeAvatarPlaceholder]}>
                        <Ionicons name="person" size={48} color={palette.textSecondary} />
                      </View>
                    )}
                    <Text style={styles.profileUsername}>@{selectedRequest.profile.username}</Text>
                    {selectedRequest.profile.fullName && (
                      <Text style={styles.profileFullName}>{selectedRequest.profile.fullName}</Text>
                    )}
                  </View>

                  {/* Rating */}
                  <View style={styles.profileInfoSection}>
                    <View style={styles.profileInfoRow}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.profileInfoLabel}>Rating</Text>
                      <Text style={styles.profileInfoValue}>
                        {selectedRequest.rating.totalRatings > 0
                          ? `${selectedRequest.rating.averageRating.toFixed(1)} (${selectedRequest.rating.totalRatings} reviews)`
                          : 'No ratings yet'}
                      </Text>
                    </View>

                    {/* Gender */}
                    {selectedRequest.profile.gender && (
                      <View style={styles.profileInfoRow}>
                        <Ionicons name="person" size={20} color={palette.accent} />
                        <Text style={styles.profileInfoLabel}>Gender</Text>
                        <Text style={styles.profileInfoValue}>
                          {selectedRequest.profile.gender.charAt(0).toUpperCase() + selectedRequest.profile.gender.slice(1)}
                        </Text>
                      </View>
                    )}

                    {/* University */}
                    {selectedRequest.profile.showUniversity && selectedRequest.profile.university && (
                      <View style={styles.profileInfoRow}>
                        <Ionicons name="school" size={20} color={palette.primary} />
                        <Text style={styles.profileInfoLabel}>University</Text>
                        <Text style={styles.profileInfoValue}>{selectedRequest.profile.university}</Text>
                      </View>
                    )}
                  </View>

                  {/* Star Rating Visual */}
                  {selectedRequest.rating.totalRatings > 0 && (
                    <View style={styles.starRatingSection}>
                      <RatingStars rating={selectedRequest.rating.averageRating} size={24} />
                    </View>
                  )}
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.profileModalActions}>
                  <TouchableOpacity
                    style={[styles.profileActionButton, styles.profileDeclineButton]}
                    onPress={() => handleDeclineRequest(selectedRequest)}
                    disabled={requestActionBusy}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text style={styles.profileActionButtonText}>
                      {requestActionBusy ? 'Processing...' : 'Decline'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.profileActionButton, styles.profileAcceptButton]}
                    onPress={() => handleAcceptRequest(selectedRequest)}
                    disabled={requestActionBusy}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.profileActionButtonText}>
                      {requestActionBusy ? 'Processing...' : 'Accept'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
          onPress={() => navigation.navigate('Profile')}
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
          onPress={() => navigation.navigate('Connections')}
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
                  if (item.label === 'Profile') {
                    navigation.navigate('Profile');
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
                  if (item.label === 'Settings') {
                    navigation.navigate('Settings');
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
  inlineNotice: {
    color: palette.textSecondary,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionHelper: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 12,
  },
  feedLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  feedList: {
    gap: 12,
  },
  feedCard: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  feedCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  feedTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    flex: 1,
  },
  feedMeta: {
    color: palette.textSecondary,
    fontWeight: '700',
  },
  feedSub: {
    color: palette.textSecondary,
    marginTop: 6,
    fontWeight: '600',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  hostText: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  feedBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  feedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  actionButtonDanger: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
  actionButtonAlt: {
    backgroundColor: palette.surface,
  },
  actionButtonText: {
    color: palette.textPrimary,
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
  badge: {
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeAlt: {
    backgroundColor: palette.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  badgeText: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 12,
  },
  soiTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  soiTimeText: {
    color: palette.accent,
    fontWeight: '700',
    fontSize: 12,
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
  // Notification Bell Styles
  notificationBell: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
    marginLeft: 10,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: palette.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  // Join Requests Dropdown Styles
  joinRequestsDropdown: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  joinRequestsTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 10,
  },
  joinRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  joinRequestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  joinRequestAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  joinRequestAvatarPlaceholder: {
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinRequestTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  joinRequestUsername: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  joinRequestRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  joinRequestRatingText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  joinRequestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreRequests: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  seeMoreRequestsText: {
    color: palette.accent,
    fontWeight: '600',
    fontSize: 13,
  },
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notificationModalBackdrop: {
    flex: 1,
  },
  notificationModalCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  notificationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  notificationModalTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  notificationModalScroll: {
    padding: 16,
  },
  notificationSection: {
    marginBottom: 20,
  },
  notificationSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    marginBottom: 10,
  },
  notificationSectionTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  notificationCountBadge: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  notificationCountText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  notificationRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surfaceAlt,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  notificationAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  notificationAvatarPlaceholder: {
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationRequestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  notificationUsername: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  notificationSubtext: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  notificationRequestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    color: palette.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  // Profile Modal Styles
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  profileModalCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: palette.outline,
    overflow: 'hidden',
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  profileModalTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  profileModalScroll: {
    padding: 20,
  },
  profileAvatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileLargeAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileLargeAvatarPlaceholder: {
    backgroundColor: palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.outline,
  },
  profileUsername: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 22,
    marginTop: 16,
  },
  profileFullName: {
    color: palette.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },
  profileInfoSection: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  profileInfoLabel: {
    color: palette.textSecondary,
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  profileInfoValue: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  starRatingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileModalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: palette.outline,
  },
  profileActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  profileAcceptButton: {
    backgroundColor: '#22c55e',
  },
  profileDeclineButton: {
    backgroundColor: palette.danger,
  },
  profileActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default HomeScreen;
