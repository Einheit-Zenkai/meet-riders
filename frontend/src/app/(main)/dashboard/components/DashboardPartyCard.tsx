"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Party } from "../types";
import { Clock, Users, MapPin, User as UserIcon, Bell, BellOff, Share2, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/Authcontext";
import { createClient } from "@/utils/supabase/client";

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
    const { user } = useAuth();
    const isHost = party.host_id === user?.id;
    const [timeLeft, setTimeLeft] = useState(party.expiry_timestamp.getTime() - Date.now());
    const [alertOn, setAlertOn] = useState<boolean>(false);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(party.expiry_timestamp.getTime() - Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [party.expiry_timestamp]);

    const isExpired = timeLeft <= 0;

    const handleJoinParty = async () => {
        if (!user) return;
        
        setIsJoining(true);
        try {
            // Here you would implement the join party logic
            // For now, just show an alert
            alert(`Joining party to ${party.drop_off}!`);
        } catch (error) {
            console.error('Error joining party:', error);
        } finally {
            setIsJoining(false);
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
                alert('Failed to cancel party');
            } else {
                alert('Party canceled successfully');
                onPartyUpdate?.();
            }
        } catch (error) {
            console.error('Error canceling party:', error);
            alert('Failed to cancel party');
        }
    };

    const getRideOptionsDisplay = () => {
        if (!party.ride_options || party.ride_options.length === 0) {
            return 'Any ride';
        }
        return party.ride_options.join(', ');
    };

    return (
        <Card className={`transition-all duration-300 hover:shadow-lg ${isExpired ? 'opacity-60 grayscale' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {isHost ? 'ME' : 'H'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">
                                {isHost ? 'Your Party' : 'Available Party'}
                            </CardTitle>
                            {party.host_university && party.display_university && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {party.host_university}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className={`text-sm font-medium ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                            {isExpired ? 'EXPIRED' : formatTimeLeft(timeLeft)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {isExpired ? 'Party ended' : 'remaining'}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <span className="font-medium">From:</span> {party.meetup_point}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                        <span className="font-medium">To:</span> {party.drop_off}
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>Max {party.party_size} people</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{getRideOptionsDisplay()}</span>
                    </div>
                </div>

                {party.is_friends_only && (
                    <div className="bg-accent/50 px-2 py-1 rounded text-xs">
                        🔒 Friends only
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3 flex gap-2">
                {isHost ? (
                    <>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={handleCancelParty}
                            className="flex-1"
                        >
                            Cancel Party
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </>
                ) : (
                    <>
                        <Button 
                            onClick={handleJoinParty}
                            disabled={isExpired || isJoining}
                            className="flex-1"
                            size="sm"
                        >
                            {isJoining ? 'Joining...' : isExpired ? 'Expired' : 'Join Party'}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setAlertOn(!alertOn)}
                        >
                            {alertOn ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    );
}
