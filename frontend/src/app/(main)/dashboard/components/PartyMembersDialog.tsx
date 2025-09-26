"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Crown } from 'lucide-react';
import { Party, PartyMember } from "../types";
import { toast } from "sonner";
import { partyMemberService } from "../services/partyMemberService";
import { useAuth } from "@/context/Authcontext";

interface PartyMembersDialogProps {
  party: Party;
  children: React.ReactNode;
}

export default function PartyMembersDialog({ party, children }: PartyMembersDialogProps) {
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isHost = user?.id === party.host_id;

  const fetchMembers = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      // Only host or joined members should fetch the list to respect RLS
      if (!isHost && !party.user_is_member) {
        setMembers([]);
        return;
      }
      const result = await partyMemberService.getPartyMembers(party.id);
      if (result.success && result.members) {
        setMembers(result.members);
      } else if (!result.success) {
        toast.error(result.error || 'Failed to fetch party members');
      }
    } catch (error) {
      console.error('Error fetching party members:', error);
      toast.error('Failed to fetch party members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, party.id]);

  const getDisplayName = (member: PartyMember) => {
    const profile = member.profile;
    if (!profile) return 'Anonymous Member';
    return profile.nickname || profile.full_name || 'Anonymous Member';
  };

  const getInitials = (member: PartyMember) => {
    const profile = member.profile;
    if (!profile) return 'M';
    
    const name = profile.nickname || profile.full_name;
    if (!name) return 'M';
    
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const formatJoinTime = (joinedAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - joinedAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just joined';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
        

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Party Members ({(party.current_member_count || 0) + 1}/{party.party_size})
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {/* Host */}
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Avatar className="w-10 h-10">
              {party.host_profile?.avatar_url ? (
                <img 
                  src={party.host_profile.avatar_url} 
                  alt="Host avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {party.host_profile?.nickname?.charAt(0).toUpperCase() || 
                   party.host_profile?.full_name?.charAt(0).toUpperCase() || 'H'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate">
                  {party.host_profile?.nickname || 
                   party.host_profile?.full_name || 
                   'Anonymous Host'}
                </p>
                <Crown className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground">Host</p>
            </div>
            {party.host_profile?.points !== null && party.host_profile?.points !== undefined && (
              <div className="text-xs text-primary font-medium">
                {party.host_profile.points} pts
              </div>
            )}
          </div>

          {/* Members */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (!isHost && !party.user_is_member) ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Join this party to see the member list</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No other members yet</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <Avatar className="w-10 h-10">
                  {member.profile?.avatar_url ? (
                    <img 
                      src={member.profile.avatar_url} 
                      alt="Member avatar" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-secondary/20 text-secondary-foreground font-semibold">
                      {getInitials(member)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {getDisplayName(member)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatJoinTime(member.joined_at)}
                  </p>
                </div>
                {member.profile?.points !== null && member.profile?.points !== undefined && (
                  <div className="text-xs text-primary font-medium">
                    {member.profile.points} pts
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
