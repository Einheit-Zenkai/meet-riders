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
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { getSupabaseClient } from '../lib/supabase';
import { fetchProfile } from '../api/profile';
import { mobileMenuItems } from '../constants/menuItems';
import { FeedParty, fetchActivePartyFeed, joinParty, cancelParty } from '../api/party';
import { CrownBadge } from '../components/SharedComponents';

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

  const showInlineNotice = useCallback((message: string) => {
    setInlineNotice(message);
    setTimeout(() => setInlineNotice(null), 2500);
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

  const formatExpiry = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
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
            <Text style={styles.sectionHelper}>No upcoming rides.</Text>
          </View>
        </ScrollView>
      </View>

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
