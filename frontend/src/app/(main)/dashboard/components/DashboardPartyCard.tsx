"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Party } from "../types";
import { Clock, Users, MapPin, User as UserIcon, Bell, BellOff, Share2, Star, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useAuthStore from "@/stores/authStore";
import useDashboardDataStore from "@/stores/dashboardDataStore";
import { createClient } from "@/utils/supabase/client";
import { partyMemberService } from "../services/partyMemberService";
import PartyMembersDialog from "./PartyMembersDialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

import dynamic from "next/dynamic";
// Dynamically import RideMap to avoid SSR issues
const RideMap = dynamic(() => import("@/components/RideMap"), { ssr: false });
import { supabase } from '@/lib/supabaseClient';

interface DashboardPartyCardProps {
    party: Party;
}

const EXPIRY_OPTIONS = [
    { label: "10 min", minutes: 10 },
    { label: "15 min", minutes: 15 },
    { label: "20 min", minutes: 20 },
    { label: "30 min", minutes: 30 },
    { label: "1 hr", minutes: 60 },
];

// Helper function to format remaining time as MM:SS
const formatTimeLeft = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function DashboardPartyCard({ party }: DashboardPartyCardProps) {
    const refreshParties = useDashboardDataStore((state) => state.refreshParties);
    const [editingExpiry, setEditingExpiry] = useState(false);
    const [newExpiryMinutes, setNewExpiryMinutes] = useState<number | null>(null);
    const [updatingExpiry, setUpdatingExpiry] = useState(false);
    const [showProfileDialog, setShowProfileDialog] = useState(false);

    // Update expiry handler
    const handleUpdateExpiry = async () => {
        if (!newExpiryMinutes || !user) return;
        setUpdatingExpiry(true);
        try {
            const newExpiryTimestamp = new Date(Date.now() + newExpiryMinutes * 60_000).toISOString();
            const supabase = createClient();
            const { error } = await supabase
                .from('parties')
                .update({
                    duration_minutes: newExpiryMinutes,
                    expires_at: newExpiryTimestamp
                })
                .eq('id', party.id)
                .eq('host_id', user.id);
            if (error) {
                toast.error('Failed to update expiry');
            } else {
                toast.success('Expiry updated!');
                setEditingExpiry(false);
                setNewExpiryMinutes(null);
                await refreshParties();
            }
        } catch (e) {
            toast.error('Unexpected error updating expiry');
        } finally {
            setUpdatingExpiry(false);
        }
    };
    // Helper to get the base URL (works for both dev and prod)
    const getBaseUrl = () => {
        if (typeof window !== 'undefined') {
            return window.location.origin;
        }
        return '';
    };

    // Share handler
    const handleShareParty = async () => {
        const shareUrl = `${getBaseUrl()}/party/${party.id}`;
        const shareText = `Join my party on Meet Riders!\n${shareUrl}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my party on Meet Riders!',
                    text: 'Check out this party I created. Click to join!',
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Party link copied to clipboard!');
            } catch (err) {
                toast.error('Failed to copy link.');
            }
        } else {
            // fallback: prompt
            window.prompt('Copy this link:', shareUrl);
        }
    };
    const { user } = useAuthStore();
    const isHost = party.host_id === user?.id;
    const [timeLeft, setTimeLeft] = useState(party.expires_at.getTime() - Date.now());
    const [alertOn, setAlertOn] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    // Overlay removed; redirect instead
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(party.expires_at.getTime() - Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [party.expires_at]);

    const isExpired = timeLeft <= 0 || !party.is_active;

    const handleJoinParty = async () => {
        if (!user || isHost || party.user_is_member) return;

        setIsJoining(true);
        try {
            if (party.is_friends_only) {
                // If there's already a pending request, avoid duplicates
                const { data: existing } = await supabase
                  .from('party_requests')
                  .select('id, status')
                  .eq('party_id', party.id)
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false })
                  .limit(1);
                if (existing && existing.length && existing[0].status === 'pending') {
                    toast.info('Join request already pending');
                    return;
                }
                // Request-based join flow: create a pending request and do not join yet
                const { error } = await supabase
                    .from('party_requests')
                    .insert([{ party_id: party.id, user_id: user.id, status: 'pending' }]);
                if (error) {
                    console.error('Error creating party request:', error);
                    toast.error('Failed to send join request');
                } else {
                    toast.success('Request sent to host');
                }
            } else {
                // Public party: join immediately
                const result = await partyMemberService.joinParty(party.id);
                if (result.success) {
                    toast.success(`Joined party to ${party.drop_off}`);
                    router.push('/current-party');
                } else {
                    toast.error(result.error || 'Failed to join party');
                }
            }
        } catch (error) {
            console.error('Error joining party:', error);
            toast.error('Unexpected error while joining the party');
        } finally {
            setIsJoining(false);
        }
    };

    const handleLeaveParty = async () => {
        if (!user || !party.user_is_member) return;
        
        const confirmed = confirm('Are you sure you want to leave this party?');
        if (!confirmed) return;

        setIsLeaving(true);
        try {
            const result = await partyMemberService.leaveParty(party.id);
            
            if (result.success) {
                toast.success('Left the party');
                // Trigger refresh of parties data
                await refreshParties();
            } else {
                toast.error(result.error || 'Failed to leave party');
            }
        } catch (error) {
            console.error('Error leaving party:', error);
            toast.error('Unexpected error while leaving the party');
        } finally {
            setIsLeaving(false);
        }
    };

    const handleCancelParty = async () => {
        if (!user || !isHost) return;

        const confirmed = confirm('Are you sure you want to cancel this party?');
        if (!confirmed) return;

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('parties')
                .update({ is_active: false })
                .eq('id', party.id)
                .eq('host_id', user.id);

            if (error) {
                console.error('Error canceling party:', error);
                toast.error('Failed to cancel party');
            } else {
                toast.success('Party canceled');
                await refreshParties();
            }
        } catch (error) {
            console.error('Error canceling party:', error);
            toast.error('Failed to cancel party');
        }
    };

    const getRideOptionsDisplay = () => {
        if (!party.ride_options || party.ride_options.length === 0) {
            return 'Any ride';
        }
        return party.ride_options.join(', ');
    };

    const getHostDisplayName = () => {
        if (isHost) {
            return 'Your Party';
        }
        
        const profile = party.host_profile;
        if (!profile) {
            return 'Anonymous Host';
        }
        
        return profile.nickname || profile.full_name || 'Anonymous Host';
    };

    const getHostInitials = () => {
        if (isHost) {
            return 'ME';
        }
        
        const profile = party.host_profile;
        if (!profile) {
            return 'H';
        }
        
        const name = profile.nickname || profile.full_name;
        if (!name) {
            return 'H';
        }
        
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    return (
        <div className="transition-all rounded-lg duration-300 hover:shadow-lg relative overflow-hidden bg-card/60 backdrop-blur-[6.2px]" 
              style={{
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <CardHeader className='hidden'></CardHeader>
            <div className="p-3">
                {/* Host Profile Popup Dialog */}
                {showProfileDialog && party.host_profile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full relative">
                            <button className="absolute top-2 right-2 text-xl" onClick={() => setShowProfileDialog(false)}>&times;</button>
                            <div className="flex flex-col items-center gap-2">
                                <Avatar className="w-20 h-20">
                                    {party.host_profile.avatar_url ? (
                                        <Image src={party.host_profile.avatar_url} alt="Host avatar" width={80} height={80} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                                            {getHostInitials()}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <h2 className="text-xl font-bold mt-2">{party.host_profile.nickname || party.host_profile.full_name || 'Anonymous Host'}</h2>
                                {party.host_profile.university && (
                                    <div className="text-sm text-muted-foreground">{party.host_profile.university}</div>
                                )}
                                {party.host_profile.gender && (
                                    <div className="text-sm text-muted-foreground">Gender: {party.host_profile.gender}</div>
                                )}
                                {party.host_profile.points !== null && party.host_profile.points !== undefined && (
                                    <div className="text-sm text-muted-foreground">Points: {party.host_profile.points}</div>
                                )}
                                {party.host_profile.bio && (
                                    <div className="text-sm text-muted-foreground mt-2 text-center">{party.host_profile.bio}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Grid Layout: Left Column (Host Info) + Right Column (Party Details) */}
                <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-3">
                    {/* Left Column: Host Info */}
                    <div className="flex lg:flex-col items-center lg:items-center gap-2 lg:gap-1.5">
                        <button onClick={() => setShowProfileDialog(true)} className="focus:outline-none flex-shrink-0">
                            <Avatar className="w-12 h-12 lg:w-14 lg:h-14">
                                {party.host_profile?.avatar_url ? (
                                    <Image
                                        src={party.host_profile.avatar_url} 
                                        alt="Host avatar" 
                                        width={56}
                                        height={56}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                        {getHostInitials()}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                        </button>
                        
                        <div className="flex-1 lg:flex-none lg:w-full text-left lg:text-center space-y-0.5">
                            <div className="flex lg:flex-col items-center lg:items-center gap-1.5 lg:gap-0.5">
                                <h3 className="font-bold text-sm truncate max-w-full">
                                    {getHostDisplayName()}
                                </h3>
                                {isExpired && (
                                    <span className="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                                        EXPIRED
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-muted-foreground space-y-0">
                                {party.host_profile?.gender && (
                                    <div className="capitalize">{party.host_profile.gender}</div>
                                )}
                                {party.host_profile?.points !== null && party.host_profile?.points !== undefined && (
                                    <div className="text-primary font-medium">
                                        {party.host_profile.points} pts
                                    </div>
                                )}
                                {party.host_profile?.university && party.display_university && (
                                    <div className="flex items-center gap-1 lg:justify-center">
                                        <Star className="w-3 h-3 flex-shrink-0" />
                                        <span className="text-xs truncate">{party.host_profile.university}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Party Details */}
                    <div className="space-y-2.5 min-w-0">
                        {/* Timer and Route in one row for desktop */}
                        <div className="flex flex-col sm:flex-row gap-2">
                            {/* Route Info */}
                            <div className="flex-1 min-w-0 bg-muted/30 rounded-lg p-2">
                                <div className="flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0 text-xs space-y-0.5">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">From:</span>
                                            <span className="truncate flex-1">{party.meetup_point}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[11px] text-muted-foreground font-medium flex-shrink-0">To:</span>
                                            <span className="truncate font-semibold flex-1">{party.drop_off}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Timer */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:w-[90px] flex-shrink-0">
                                <div className="flex items-center gap-0.5">
                                    <div className="text-lg sm:text-xl font-bold text-primary tabular-nums">
                                        {isExpired ? '--:--' : formatTimeLeft(timeLeft)}
                                    </div>
                                    {isHost && !isExpired && (
                                        <button
                                            className="p-0.5 rounded hover:bg-accent/40 transition-colors"
                                            title="Edit expiry time"
                                            onClick={() => setEditingExpiry((v) => !v)}
                                        >
                                            <Pencil className="w-3 h-3 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>
                                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {isExpired ? 'Ended' : 'Remaining'}
                                </div>
                            </div>
                        </div>
                        
                        {/* Expiry Editor */}
                        {isHost && !isExpired && editingExpiry && (
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
                                <select
                                    className="border rounded px-3 py-1.5 text-sm"
                                    value={newExpiryMinutes ?? ""}
                                    onChange={e => setNewExpiryMinutes(e.target.value ? Number(e.target.value) : null)}
                                >
                                    <option value="">Select new expiry</option>
                                    {EXPIRY_OPTIONS.map(opt => (
                                        <option key={opt.minutes} value={opt.minutes}>{opt.label}</option>
                                    ))}
                                </select>
                                <Button size="sm" disabled={updatingExpiry || !newExpiryMinutes} onClick={handleUpdateExpiry}>
                                    {updatingExpiry ? 'Updating...' : 'Save'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingExpiry(false)}>Cancel</Button>
                            </div>
                        )}

                        {/* Map (conditionally shown) */}
                        {party.start_coords && party.dest_coords && (
                            <div className="rounded-lg overflow-hidden">
                                <RideMap start={party.start_coords} dest={party.dest_coords} height={140} />
                            </div>
                        )}
                        
                        {/* Host Comments */}
                        {party.user_is_member && party.host_comments && (
                            <div className="p-2 bg-accent/40 rounded-lg border border-accent">
                                <p className="font-semibold text-[11px] mb-0.5">Host Comments</p>
                                <p className="text-xs whitespace-pre-line">{party.host_comments}</p>
                            </div>
                        )}

                        {/* Bottom Row: Details + Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t">
                            <div className="flex items-center gap-3 text-xs">
                                <PartyMembersDialog party={party}>
                                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="font-medium">
                                            {(party.current_member_count || 0) + 1}/{party.party_size}
                                        </span>
                                    </button>
                                </PartyMembersDialog>
                                
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[11px]">{getRideOptionsDisplay()}</span>
                                </div>
                                
                                {party.is_friends_only && (
                                    <div className="bg-accent/70 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                        🔒 Connections
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5">
                                {isHost ? (
                                    <>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={handleCancelParty}
                                            className="h-8 text-xs"
                                        >
                                            Cancel Party
                                        </Button>
                                        <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleShareParty}>
                                            <Share2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {party.user_is_member ? (
                                            <Button 
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLeaveParty}
                                                disabled={isLeaving}
                                                className="h-8 text-xs"
                                            >
                                                {isLeaving ? 'Leaving...' : 'Leave Party'}
                                            </Button>
                                        ) : (
                                            <Button 
                                                size="sm"
                                                onClick={handleJoinParty}
                                                disabled={isExpired || isJoining || (party.current_member_count || 0) >= party.party_size}
                                                className="h-8 text-xs"
                                                variant={isExpired || (party.current_member_count || 0) >= party.party_size ? "outline" : "default"}
                                            >
                                                {isJoining 
                                                    ? 'Joining...' 
                                                    : isExpired 
                                                    ? 'Expired' 
                                                    : (party.current_member_count || 0) >= party.party_size 
                                                    ? 'Full' 
                                                    : 'Join Party'
                                                }
                                            </Button>
                                        )}
                                        <Button 
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAlertOn(!alertOn)}
                                            className="h-8 px-2"
                                        >
                                            {alertOn ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
