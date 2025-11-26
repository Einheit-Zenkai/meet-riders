import 'react-native-url-polyfill/auto';
import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet, ListRenderItemInfo } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import type { Party } from '@meet-riders/shared/types/party';
import { fromPartyRow } from '@meet-riders/shared/types/party';

interface PartyRowResponse {
  id: string;
  created_at: string;
  updated_at: string | null;
  host_id: string;
  party_size: number;
  duration_minutes: number;
  expires_at: string | null;
  meetup_point: string;
  drop_off: string;
  is_friends_only: boolean;
  is_gender_only: boolean;
  ride_options: string[] | null;
  host_university: string | null;
  display_university: boolean;
  is_active: boolean;
}

const PartyCard = ({ party }: { party: Party }) => {
  const expiryText = useMemo(() => {
    const minutesLeft = Math.max(0, Math.round((party.expires_at.getTime() - Date.now()) / 60_000));
    return minutesLeft > 0 ? `${minutesLeft} min left` : 'Expired';
  }, [party.expires_at]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{party.drop_off || 'Open Destination'}</Text>
      <Text style={styles.cardSubtitle}>Meet at: {party.meetup_point}</Text>
      <Text style={styles.cardMeta}>Capacity: {party.current_member_count ?? 0}/{party.party_size}</Text>
      <Text style={styles.cardMeta}>Visibility: {party.is_friends_only ? 'Friends' : 'Public'}</Text>
      <Text style={styles.cardMeta}>Expires: {expiryText}</Text>
    </View>
  );
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [parties, setParties] = useState<Party[]>([]);
  const [partiesLoading, setPartiesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, newSession: Session | null) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setParties([]);
      return;
    }
    void fetchParties();
  }, [session]);

  const fetchParties = async () => {
    setPartiesLoading(true);
    setError(null);

    const { data, error: partiesError } = await supabase
      .from('parties')
      .select(
        'id, created_at, updated_at, host_id, party_size, duration_minutes, expires_at, meetup_point, drop_off, is_friends_only, is_gender_only, ride_options, host_university, display_university, is_active'
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (partiesError) {
      setError(partiesError.message);
      setParties([]);
      setPartiesLoading(false);
      return;
    }

    const rows: PartyRowResponse[] = Array.isArray(data) ? (data as PartyRowResponse[]) : [];
    const transformed: Party[] = rows.map((row) =>
      fromPartyRow(row, {
        current_member_count: undefined,
      })
    );

    setParties(transformed);
    setPartiesLoading(false);
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setAuthLoading(false);
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <StatusBar style="auto" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.heading}>Meet-Riders</Text>
        <Text style={styles.subHeading}>Sign in to continue</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={handleSignIn} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Active Parties</Text>
        <Pressable onPress={handleSignOut} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={fetchParties} style={styles.refreshButton}>
        <Text style={styles.refreshButtonText}>{partiesLoading ? 'Refreshing…' : 'Refresh'}</Text>
      </Pressable>
      {partiesLoading ? <ActivityIndicator /> : null}
      <FlatList
        data={parties}
        keyExtractor={(item: Party) => item.id}
        renderItem={({ item }: ListRenderItemInfo<Party>) => <PartyCard party={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyState}>No parties found yet.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subHeading: {
    marginTop: 8,
    fontSize: 16,
    color: '#cbd5f5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#64748b',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#cbd5f5',
    fontWeight: '500',
  },
  refreshButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#1e3a8a',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#bfdbfe',
  },
  error: {
    color: '#f87171',
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#cbd5f5',
  },
  cardMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  emptyState: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 40,
  },
});
