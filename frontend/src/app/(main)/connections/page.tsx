'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { UserCheck, UserPlus, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- TYPES ---
// Derived from your SQL schema
type Profile = {
  id: string;
  username: string;
  full_name: string | null;
};

type Connection = {
  id: number;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  // We'll join the profile data onto our connections
  requester: Profile;
  addressee: Profile;
};

// --- COMPONENT ---

export default function ConnectionsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [sameUniversityOnly, setSameUniversityOnly] = useState(false);
  const [myUniversity, setMyUniversity] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<Connection[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Connection[]>([]);

  // --- DATA FETCHING ---
  const fetchData = useCallback(async (currentUserId: string) => {
    setLoading(true);

    // Fetch accepted connections
    const { data: accepted, error: acceptedError } = await supabase
      .from('connections')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`)
      .eq('status', 'accepted');

    if (acceptedError) toast.error('Failed to fetch connections.');
    else setConnections(accepted || []);

    // Fetch incoming requests
    const { data: incoming, error: incomingError } = await supabase
      .from('connections')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .eq('addressee_id', currentUserId)
      .eq('status', 'pending');

    if (incomingError) toast.error('Failed to fetch incoming requests.');
    else setIncomingRequests(incoming || []);

    // Fetch outgoing requests
    const { data: outgoing, error: outgoingError } = await supabase
      .from('connections')
      .select('*, requester:requester_id(*), addressee:addressee_id(*)')
      .eq('requester_id', currentUserId)
      .eq('status', 'pending');

    if (outgoingError) toast.error('Failed to fetch outgoing requests.');
    else setOutgoingRequests(outgoing || []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user as unknown as User);
        fetchData(user.id);
        // Load my university for filtering
        const { data: prof } = await supabase.from('profiles').select('university').eq('id', user.id).maybeSingle();
        setMyUniversity((prof as any)?.university ?? null);
      } else {
        setLoading(false);
      }
    };
    getUserAndData();
  }, [supabase, fetchData]);

  // Live suggestions when typing
  useEffect(() => {
    const run = async () => {
      const q = usernameInput.trim();
      if (!q) { setSuggestions([]); return; }
      let query = supabase.from('profiles')
        .select('id, username, full_name')
        .ilike('username', `%${q}%`)
        .limit(5);
      if (sameUniversityOnly && myUniversity) {
        query = query.eq('university', myUniversity);
      }
      const { data } = await query;
      setSuggestions((data as any) || []);
    }
    run();
  }, [usernameInput, sameUniversityOnly, myUniversity, supabase]);


  // --- HANDLERS ---

  const handleSendRequest = async () => {
    if (!user) return toast.error('You must be logged in.');
    if (!usernameInput.trim()) return toast.error('Please enter a username.');

    const { data: addressee, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', usernameInput.trim())
      .single();

    if (findError || !addressee) {
      return toast.error('User not found.');
    }
    if (addressee.id === user.id) {
      return toast.error("You can't add yourself as a connection.");
    }

    const { error: insertError } = await supabase.from('connections').insert({
      requester_id: user.id,
      addressee_id: addressee.id,
      status: 'pending',
    });

    if (insertError) {
      if (insertError.code === '23505') { // unique_connection_pair violation
        toast.error('A connection request already exists with this user.');
      } else {
        toast.error(`Failed to send request: ${insertError.message}`);
      }
    } else {
      toast.success('Connection request sent!');
      setUsernameInput('');
      fetchData(user.id); // Refresh data
    }
  };

  const handleUpdateRequest = async (connectionId: number, newStatus: 'accepted' | 'declined') => {
    if (!user) return;
    const { error } = await supabase
      .from('connections')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    if (error) {
      toast.error(`Failed to ${newStatus === 'accepted' ? 'accept' : 'decline'} request.`);
    } else {
      toast.success(`Request ${newStatus === 'accepted' ? 'accepted' : 'declined'}.`);
      fetchData(user.id);
    }
  };

  const handleDeleteRequest = async (connectionId: number, type: 'cancel' | 'remove') => {
    if (!user) return;
    const { error } = await supabase.from('connections').delete().eq('id', connectionId);

    if (error) {
      toast.error(`Failed to ${type === 'cancel' ? 'cancel' : 'remove'} connection.`);
    } else {
      toast.success(`Connection ${type === 'cancel' ? 'request cancelled' : 'removed'}.`);
      fetchData(user.id);
    }
  };


  if (loading) {
    return <div className="p-8 text-center">Loading connections...</div>;
  }

  if (!user) {
    return <div className="p-8 text-center">Please log in to see your connections.</div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* 1. Add Connection Card */}
      <Card className="bg-card/60 backdrop-blur border border-white/10">
        <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-2xl flex items-center gap-3">
            Add Connection
            <span className="text-sm font-normal text-muted-foreground hidden md:inline">You can add other users by their unique username.</span>
          </CardTitle>
          <CardDescription className="md:hidden">You can add other users by their unique username.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search username…"
                className="w-full pr-12"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
              />
              {/* Filter toggle */}
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-md hover:bg-foreground/10"
                title="Same university"
                onClick={() => setSameUniversityOnly((v) => !v)}
              >
                {sameUniversityOnly ? 'Uni✓' : 'Uni'}
              </button>
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-md border bg-card/95 backdrop-blur shadow-lg">
                  {suggestions.map((s) => (
                    <button key={s.id} type="button" className="w-full text-left px-3 py-2 hover:bg-muted" onClick={() => setUsernameInput(s.username)}>
                      {s.full_name || s.username} <span className="text-xs text-muted-foreground">@{s.username}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" onClick={handleSendRequest}>
              <UserPlus className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Tabs for Connections and Requests */}
      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mx-auto">
          <TabsTrigger value="connections">
            <UserCheck className="mr-2 h-4 w-4" /> Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="mr-2 h-4 w-4" /> Requests ({incomingRequests.length + outgoingRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Current Connections Tab */}
        <TabsContent value="connections">
          <Card className="bg-card/60 backdrop-blur border border-white/10">
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>
                Users you are currently connected with.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 min-h-64 p-6">
              {connections.length > 0 ? (
                connections.map((conn) => {
                  const otherUser = conn.requester_id === user.id ? conn.addressee : conn.requester;
                  return (
                    <div key={conn.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${otherUser.username}.png`} />
                          <AvatarFallback>{otherUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{otherUser.full_name || otherUser.username}</p>
                          <p className="text-sm text-muted-foreground">@{otherUser.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/profile/id/${otherUser.id}`}>See Profile</a>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/report?type=user&id=${otherUser.id}`}>🚩</a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteRequest(conn.id, 'remove')}>
                          <X className="mr-2 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center">
                  You haven't added any connections yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Incoming Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>
                  Users who want to connect with you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 min-h-40 p-6">
                {incomingRequests.length > 0 ? (
                  incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${req.requester.username}.png`} />
                          <AvatarFallback>{req.requester.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{req.requester.full_name || req.requester.username}</p>
                          <p className="text-sm text-muted-foreground">@{req.requester.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateRequest(req.id, 'accepted')}>
                          <UserCheck className="h-5 w-5 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateRequest(req.id, 'declined')}>
                          <X className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    No incoming requests.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Outgoing Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Requests</CardTitle>
                <CardDescription>
                  Users you've sent connection requests to.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 min-h-40 p-6">
                {outgoingRequests.length > 0 ? (
                  outgoingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={`https://avatar.vercel.sh/${req.addressee.username}.png`} />
                          <AvatarFallback>{req.addressee.username?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{req.addressee.full_name || req.addressee.username}</p>
                          <p className="text-sm text-muted-foreground">@{req.addressee.username}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteRequest(req.id, 'cancel')}>
                        Cancel Request
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center">
                    You have no pending outgoing requests.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

