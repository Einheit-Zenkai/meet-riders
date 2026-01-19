import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { mobileMenuItems } from '../constants/menuItems';
import { palette } from '../theme/colors';
import {
  ConnectionProfile,
  ConnectionRecord,
  ConnectionsBundle,
  fetchConnectionsBundle,
  removeConnection,
  searchProfilesByUsername,
  sendConnectionRequest,
  updateConnectionStatus,
} from '../api/connections';

const SectionTitle = ({ children }: { children: string }): JSX.Element => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

const EmptyState = ({ message }: { message: string }): JSX.Element => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const profileLabel = (profile: ConnectionProfile): string => {
  if (profile.fullName && profile.fullName.trim().length > 0) {
    return profile.fullName;
  }
  if (profile.username) {
    return profile.username;
  }
  return 'Rider';
};

const badgeInitials = (profile: ConnectionProfile): string => {
  const label = profileLabel(profile);
  const parts = label.split(' ').filter(Boolean);
  if (parts.length === 0) return label.slice(0, 1).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const ConnectionRow = ({
  currentUserId,
  connection,
  onRemove,
  onProfile,
}: {
  currentUserId: string;
  connection: ConnectionRecord;
  onRemove: (connectionId: number) => void;
  onProfile: (userId: string) => void;
}): JSX.Element => {
  const other = connection.requesterId === currentUserId ? connection.addressee : connection.requester;
  return (
    <View style={styles.connectionRow}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{badgeInitials(other)}</Text>
      </View>
      <View style={styles.connectionInfo}>
        <Text style={styles.connectionName}>{profileLabel(other)}</Text>
        {other.username && (
          <Text style={styles.connectionHandle}>@{other.username}</Text>
        )}
      </View>
      <View style={styles.connectionActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onProfile(other.id)}>
          <Ionicons name="person" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.destructiveButton]} onPress={() => onRemove(connection.id)}>
          <Ionicons name="close" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RequestRow = ({
  profile,
  accent,
  onAccept,
  onDecline,
  onCancel,
}: {
  profile: ConnectionProfile;
  accent: 'incoming' | 'outgoing';
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
}): JSX.Element => (
  <View style={styles.connectionRow}>
    <View style={styles.avatarCircle}>
      <Text style={styles.avatarText}>{badgeInitials(profile)}</Text>
    </View>
    <View style={styles.connectionInfo}>
      <Text style={styles.connectionName}>{profileLabel(profile)}</Text>
      {profile.username && (
        <Text style={styles.connectionHandle}>@{profile.username}</Text>
      )}
    </View>
    {accent === 'incoming' ? (
      <View style={styles.connectionActions}>
        <TouchableOpacity style={styles.iconButton} onPress={onAccept}>
          <Ionicons name="checkmark" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconButton, styles.destructiveButton]} onPress={onDecline}>
          <Ionicons name="close" size={18} color={palette.textPrimary} />
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity style={[styles.smallPill, styles.cancelPill]} onPress={onCancel}>
        <Text style={styles.cancelPillText}>Cancel</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ConnectionsScreen = ({ navigation }: NativeStackScreenProps<RootStackParamList, 'Connections'>): JSX.Element => {
  const [bundle, setBundle] = useState<ConnectionsBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [sameUniversityOnly, setSameUniversityOnly] = useState(false);
  const [suggestions, setSuggestions] = useState<ConnectionProfile[]>([]);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchConnectionsBundle();
      setBundle(data);
    } catch (error: any) {
      console.error('Failed to load connections', error);
      Alert.alert('Connections', error.message || 'Failed to load connections.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    const controller = setTimeout(async () => {
      if (!usernameInput.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const matches = await searchProfilesByUsername(
          usernameInput,
          sameUniversityOnly,
          bundle?.university ?? null,
        );
        setSuggestions(matches);
      } catch (error: any) {
        console.error('Profile search failed', error);
      }
    }, 250);

    return () => clearTimeout(controller);
  }, [usernameInput, sameUniversityOnly, bundle?.university]);

  const handleSendRequest = async () => {
    if (sending) {
      return;
    }
    try {
      setSending(true);
      await sendConnectionRequest(usernameInput);
      setUsernameInput('');
      setSuggestions([]);
      Alert.alert('Connections', 'Connection request sent.');
      await loadConnections();
    } catch (error: any) {
      console.error('Failed to send request', error);
      Alert.alert('Connections', error.message || 'Unable to send request.');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (connectionId: number) => {
    try {
      await updateConnectionStatus(connectionId, 'accepted');
      await loadConnections();
    } catch (error: any) {
      console.error('Failed to accept request', error);
      Alert.alert('Connections', error.message || 'Failed to accept request.');
    }
  };

  const handleDecline = async (connectionId: number) => {
    try {
      await updateConnectionStatus(connectionId, 'declined');
      await loadConnections();
    } catch (error: any) {
      console.error('Failed to decline request', error);
      Alert.alert('Connections', error.message || 'Failed to decline request.');
    }
  };

  const handleRemove = async (connectionId: number) => {
    Alert.alert('Remove Connection', 'Are you sure you want to remove this connection?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeConnection(connectionId);
            await loadConnections();
          } catch (error: any) {
            console.error('Failed to remove connection', error);
            Alert.alert('Connections', error.message || 'Failed to remove connection.');
          }
        },
      },
    ]);
  };

  const handleCancel = async (connectionId: number) => {
    try {
      await removeConnection(connectionId);
      await loadConnections();
    } catch (error: any) {
      console.error('Failed to cancel request', error);
      Alert.alert('Connections', error.message || 'Failed to cancel request.');
    }
  };

  const goToProfile = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const hasContent = useMemo(() => {
    if (!bundle) return false;
    return (
      bundle.connections.length > 0 ||
      bundle.incomingRequests.length > 0 ||
      bundle.outgoingRequests.length > 0
    );
  }, [bundle]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <View style={styles.menuStripe} />
          <View style={styles.menuStripe} />
          <View style={styles.menuStripe} />
        </Pressable>
        <Text style={styles.headerTitle}>Connections</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <SectionTitle>Add connection</SectionTitle>
          <Text style={styles.subtitle}>Find riders by username. Toggle Uni to limit suggestions to your campus.</Text>
          <View style={styles.inputRow}>
            <View style={styles.searchWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Search username..."
                placeholderTextColor={palette.textSecondary}
                value={usernameInput}
                onChangeText={setUsernameInput}
              />
              <Pressable
                style={[styles.uniToggle, sameUniversityOnly && styles.uniToggleActive]}
                onPress={() => setSameUniversityOnly((prev) => !prev)}
              >
                <Text style={styles.uniToggleText}>{sameUniversityOnly ? 'Uni✓' : 'Uni'}</Text>
              </Pressable>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, sending && styles.primaryButtonDisabled]}
              onPress={handleSendRequest}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={palette.textPrimary} />
              ) : (
                <Text style={styles.primaryButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
          {suggestions.length > 0 && (
            <View style={styles.suggestionPanel}>
              {suggestions.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.suggestionRow} 
                  onPress={() => goToProfile(item.id)}
                  onLongPress={() => setUsernameInput(item.username ?? '')}
                >
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionText}>{profileLabel(item)}</Text>
                    {item.username && (
                      <Text style={styles.suggestionHandle}>@{item.username}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={palette.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tabItem, activeTab === 'connections' && styles.tabItemActive]}
            onPress={() => setActiveTab('connections')}
          >
            <Ionicons
              name="people"
              size={16}
              color={activeTab === 'connections' ? palette.textPrimary : palette.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'connections' ? styles.tabLabelActive : undefined,
              ]}
            >
              Connections
            </Text>
            <Text style={styles.tabCount}>{bundle?.connections.length ?? 0}</Text>
          </Pressable>
          <Pressable
            style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Ionicons
              name="person-add"
              size={16}
              color={activeTab === 'requests' ? palette.textPrimary : palette.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'requests' ? styles.tabLabelActive : undefined,
              ]}
            >
              Requests
            </Text>
            <Text style={styles.tabCount}>
              {(bundle?.incomingRequests.length ?? 0) + (bundle?.outgoingRequests.length ?? 0)}
            </Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.loadingText}>Loading connections…</Text>
          </View>
        )}

        {!loading && bundle && activeTab === 'connections' && (
          <View style={styles.card}>
            <SectionTitle>Your connections</SectionTitle>
            {bundle.connections.length === 0 ? (
              <EmptyState message="You have no connections yet." />
            ) : (
              bundle.connections.map((connection) => (
                <ConnectionRow
                  key={connection.id}
                  currentUserId={bundle.currentUserId}
                  connection={connection}
                  onRemove={handleRemove}
                  onProfile={goToProfile}
                />
              ))
            )}
          </View>
        )}

        {!loading && bundle && activeTab === 'requests' && (
          <View style={styles.card}>
            <SectionTitle>Incoming requests</SectionTitle>
            {bundle.incomingRequests.length === 0 ? (
              <EmptyState message="No pending requests." />
            ) : (
              bundle.incomingRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  profile={request.requester}
                  accent="incoming"
                  onAccept={() => handleAccept(request.id)}
                  onDecline={() => handleDecline(request.id)}
                />
              ))
            )}

            <SectionTitle>Outgoing requests</SectionTitle>
            {bundle.outgoingRequests.length === 0 ? (
              <EmptyState message="No outgoing requests." />
            ) : (
              bundle.outgoingRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  profile={request.addressee}
                  accent="outgoing"
                  onCancel={() => handleCancel(request.id)}
                />
              ))
            )}
          </View>
        )}

        {!loading && !hasContent && (
          <EmptyState message="Start by searching for a username and sending a connection request." />
        )}
      </ScrollView>

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
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: palette.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: palette.background,
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
  headerSpacer: {
    width: 42,
    height: 42,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.textPrimary,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 18,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: palette.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: palette.textPrimary,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  uniToggle: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -16 }],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surface,
  },
  uniToggleActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  uniToggleText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  suggestionPanel: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.outline,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.outline,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  suggestionHandle: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: palette.primary,
  },
  tabLabel: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: palette.textPrimary,
  },
  tabCount: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  loadingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    color: palette.textSecondary,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.outline,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  avatarText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  connectionHandle: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  connectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  destructiveButton: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
  emptyState: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  emptyStateText: {
    color: palette.textSecondary,
    textAlign: 'center',
  },
  smallPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  cancelPill: {
    backgroundColor: palette.surfaceAlt,
  },
  cancelPillText: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
});

export default ConnectionsScreen;
