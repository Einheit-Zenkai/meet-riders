import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import { palette } from '../theme/colors';
import { showAlert } from '../utils/alert';
import {
  fetchScheduleBundle,
  FriendSchedule,
  ScheduleCandidate,
  sendScheduleRequest,
  updateScheduleRequest,
} from '../api/schedules';

type Props = NativeStackScreenProps<RootStackParamList, 'ScheduleWithFriends'>;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const personLabel = (input: { username: string | null; fullName: string | null } | null): string => {
  if (!input) return 'User';
  return input.fullName?.trim() || input.username?.trim() || 'User';
};

const CandidateRow = ({
  item,
  selected,
  onPress,
}: {
  item: ScheduleCandidate;
  selected: boolean;
  onPress: () => void;
}): JSX.Element => (
  <TouchableOpacity
    style={[styles.candidateRow, selected && styles.candidateRowSelected]}
    onPress={onPress}
  >
    <Text style={styles.candidateName}>{item.fullName || item.username || 'User'}</Text>
    <Text style={styles.candidateMeta}>
      {item.source === 'mutual' ? 'Mutual connection' : 'Near your ideal stop'}
    </Text>
    <Text style={styles.candidateMeta}>
      {item.idealLocation || 'No location'} | {item.idealDepartureTime || 'No time'}
    </Text>
  </TouchableOpacity>
);

const ScheduleWithFriendsScreen = ({ navigation }: Props): JSX.Element => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myIdealLocation, setMyIdealLocation] = useState<string>('');

  const [candidates, setCandidates] = useState<ScheduleCandidate[]>([]);
  const [incoming, setIncoming] = useState<FriendSchedule[]>([]);
  const [outgoing, setOutgoing] = useState<FriendSchedule[]>([]);
  const [accepted, setAccepted] = useState<FriendSchedule[]>([]);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [proposedTime, setProposedTime] = useState('15:00');
  const [locationNote, setLocationNote] = useState('');
  const [requestMessage, setRequestMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const bundle = await fetchScheduleBundle();
      setCurrentUserId(bundle.currentUserId);
      setMyIdealLocation(bundle.myIdealLocation ?? '');
      setCandidates(bundle.candidates);
      setIncoming(bundle.incoming);
      setOutgoing(bundle.outgoing);
      setAccepted(bundle.accepted);
      setLocationNote((prev) => prev || bundle.myIdealLocation || '');
    } catch (error: any) {
      console.error('Failed to load schedules', error);
      showAlert('Schedule', error?.message || 'Failed to load schedule data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const freeNow = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const mins = now.getHours() * 60 + now.getMinutes();
    return accepted.filter((item) => {
      if (item.proposedDayOfWeek !== day) return false;
      const parts = item.proposedTime.split(':');
      const target = Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
      return Math.abs(target - mins) <= 20;
    });
  }, [accepted]);

  const onSendRequest = useCallback(async () => {
    if (!selectedCandidateId) {
      showAlert('Schedule', 'Please choose a person first.');
      return;
    }

    const candidate = candidates.find((c) => c.id === selectedCandidateId);
    if (!candidate) {
      showAlert('Schedule', 'Selected person is unavailable now.');
      return;
    }

    try {
      setSubmitting(true);
      await sendScheduleRequest({
        inviteeId: selectedCandidateId,
        source: candidate.source,
        proposedDayOfWeek: selectedDay,
        proposedTime,
        locationNote,
        requestMessage,
      });
      setRequestMessage('');
      showAlert('Schedule', 'Schedule request sent.');
      await load();
    } catch (error: any) {
      console.error('Failed to send schedule request', error);
      showAlert('Schedule', error?.message || 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  }, [candidates, load, locationNote, proposedTime, requestMessage, selectedCandidateId, selectedDay]);

  const onUpdateRequest = useCallback(async (id: string, status: 'accepted' | 'declined') => {
    try {
      let note: string | undefined;
      if (status === 'declined') {
        note = 'Time did not match or location did not match';
      }
      await updateScheduleRequest(id, status, note);
      showAlert('Schedule', status === 'accepted' ? 'Request accepted.' : 'Request declined.');
      await load();
    } catch (error: any) {
      console.error('Failed to update request', error);
      showAlert('Schedule', error?.message || 'Failed to update request.');
    }
  }, [load]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Loading schedules…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'<'}</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule With Friends</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        {freeNow.length > 0 && (
          <View style={styles.freeNowBanner}>
            <Text style={styles.freeNowTitle}>A scheduled friend is free now</Text>
            <Text style={styles.freeNowText}>Host a ride now and invite them.</Text>
            <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('HostParty')}>
              <Text style={styles.bannerButtonText}>Host Party</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose person</Text>
          {candidates.length === 0 ? (
            <Text style={styles.helperText}>No mutuals/location matches yet. Add connections and set ideal stop/time.</Text>
          ) : (
            candidates.map((candidate) => (
              <CandidateRow
                key={candidate.id}
                item={candidate}
                selected={selectedCandidateId === candidate.id}
                onPress={() => setSelectedCandidateId(candidate.id)}
              />
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create request</Text>
          <Text style={styles.label}>Day</Text>
          <View style={styles.dayRow}>
            {DAYS.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[styles.dayChip, selectedDay === index && styles.dayChipActive]}
                onPress={() => setSelectedDay(index)}
              >
                <Text style={[styles.dayChipText, selectedDay === index && styles.dayChipTextActive]}>{day.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Time (24h, HH:MM)</Text>
          <TextInput
            value={proposedTime}
            onChangeText={setProposedTime}
            placeholder="15:00"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
          />

          <Text style={styles.label}>Location note</Text>
          <TextInput
            value={locationNote}
            onChangeText={setLocationNote}
            placeholder="Pickup/drop area"
            placeholderTextColor={palette.textSecondary}
            style={styles.input}
          />
          {myIdealLocation ? <Text style={styles.helperText}>Your ideal stop: {myIdealLocation}</Text> : null}

          <Text style={styles.label}>Message</Text>
          <TextInput
            value={requestMessage}
            onChangeText={setRequestMessage}
            placeholder="Saturday 3 PM works for me"
            placeholderTextColor={palette.textSecondary}
            style={[styles.input, styles.multilineInput]}
            multiline
          />

          <TouchableOpacity style={styles.sendButton} onPress={onSendRequest} disabled={submitting}>
            <Text style={styles.sendButtonText}>{submitting ? 'Sending…' : 'Send schedule request'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incoming requests</Text>
          {incoming.length === 0 ? <Text style={styles.helperText}>No incoming requests.</Text> : incoming.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <Text style={styles.requestName}>{personLabel(item.requester)}</Text>
              <Text style={styles.requestMeta}>{DAYS[item.proposedDayOfWeek]} at {item.proposedTime.slice(0, 5)}</Text>
              {item.locationNote ? <Text style={styles.requestMeta}>Location: {item.locationNote}</Text> : null}
              <View style={styles.requestActions}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => onUpdateRequest(item.id, 'accepted')}>
                  <Text style={styles.requestActionText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.declineBtn} onPress={() => onUpdateRequest(item.id, 'declined')}>
                  <Text style={styles.requestActionText}>Decline</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Outgoing requests</Text>
          {outgoing.length === 0 ? <Text style={styles.helperText}>No pending outgoing requests.</Text> : outgoing.map((item) => (
            <View key={item.id} style={styles.requestCard}>
              <Text style={styles.requestName}>To {personLabel(item.invitee)}</Text>
              <Text style={styles.requestMeta}>{DAYS[item.proposedDayOfWeek]} at {item.proposedTime.slice(0, 5)}</Text>
              {item.locationNote ? <Text style={styles.requestMeta}>Location: {item.locationNote}</Text> : null}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accepted schedules</Text>
          {accepted.length === 0 ? <Text style={styles.helperText}>No accepted schedules yet.</Text> : accepted.map((item) => {
            const other = item.requesterId === currentUserId ? item.invitee : item.requester;
            return (
              <View key={item.id} style={styles.requestCard}>
                <Text style={styles.requestName}>{personLabel(other)}</Text>
                <Text style={styles.requestMeta}>{DAYS[item.proposedDayOfWeek]} at {item.proposedTime.slice(0, 5)}</Text>
                {item.locationNote ? <Text style={styles.requestMeta}>Location: {item.locationNote}</Text> : null}
                {item.responseNote ? <Text style={styles.requestMeta}>Note: {item.responseNote}</Text> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backLabel: {
    color: palette.textPrimary,
    marginLeft: 6,
    fontWeight: '700',
  },
  backArrow: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontWeight: '800',
    fontSize: 18,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.background,
  },
  loadingText: {
    marginTop: 12,
    color: palette.textSecondary,
  },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 18,
    padding: 14,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  helperText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  candidateRow: {
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: palette.surfaceAlt,
  },
  candidateRowSelected: {
    borderColor: palette.primary,
    backgroundColor: '#243229',
  },
  candidateName: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  candidateMeta: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    color: palette.textPrimary,
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: palette.surfaceAlt,
  },
  dayChipActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  dayChipText: {
    color: palette.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  dayChipTextActive: {
    color: palette.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 12,
    backgroundColor: palette.surfaceAlt,
    color: palette.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 12,
    backgroundColor: palette.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  sendButtonText: {
    color: palette.textPrimary,
    fontWeight: '800',
  },
  requestCard: {
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 12,
    padding: 10,
    backgroundColor: palette.surfaceAlt,
    marginBottom: 8,
  },
  requestName: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  requestMeta: {
    color: palette.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  requestActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  declineBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    backgroundColor: palette.danger,
    alignItems: 'center',
  },
  requestActionText: {
    color: palette.textPrimary,
    fontWeight: '700',
  },
  freeNowBanner: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4ade80',
    backgroundColor: '#14532d',
    padding: 14,
  },
  freeNowTitle: {
    color: '#dcfce7',
    fontWeight: '800',
    fontSize: 15,
  },
  freeNowText: {
    color: '#bbf7d0',
    marginTop: 4,
    marginBottom: 10,
    fontSize: 12,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bannerButtonText: {
    color: '#052e16',
    fontWeight: '800',
  },
});

export default ScheduleWithFriendsScreen;
