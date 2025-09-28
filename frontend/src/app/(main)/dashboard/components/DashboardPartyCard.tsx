"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Party } from "../types";
import { Clock, Users, MapPin, User as UserIcon, Bell, BellOff, Share2, Star, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/Authcontext";
import { createClient } from "@/utils/supabase/client";
import { partyMemberService } from "../services/partyMemberService";
import PartyMembersDialog from "./PartyMembersDialog";
import PartyJoinedOverlay from "./PartyJoinedOverlay";

// Helper function to format remaining time as MM:SS
const formatTimeLeft = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface DashboardPartyCardProps {
  party: Party;
  onPartyUpdate?: () => void;
}

export default function DashboardPartyCard({ party, onPartyUpdate }: DashboardPartyCardProps) {
    const [editingExpiry, setEditingExpiry] = useState(false);
    const [newExpiry, setNewExpiry] = useState<string>("");
    const [updatingExpiry, setUpdatingExpiry] = useState(false);

    // Expiry options (same as creation)
    const expiryOptions = ["10 min", "15 min", "20 min", "30 min", "1 hr"];

    // Update expiry handler
    const handleUpdateExpiry = async () => {
        if (!newExpiry) return;
        setUpdatingExpiry(true);
        try {
            // Calculate new expiry timestamp
            const now = new Date();
            const minutes = newExpiry.includes('hr')
                ? parseInt(newExpiry) * 60
                : parseInt(newExpiry);
            now.setMinutes(now.getMinutes() + minutes);
            const newExpiryTimestamp = now.toISOString();
            const supabase = createClient();
            const { error } = await supabase
                .from('parties')
                .update({
                    expires_in: newExpiry,
                    expiry_timestamp: newExpiryTimestamp
                })
                .eq('id', party.id)
                .eq('host_id', user.id);
            if (error) {
                toast.error('Failed to update expiry');
            } else {
                toast.success('Expiry updated!');
                setEditingExpiry(false);
                setNewExpiry("");
                onPartyUpdate?.();
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
    const { user } = useAuth();
    const isHost = party.host_id === user?.id;
    const [timeLeft, setTimeLeft] = useState(party.expiry_timestamp.getTime() - Date.now());
    const [alertOn, setAlertOn] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showJoinedOverlay, setShowJoinedOverlay] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(party.expiry_timestamp.getTime() - Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [party.expiry_timestamp]);

    const isExpired = timeLeft <= 0;

    const handleJoinParty = async () => {
        if (!user || isHost || party.user_is_member) return;
        
        setIsJoining(true);
        try {
            const result = await partyMemberService.joinParty(party.id);
            
            if (result.success) {
                // Show success message
                toast.success(`Joined party to ${party.drop_off}`);
                setShowJoinedOverlay(true);
                // Trigger refresh of parties data
                onPartyUpdate?.();
            } else {
                toast.error(result.error || 'Failed to join party');
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
                onPartyUpdate?.();
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
                onPartyUpdate?.();
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
        <Card className="transition-all duration-300 hover:shadow-lg relative overflow-hidden bg-card/60 backdrop-blur-[6.2px]" 
              style={{
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
            {showJoinedOverlay && (
                <PartyJoinedOverlay 
                    party={party} 
                    onClose={() => setShowJoinedOverlay(false)} 
                    onAfterLeave={onPartyUpdate}
                />
            )}
            <div className="p-6">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                            {party.host_profile?.avatar_url ? (
                                <img 
                                    src={party.host_profile.avatar_url} 
                                    alt="Host avatar" 
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                                    {getHostInitials()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg leading-relaxed">
                                    {getHostDisplayName()}
                                </h3>
                                {isExpired && (
                                    <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs font-medium">
                                        EXPIRED
                                    </span>
                                )}
                            </div>
                            {/* Host info in one compact line */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground leading-relaxed">
                                {party.host_profile?.gender && (
                                    <span className="capitalize">{party.host_profile.gender}</span>
                                )}
                                {party.host_profile?.points !== null && party.host_profile?.points !== undefined && (
                                    <>
                                        {party.host_profile?.gender && <span>•</span>}
                                        <span className="text-primary font-medium">
                                            {party.host_profile.points} pts
                                        </span>
                                    </>
                                )}
                                {party.host_profile?.university && party.display_university && (
                                    <>
                                        {(party.host_profile?.gender || party.host_profile?.points !== null) && <span>•</span>}
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3" />
                                            <span>{party.host_profile.university}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Timer with edit icon for host */}
                    <div className="text-right px-2 flex flex-col items-end">
                        <div className="flex items-center gap-1">
                            <div className="text-base font-bold text-primary leading-relaxed">
                                        {isExpired ? '--:--' : formatTimeLeft(timeLeft)}
                            </div>
                            {isHost && !isExpired && (
                                <button
                                    className="ml-1 p-1 rounded hover:bg-accent/40 transition-colors"
                                    title="Edit expiry time"
                                    aria-label="Edit expiry time"
                                    onClick={() => setEditingExpiry((v) => !v)}
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            {isExpired ? 'ended' : 'left'}
                        </div>
                        {isHost && !isExpired && editingExpiry && (
                            <div className="flex items-center gap-2 mt-2">
                                <select
                                    className="border rounded px-2 py-1"
                                    value={newExpiry}
                                    onChange={e => setNewExpiry(e.target.value)}
                                >
                                    <option value="">Select expiry</option>
                                    {expiryOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <Button size="sm" disabled={updatingExpiry || !newExpiry} onClick={handleUpdateExpiry}>
                                    {updatingExpiry ? 'Updating...' : 'Save'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingExpiry(false)}>Cancel</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Route Info - More Compact */}
                <div className="space-y-3 mb-5 px-1">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        <div className="min-w-0 flex-1 text-base">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-muted-foreground">From:</span>
                                <span className="truncate leading-relaxed">{party.meetup_point}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-muted-foreground">To:</span>
                                <span className="truncate font-medium leading-relaxed">{party.drop_off}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Row */}
                <div className="flex items-center justify-between text-base mb-5 px-1">
                    <div className="flex items-center gap-4">
                        <PartyMembersDialog party={party}>
                            <button className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <span className="leading-relaxed">
                                    {(party.current_member_count || 0) + 1}/{party.party_size}
                                </span>
                            </button>
                        </PartyMembersDialog>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <span className="text-sm leading-relaxed">{getRideOptionsDisplay()}</span>
                        </div>
                    </div>
                    
                    {party.is_friends_only && (
                        <div className="bg-accent/70 px-3 py-1.5 rounded text-xs font-medium">
                            🔒 Friends only
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 px-1">
                    {isHost ? (
                        <>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={handleCancelParty}
                                className="flex-1 h-10 font-medium"
                            >
                                Cancel Party
                            </Button>
                            <Button variant="outline" size="sm" className="h-10 px-3" onClick={handleShareParty}>
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </>
                    ) : (
                        <>
                            {party.user_is_member ? (
                                <Button 
                                    variant="outline"
                                    onClick={handleLeaveParty}
                                    disabled={isLeaving}
                                    className="flex-1 h-10 font-medium"
                                    size="sm"
                                >
                                    {isLeaving ? 'Leaving...' : 'Leave Party'}
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleJoinParty}
                                    disabled={isExpired || isJoining || (party.current_member_count || 0) >= party.party_size}
                                    className="flex-1 h-10 font-medium"
                                    size="sm"
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
                                className="h-10 px-3"
                            >
                                {alertOn ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
