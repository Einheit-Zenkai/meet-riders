'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Party, useParties } from "@/context/PartyContext";
import { Clock, Users, MapPin, Shield, User as UserIcon } from 'lucide-react';

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

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(party.expiryTimestamp - Date.now());
        }, 1000); // Update every second
        // Cleanup to prevent memory leaks
        return () => clearInterval(timer);
    }, [party.expiryTimestamp]);

    // When the timer hits zero, the card will simply disappear from the list.
    if (timeLeft <= 0) return null; 

    return (
        <Card className="flex flex-col justify-between w-full shadow-md border rounded-xl overflow-hidden">
            <div>
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold">{party.meetupPoint}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 ml-4 flex-shrink-0">Hosted by: {party.host}</p>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="mb-6 flex items-center text-lg">
                <MapPin className="w-5 h-5 mr-3"/>
                <span className="font-semibold">{party.dropOff}</span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 items-center">
                <div className="flex flex-col space-y-3 justify-center">
                    <div className="flex items-center">
                    <Users className="w-6 h-6 mr-3"/>
                    <span className="text-base font-medium">
                        {party.partySize} {party.partySize === 1 ? 'person' : 'people'} needed
                    </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                    {party.isFriendsOnly && (
                        <span className="flex items-center text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full">
                        <UserIcon className="w-4 h-4 mr-1.5"/>Friends
                        </span>
                    )}
                    {party.isGenderOnly && (
                        <span className="flex items-center text-xs font-semibold bg-secondary px-3 py-1.5 rounded-full">
                        <Shield className="w-4 h-4 mr-1.5"/>Same Gender
                        </span>
                    )}
                    </div>
                </div>

                <div className="flex items-center justify-center bg-destructive/10 text-destructive rounded-lg p-4 h-full">
                    <Clock className="w-6 h-6 mr-3"/>
                    <span className="text-2xl font-mono font-bold tracking-wider">{formatTimeLeft(timeLeft)}</span>
                </div>
                </div>
            </CardContent>
            </div>
            
            <CardFooter className="flex justify-end bg-muted/70 border-t mt-6">
            {isHost ? (
                <Button variant="destructive" onClick={() => cancelParty(party.id)}>
                Cancel Party
                </Button>
            ) : (
                <Button>
                Join Now
                </Button>
            )}
            </CardFooter>
        </Card>
    );
}