"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Party, useParties } from "@/context/PartyContext";
import { Clock, Users, MapPin, User as UserIcon, Bell, BellOff, Share2, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Helper function to format remaining time as MM:SS
const formatTimeLeft = (ms: number): string => {
    // Ensure we don't show negative numbers
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

interface PartyCardProps {
  party: Party;
}

export default function PartyCard({ party }: PartyCardProps) {
    const { cancelParty } = useParties();
    const isHost = party.host === 'You';
    const [timeLeft, setTimeLeft] = useState(party.expiryTimestamp - Date.now());
    const [alertOn, setAlertOn] = useState<boolean>(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(party.expiryTimestamp - Date.now());
        }, 1000); // Update every second
        // Cleanup to prevent memory leaks
        return () => clearInterval(timer);
    }, [party.expiryTimestamp]);

    // Load persisted alert state from localStorage
    useEffect(() => {
        try {
            const alerts = JSON.parse(localStorage.getItem("party_alerts") || "[]") as number[];
            setAlertOn(alerts.includes(party.id));
        } catch {}
    }, [party.id]);

    const toggleAlert = () => {
        try {
            const alerts = new Set<number>(JSON.parse(localStorage.getItem("party_alerts") || "[]"));
            if (alerts.has(party.id)) {
                alerts.delete(party.id);
                setAlertOn(false);
            } else {
                alerts.add(party.id);
                setAlertOn(true);
            }
            localStorage.setItem("party_alerts", JSON.stringify(Array.from(alerts)));
        } catch {}
    };

    const seatsLeft = useMemo(() => party.partySize, [party.partySize]);
    const recommended = useMemo(() => {
        // Simple heuristic: recommend if rideOptions include common modes
        return (party.rideOptions || []).some((m) => ["auto", "bike", "bus"].includes(m.toLowerCase()));
    }, [party.rideOptions]);

    // When the timer hits zero, the card will simply disappear from the list.
    if (timeLeft <= 0) return null; 

    return (
                <Card className="flex flex-col justify-between w-full shadow-md border rounded-xl overflow-hidden">
            <div>
                        <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="text-sm font-semibold">
                                                {party.host?.slice(0,1).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <CardTitle className="text-2xl font-bold leading-tight">{party.meetupPoint}</CardTitle>
                                                {recommended && (
                                                    <span className="text-xs font-semibold bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded-full">Recommended</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <span>Hosted by <span className="font-medium text-foreground">{party.host}</span></span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5"/>4.9</span>
                                                <span>•</span>
                                                <span>0 mutual connections</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" onClick={toggleAlert} aria-label="Toggle alerts">
                                            {alertOn ? <Bell className="w-4 h-4"/> : <BellOff className="w-4 h-4"/>}
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => navigator.share?.({ title: 'Ride', text: `${party.meetupPoint} → ${party.dropOff}` }).catch(()=>{})} aria-label="Share">
                                            <Share2 className="w-4 h-4"/>
                                        </Button>
                                    </div>
                                </div>
                        </CardHeader>

            <CardContent className="pt-0">
                                <div className="mb-3 flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-3"/>
                <span className="font-semibold">{party.dropOff}</span>
                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {party.rideOptions?.map((opt) => (
                                        <span key={opt} className="text-xs font-semibold bg-secondary px-2 py-1 rounded-full">
                                            {opt}
                                        </span>
                                    ))}
                                    {party.isFriendsOnly && (
                                        <span className="flex items-center text-xs font-semibold bg-secondary px-2 py-1 rounded-full">
                                            <UserIcon className="w-4 h-4 mr-1"/>Friends
                                        </span>
                                    )}
                                    {party.displayUniversity && party.hostUniversity && (
                                        <span className="text-xs font-semibold bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full">
                                            {party.hostUniversity}
                                        </span>
                                    )}
                                    <span className="text-xs font-semibold bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                                        Seats left: {seatsLeft}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 items-center">
                <div className="flex flex-col space-y-3 justify-center">
                                        <div className="flex items-center">
                                            <Users className="w-6 h-6 mr-3"/>
                                            <span className="text-base font-medium">
                                                    Looking for {party.partySize} {party.partySize === 1 ? 'person' : 'people'}
                                            </span>
                                        </div>
                </div>

                <div className="flex items-center justify-center bg-destructive/10 text-destructive rounded-lg p-4 h-full">
                    <Clock className="w-6 h-6 mr-3"/>
                    <span className="text-2xl font-mono font-bold tracking-wider">{formatTimeLeft(timeLeft)}</span>
                </div>
                </div>
            </CardContent>
            </div>
            
                        <CardFooter className="flex justify-between items-center bg-muted/70 border-t mt-6">
                            <div className="text-xs text-muted-foreground">
                                Tip: Turn on alerts to get notified when seats update.
                            </div>
                            <div className="flex gap-2">
                                {isHost ? (
                                    <Button variant="destructive" onClick={() => cancelParty(party.id)}>
                                        Cancel Party
                                    </Button>
                                ) : (
                                    <Button>
                                        Request to Join
                                    </Button>
                                )}
                            </div>
            </CardFooter>
        </Card>
    );
}