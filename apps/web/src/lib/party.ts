import type { Party, PartyMember } from "@/app/(main)/dashboard/types";

const getJoinedMembers = (members?: PartyMember[]): PartyMember[] => {
    if (!Array.isArray(members)) {
        return [];
    }
    return members.filter((member) => member.status === "joined");
};

const hostIncluded = (hostId: string, members: PartyMember[]): boolean => {
    return members.some((member) => member.user_id === hostId);
};

export const getPartyOccupancy = (party: Party, membersOverride?: PartyMember[]): number => {
    const effectiveMembers = getJoinedMembers(membersOverride ?? party.members);
    if (effectiveMembers.length > 0) {
        return hostIncluded(party.host_id, effectiveMembers)
            ? effectiveMembers.length
            : effectiveMembers.length + 1;
    }
    const count = typeof party.current_member_count === "number" ? party.current_member_count : 0;
    return Math.max(count, 0) + 1;
};

export const getRemainingSlots = (party: Party, membersOverride?: PartyMember[]): number => {
    const occupancy = getPartyOccupancy(party, membersOverride);
    return Math.max(0, party.party_size - occupancy);
};
