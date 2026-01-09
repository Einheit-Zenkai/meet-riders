module.exports = {

"[project]/src/app/(main)/dashboard/services/partyMemberService.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// Service functions for party member operations
__turbopack_context__.s({
    "PartyMemberService": ()=>PartyMemberService,
    "partyMemberService": ()=>partyMemberService
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-ssr] (ecmascript)");
;
class PartyMemberService {
    supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    /**
   * Join a party as the current user
   */ async joinParty(partyId, pickupNotes) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    error: "User not authenticated"
                };
            }
            // Check if user can join the party using our helper function
            const { data: canJoin, error: checkError } = await this.supabase.rpc('can_user_join_party', {
                p_party_id: partyId,
                p_user_id: user.id
            });
            if (checkError) {
                console.error('Error checking join eligibility:', checkError);
                return {
                    success: false,
                    error: "Failed to verify join eligibility"
                };
            }
            if (!canJoin) {
                return {
                    success: false,
                    error: "Cannot join this party (full, expired, or already a member)"
                };
            }
            // Join the party
            const { data: memberRow, error: joinError } = await this.supabase.from('party_members').insert({
                party_id: partyId,
                user_id: user.id,
                status: 'joined',
                pickup_notes: pickupNotes || null,
                contact_shared: false
            }).select().single();
            if (joinError) {
                console.error('Error joining party:', joinError?.message || joinError);
                return {
                    success: false,
                    error: "Failed to join party"
                };
            }
            if (!memberRow) {
                return {
                    success: false,
                    error: "Failed to join party"
                };
            }
            // Fetch the member profile in a follow-up query to avoid relying on implicit FK relationships
            let profile = null;
            const { data: profileRow, error: profileError } = await this.supabase.from('profiles').select('id, full_name, nickname, avatar_url, gender, points, university, show_university, phone_number, show_phone, created_at, updated_at, birth_date').eq('id', memberRow.user_id).single();
            if (profileError) {
                const errMsg = profileError?.message || profileError?.hint || JSON.stringify(profileError);
                console.warn('Joined member profile fetch failed; continuing without profile details:', errMsg);
            } else {
                profile = profileRow;
            }
            // Transform the data to match our PartyMember type
            const transformedMember = {
                ...memberRow,
                joined_at: new Date(memberRow.joined_at),
                left_at: memberRow.left_at ? new Date(memberRow.left_at) : undefined,
                created_at: new Date(memberRow.created_at),
                updated_at: new Date(memberRow.updated_at),
                profile: profile ? {
                    ...profile,
                    created_at: profile.created_at ? new Date(profile.created_at) : null,
                    updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                    birth_date: profile.birth_date ? new Date(profile.birth_date) : null
                } : undefined
            };
            return {
                success: true,
                member: transformedMember
            };
        } catch (error) {
            console.error('Unexpected error joining party:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Leave a party as the current user
   */ async leaveParty(partyId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: false,
                    error: "User not authenticated"
                };
            }
            // Update the member status to 'left'
            const { error } = await this.supabase.from('party_members').update({
                status: 'left',
                left_at: new Date().toISOString()
            }).eq('party_id', partyId).eq('user_id', user.id).eq('status', 'joined');
            if (error) {
                console.error('Error leaving party:', error);
                return {
                    success: false,
                    error: "Failed to leave party"
                };
            }
            return {
                success: true
            };
        } catch (error) {
            console.error('Unexpected error leaving party:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Get party members for a specific party
   */ async getPartyMembers(partyId) {
        try {
            const { data: partyRow, error: partyError } = await this.supabase.from('parties').select('host_id, created_at').eq('id', partyId).maybeSingle();
            if (partyError) {
                console.warn('Error fetching party host while loading members:', partyError);
            }
            const hostId = partyRow?.host_id ?? null;
            const partyCreatedAt = partyRow?.created_at ? new Date(partyRow.created_at) : new Date();
            // 1) Fetch raw members without cross-table joins to avoid RLS/relationship issues
            const { data: memberRows, error: memberErr } = await this.supabase.from('party_members').select('*').eq('party_id', partyId).eq('status', 'joined').order('joined_at', {
                ascending: true
            });
            if (memberErr) {
                const errMsg = memberErr?.message || memberErr?.hint || JSON.stringify(memberErr);
                console.error('Error fetching party members (base rows):', errMsg);
                return {
                    success: false,
                    error: 'Failed to fetch party members'
                };
            }
            const members = memberRows || [];
            const userIds = members.map((m)=>m.user_id).filter(Boolean);
            if (hostId && !userIds.includes(hostId)) {
                userIds.push(hostId);
            }
            // 2) If there are members, fetch their profiles in a second query
            let profilesById = {};
            if (userIds.length > 0) {
                const { data: profiles, error: profileErr } = await this.supabase.from('profiles').select('id, full_name, nickname, avatar_url, gender, points, university, show_university, phone_number, show_phone, created_at, updated_at, birth_date').in('id', userIds);
                if (profileErr) {
                    const errMsg = profileErr?.message || profileErr?.hint || JSON.stringify(profileErr);
                    // If profiles are blocked by RLS, we still return members without profile to avoid hard failure
                    console.warn('Profiles fetch blocked or failed; continuing without profile details:', errMsg);
                } else {
                    profilesById = (profiles || []).reduce((acc, p)=>{
                        acc[p.id] = p;
                        return acc;
                    }, {});
                }
            }
            const transformProfile = (profile)=>{
                if (!profile) return undefined;
                return {
                    ...profile,
                    created_at: profile.created_at ? new Date(profile.created_at) : null,
                    updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                    birth_date: profile.birth_date ? new Date(profile.birth_date) : null
                };
            };
            // 3) Transform and attach profiles when available
            const transformedMembers = members.map((member)=>{
                const profile = profilesById[member.user_id];
                return {
                    ...member,
                    joined_at: new Date(member.joined_at),
                    left_at: member.left_at ? new Date(member.left_at) : undefined,
                    created_at: new Date(member.created_at),
                    updated_at: new Date(member.updated_at),
                    profile: transformProfile(profile)
                };
            });
            if (hostId) {
                const hostAlreadyIncluded = transformedMembers.some((member)=>member.user_id === hostId);
                if (!hostAlreadyIncluded) {
                    const hostProfile = transformProfile(profilesById[hostId]);
                    transformedMembers.unshift({
                        id: `host-${partyId}`,
                        party_id: partyId,
                        user_id: hostId,
                        status: 'joined',
                        joined_at: partyCreatedAt,
                        left_at: undefined,
                        pickup_notes: undefined,
                        contact_shared: false,
                        created_at: partyCreatedAt,
                        updated_at: partyCreatedAt,
                        profile: hostProfile
                    });
                }
            }
            return {
                success: true,
                members: transformedMembers
            };
        } catch (error) {
            console.error('Unexpected error fetching party members:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Get member count for a party
   */ async getPartyMemberCount(partyId) {
        try {
            const { data: count, error } = await this.supabase.rpc('get_party_member_count', {
                p_party_id: partyId
            });
            if (error) {
                console.error('Error getting member count:', error);
                return {
                    success: false,
                    error: "Failed to get member count"
                };
            }
            return {
                success: true,
                count: count || 0
            };
        } catch (error) {
            console.error('Unexpected error getting member count:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /**
   * Check if current user is a member of a party
   */ async isUserMember(partyId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                return {
                    success: true,
                    isMember: false
                };
            }
            const { data: membership, error } = await this.supabase.from('party_members').select('id').eq('party_id', partyId).eq('user_id', user.id).eq('status', 'joined').single();
            if (error && error.code !== 'PGRST116') {
                console.error('Error checking membership:', error);
                return {
                    success: false,
                    error: "Failed to check membership"
                };
            }
            return {
                success: true,
                isMember: !!membership
            };
        } catch (error) {
            console.error('Unexpected error checking membership:', error);
            return {
                success: false,
                error: "An unexpected error occurred"
            };
        }
    }
    /** Host-only: kick a member from a party via RPC */ async kickMember(partyId, memberUserId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: 'Not authenticated'
            };
            // Optional: sanity-check host authorization to avoid confusing RLS errors
            const { data: partyRow, error: partyErr } = await this.supabase.from('parties').select('host_id').eq('id', partyId).single();
            if (partyErr) {
                // Continue; RLS might block this but RPC may still work
                console.warn('kickMember: failed to verify host_id, continuing to RPC:', partyErr?.message || partyErr);
            } else if (partyRow && partyRow.host_id !== user.id) {
                return {
                    success: false,
                    error: 'Only the host can kick members'
                };
            }
            // First try the generic RPC (may be overloaded in DB)
            const { error } = await this.supabase.rpc('kick_party_member', {
                p_party_id: partyId,
                p_member_user_id: memberUserId
            });
            if (!error) return {
                success: true
            };
            const errMsg = error?.message || String(error);
            // Handle ambiguous overload by trying a UUID-specific function if present
            if (errMsg.toLowerCase().includes('choose the best candidate') || errMsg.toLowerCase().includes('ambiguous')) {
                const { error: errUuid } = await this.supabase.rpc('kick_party_member_uuid', {
                    p_party_id: partyId,
                    p_member_user_id: memberUserId
                });
                if (!errUuid) return {
                    success: true
                };
                // Fallback: attempt a direct update if policies allow
                const { error: updErr } = await this.supabase.from('party_members').update({
                    status: 'kicked',
                    left_at: new Date().toISOString()
                }).eq('party_id', partyId).eq('user_id', memberUserId).eq('status', 'joined');
                if (!updErr) return {
                    success: true
                };
                return {
                    success: false,
                    error: errUuid.message || updErr.message || 'Failed to kick member'
                };
            }
            return {
                success: false,
                error: errMsg
            };
        } catch (e) {
            return {
                success: false,
                error: e?.message || 'Failed to kick member'
            };
        }
    }
    /** Fetch pending join requests for parties hosted by the current user */ async getPendingRequestsForHost() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: 'Not authenticated'
            };
            let requests = null;
            let lastError = null;
            let partiesMap = null;
            const rpcVariants = [
                {
                    p_host_id: user.id
                },
                {
                    host_id: user.id
                },
                {
                    p_host_uuid: user.id
                },
                {
                    host_uuid: user.id
                },
                {
                    host: user.id
                },
                {
                    user_id: user.id
                }
            ];
            for (const args of rpcVariants){
                const { data, error } = await this.supabase.rpc('get_pending_requests_for_host', args);
                if (!error) {
                    requests = data || [];
                    lastError = null;
                    break;
                }
                lastError = error;
            }
            if (!requests) {
                const { data, error } = await this.supabase.rpc('get_pending_requests_for_host');
                if (!error) {
                    requests = data || [];
                    lastError = null;
                } else {
                    lastError = error;
                }
            }
            if (!requests && lastError) {
                const nowIso = new Date().toISOString();
                const { data: hostParties, error: partiesErr } = await this.supabase.from('parties').select('id, drop_off, meetup_point, expires_at, is_active').eq('host_id', user.id).eq('is_active', true).gt('expires_at', nowIso);
                if (partiesErr) {
                    console.error('getPendingRequestsForHost: fallback parties error:', partiesErr, 'rpc error:', lastError);
                    return {
                        success: false,
                        error: 'Failed to fetch requests'
                    };
                }
                const partyIds = (hostParties || []).map((p)=>p.id);
                if (partyIds.length === 0) return {
                    success: true,
                    requests: []
                };
                const { data: reqRows, error: reqErr } = await this.supabase.from('party_requests').select('request_id, party_id, user_id, created_at, status').in('party_id', partyIds).eq('status', 'pending').order('created_at', {
                    ascending: true
                });
                if (reqErr) {
                    console.error('getPendingRequestsForHost: fallback requests error:', reqErr, 'rpc error:', lastError);
                    return {
                        success: false,
                        error: 'Failed to fetch requests'
                    };
                }
                requests = reqRows || [];
                partiesMap = (hostParties || []).reduce((acc, p)=>{
                    acc[String(p.id)] = p;
                    return acc;
                }, {});
            }
            const requestsList = requests || [];
            if (requestsList.length === 0) return {
                success: true,
                requests: []
            };
            // 3) Fetch profiles for requesters
            const userIds = [
                ...new Set(requestsList.map((r)=>r.user_id))
            ];
            let profilesMap = {};
            if (userIds.length > 0) {
                const { data: profs } = await this.supabase.from('profiles').select('id, full_name, nickname, avatar_url, gender, university, show_university, points').in('id', userIds);
                (profs || []).forEach((p)=>{
                    profilesMap[p.id] = p;
                });
            }
            const enriched = requestsList.map((r)=>{
                const fallbackId = `${r.party_id}-${r.user_id}-${r.created_at || r.timestamp || Date.now()}`;
                const partyDetails = partiesMap?.[String(r.party_id)] || r.party || null;
                return {
                    id: String(r.id ?? r.request_id ?? fallbackId),
                    party_id: String(r.party_id),
                    user_id: String(r.user_id),
                    created_at: new Date(r.created_at || r.timestamp || Date.now()),
                    userProfile: profilesMap[String(r.user_id)],
                    party: {
                        drop_off: partyDetails?.drop_off ?? r.drop_off ?? null,
                        meetup_point: partyDetails?.meetup_point ?? r.meetup_point ?? null
                    }
                };
            });
            return {
                success: true,
                requests: enriched
            };
        } catch (e) {
            return {
                success: false,
                error: e?.message || 'Failed to load requests'
            };
        }
    }
    /** Host-only: approve a pending request */ async approveRequest(requestId, partyId, requesterId) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return {
                success: false,
                error: 'Not authenticated'
            };
            const normalizedRequestId = Number.isFinite(Number(requestId)) ? Number(requestId) : requestId;
            // Check eligibility via RPC (capacity/duplicate/expiry)
            const { data: canJoin, error: checkError } = await this.supabase.rpc('can_user_join_party', {
                p_party_id: partyId,
                p_user_id: requesterId
            });
            if (checkError) {
                console.error('approveRequest: can_user_join_party:', checkError);
                return {
                    success: false,
                    error: 'Failed to verify capacity'
                };
            }
            if (!canJoin) return {
                success: false,
                error: 'Party full/expired or already a member'
            };
            // Add as joined member
            const { error: jErr } = await this.supabase.from('party_members').insert({
                party_id: partyId,
                user_id: requesterId,
                status: 'joined',
                contact_shared: false
            });
            if (jErr) {
                console.error('approveRequest: insert party_member:', jErr);
                return {
                    success: false,
                    error: 'Failed to add member'
                };
            }
            // Mark request accepted
            const { error: uErr } = await this.supabase.from('party_requests').update({
                status: 'accepted'
            }).eq('request_id', normalizedRequestId);
            if (uErr) console.warn('approveRequest: update request failed (non-blocking):', uErr);
            return {
                success: true
            };
        } catch (e) {
            return {
                success: false,
                error: e?.message || 'Approve failed'
            };
        }
    }
    /** Host-only: decline a pending request */ async declineRequest(requestId) {
        try {
            const normalizedRequestId = Number.isFinite(Number(requestId)) ? Number(requestId) : requestId;
            const { error } = await this.supabase.from('party_requests').update({
                status: 'declined'
            }).eq('request_id', normalizedRequestId);
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (e) {
            return {
                success: false,
                error: e?.message || 'Decline failed'
            };
        }
    }
}
const partyMemberService = new PartyMemberService();
}),
"[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "Card": ()=>Card,
    "CardAction": ()=>CardAction,
    "CardContent": ()=>CardContent,
    "CardDescription": ()=>CardDescription,
    "CardFooter": ()=>CardFooter,
    "CardHeader": ()=>CardHeader,
    "CardTitle": ()=>CardTitle
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
function Card({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
function CardHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
function CardTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("leading-none font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
function CardDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
function CardAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-action",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 53,
        columnNumber: 5
    }, this);
}
function CardContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("px-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function CardFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "card-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center px-6 [.border-t]:pt-6", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/card.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/src/stores/notificationsStore.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "useNotificationsStore": ()=>useNotificationsStore
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const useNotificationsStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        notifications: [],
        add: (n)=>set((state)=>{
                if (state.notifications.some((x)=>x.id === n.id)) return state; // de-dup
                return {
                    notifications: [
                        n,
                        ...state.notifications
                    ]
                };
            }),
        remove: (id)=>set((state)=>({
                    notifications: state.notifications.filter((n)=>n.id !== id)
                })),
        markRead: (id)=>set((state)=>({
                    notifications: state.notifications.map((n)=>n.id === id ? {
                            ...n,
                            read: true
                        } : n)
                })),
        markAllRead: ()=>set((state)=>({
                    notifications: state.notifications.map((n)=>({
                            ...n,
                            read: true
                        }))
                })),
        unreadCount: ()=>get().notifications.filter((n)=>!n.read).length,
        has: (id)=>get().notifications.some((n)=>n.id === id)
    }));
}),
"[project]/src/components/GenderBadge.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GenderBadge": ()=>GenderBadge,
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mars$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mars$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mars.js [app-ssr] (ecmascript) <export default as Mars>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$venus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Venus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/venus.js [app-ssr] (ecmascript) <export default as Venus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
"use client";
;
;
;
function GenderBadge({ gender, className }) {
    const g = (gender || "").toString().trim().toLowerCase();
    let color = "text-muted-foreground";
    let Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"];
    let label = gender || "";
    if (g === "male" || g === "m") {
        color = "text-sky-500";
        Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mars$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mars$3e$__["Mars"];
        label = "Male";
    } else if (g === "female" || g === "f") {
        color = "text-pink-500";
        Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$venus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Venus$3e$__["Venus"];
        label = "Female";
    } else if (g === "non-binary" || g === "nonbinary" || g === "they" || g === "they/them" || g === "nb") {
        color = "text-zinc-400";
        Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"];
        label = "They/Them";
    } else if (g) {
        // Some other custom input - keep gray
        color = "text-zinc-400";
        Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"];
        label = gender;
    } else {
        color = "text-zinc-400";
        Icon = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"];
        label = "";
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-1 text-xs", color, className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                className: "h-3.5 w-3.5"
            }, void 0, false, {
                fileName: "[project]/src/components/GenderBadge.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            label && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/GenderBadge.tsx",
                lineNumber: 40,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GenderBadge.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = GenderBadge;
}),
"[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>NotificationsDropdown
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/notificationsStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
function NotificationsDropdown() {
    const [showDropdown, setShowDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const notifications = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.notifications);
    const unreadCount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.unreadCount());
    const markRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.markRead);
    const markAllRead = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.markAllRead);
    const addNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.add);
    const removeNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.remove);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])();
    // Close dropdown when clicking outside
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleClickOutside = (event)=>{
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
            // Mark all as read when opening the dropdown so the red dot disappears
            markAllRead();
        }
        return ()=>{
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [
        showDropdown,
        markAllRead
    ]);
    const onClickNotification = (id, href)=>{
        markRead(id);
        if (href) router.push(href);
        setShowDropdown(false);
    };
    // Realtime: listen for join requests for hosts and acceptance/decline updates for requesters
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let isMounted = true;
        (async ()=>{
            const { data: auth } = await supabase.auth.getUser();
            const currentUser = auth?.user;
            if (!currentUser || !isMounted) return;
            // Helper: fetch display name for a user
            const getDisplayName = async (userId)=>{
                const { data: profile } = await supabase.from('profiles').select('full_name, nickname').eq('id', userId).single();
                return profile?.nickname || profile?.full_name || 'Someone';
            };
            // Helper: fetch party host id and short name/destination
            const getPartyInfo = async (partyId)=>{
                const { data: party } = await supabase.from('parties').select('id, host_id, drop_off').eq('id', partyId).single();
                return party;
            };
            // Channel for party_requests changes
            const channel = supabase.channel('party-requests-notifs').on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'party_requests'
            }, async (payload)=>{
                // New request created; if I'm the host of that party, notify me
                const rec = payload.new;
                const party = await getPartyInfo(String(rec.party_id));
                if (!party || party.host_id !== currentUser.id) return;
                const requesterName = await getDisplayName(String(rec.user_id));
                const notifId = `join-request:${rec.id || rec.request_id || rec.user_id + ':' + rec.party_id}`;
                addNotification({
                    id: notifId,
                    message: `${requesterName} is trying to join your party`,
                    timestamp: new Date(),
                    read: false,
                    type: 'join_request',
                    meta: {
                        requestId: rec.id || rec.request_id,
                        partyId: String(rec.party_id),
                        requesterId: String(rec.user_id),
                        requesterName
                    }
                });
            }).on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'party_requests'
            }, async (payload)=>{
                // Request updated; if I'm the requester, notify me on acceptance
                const rec = payload.new;
                if (String(rec.user_id) !== currentUser.id) return;
                const party = await getPartyInfo(String(rec.party_id));
                if (!party) return;
                const hostName = await getDisplayName(String(party.host_id));
                if (rec.status === 'accepted') {
                    addNotification({
                        id: `join-accepted:${rec.id || rec.request_id}`,
                        message: `You have joined ${hostName}'s party`,
                        timestamp: new Date(),
                        read: false,
                        type: 'success',
                        href: '/current-party',
                        meta: {
                            partyId: String(rec.party_id)
                        }
                    });
                } else if (rec.status === 'declined') {
                    addNotification({
                        id: `join-declined:${rec.id || rec.request_id}`,
                        message: `${hostName} declined your join request`,
                        timestamp: new Date(),
                        read: false,
                        type: 'error',
                        meta: {
                            partyId: String(rec.party_id)
                        }
                    });
                }
            }).subscribe();
            return ()=>{
                isMounted = false;
                supabase.removeChannel(channel);
            };
        })();
    }, [
        supabase,
        addNotification
    ]);
    const handleAccept = async (notifId, meta)=>{
        if (!meta) return;
        const { partyId, requesterId, requestId } = meta;
        // Add requester as party member, then mark request accepted
        const { error: insertErr } = await supabase.from('party_members').insert({
            party_id: partyId,
            user_id: requesterId,
            status: 'joined',
            pickup_notes: null,
            contact_shared: false
        });
        if (insertErr) {
            console.error('Failed to add requester to party:', insertErr);
            return;
        }
        const updater = supabase.from('party_requests').update({
            status: 'accepted'
        });
        const normalizedRequestId = requestId && Number.isFinite(Number(requestId)) ? Number(requestId) : requestId;
        const { error: updateErr } = requestId ? await updater.eq('request_id', normalizedRequestId).select() : await updater.eq('party_id', partyId).eq('user_id', requesterId).select();
        if (updateErr) {
            console.error('Failed to update request status:', updateErr);
            return;
        }
        removeNotification(notifId);
    };
    const handleDecline = async (notifId, meta)=>{
        if (!meta) return;
        const { partyId, requesterId, requestId } = meta;
        const updater = supabase.from('party_requests').update({
            status: 'declined'
        });
        const normalizedRequestId = requestId && Number.isFinite(Number(requestId)) ? Number(requestId) : requestId;
        const { error } = requestId ? await updater.eq('request_id', normalizedRequestId) : await updater.eq('party_id', partyId).eq('user_id', requesterId);
        if (error) {
            console.error('Failed to decline request:', error);
            return;
        }
        removeNotification(notifId);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative",
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "p-2 rounded-full border hover:bg-accent hover:shadow-[0_0_20px_4px_rgba(255,43,99,0.35)] relative",
                title: "Notifications",
                onClick: ()=>setShowDropdown(!showDropdown),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"], {
                        className: "w-5 h-5"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
                        children: unreadCount > 9 ? '9+' : unreadCount
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 192,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                lineNumber: 185,
                columnNumber: 7
            }, this),
            showDropdown && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 mt-2 w-80 rounded-md border bg-card/95 backdrop-blur shadow-lg z-50 max-h-96 overflow-y-auto",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-3 border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "font-semibold text-sm",
                                    children: "Notifications"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                    lineNumber: 202,
                                    columnNumber: 15
                                }, this),
                                unreadCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "text-xs text-primary hover:underline",
                                    onClick: ()=>markAllRead(),
                                    children: "Mark all read"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                    lineNumber: 204,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                            lineNumber: 201,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this),
                    notifications.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 text-center text-sm text-muted-foreground",
                        children: "No notifications"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 210,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "divide-y",
                        children: notifications.map((n)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `w-full text-left p-3 ${!n.read ? 'bg-accent/20' : ''}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm",
                                                        children: n.message
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                        lineNumber: 222,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-1",
                                                        children: n.timestamp.toLocaleTimeString()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                        lineNumber: 223,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                lineNumber: 221,
                                                columnNumber: 21
                                            }, this),
                                            n.type !== 'join_request' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>onClickNotification(n.id, n.href),
                                                className: "text-xs text-primary hover:underline",
                                                children: "View"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                lineNumber: 228,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                        lineNumber: 220,
                                        columnNumber: 19
                                    }, this),
                                    n.type === 'join_request' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleAccept(n.id, n.meta),
                                                className: "px-2 py-1 text-xs rounded border border-green-300 bg-green-100 text-green-800 hover:shadow-[0_0_12px_2px_rgba(16,185,129,0.45)]",
                                                title: "Accept",
                                                children: "Accept"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                lineNumber: 238,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleDecline(n.id, n.meta),
                                                className: "px-2 py-1 text-xs rounded border border-red-300 bg-red-100 text-red-800 hover:shadow-[0_0_12px_2px_rgba(239,68,68,0.45)]",
                                                title: "Decline",
                                                children: "Decline"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                                lineNumber: 245,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                        lineNumber: 237,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, n.id, true, {
                                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                                lineNumber: 216,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                        lineNumber: 214,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
                lineNumber: 199,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx",
        lineNumber: 184,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/(main)/current-party/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>CurrentPartyPage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/authStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/services/partyMemberService.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/avatar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-x.js [app-ssr] (ecmascript) <export default as UserX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-ssr] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-ssr] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/notificationsStore.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GenderBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GenderBadge.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$NotificationsDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(main)/dashboard/components/NotificationsDropdown.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
function CurrentPartyPage() {
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((state)=>state.user);
    const authLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$authStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])((state)=>state.loading);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createClient"])(), []);
    const addNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.add);
    const hasNotification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$notificationsStore$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNotificationsStore"])((s)=>s.has);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [parties, setParties] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedId, setSelectedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [members, setMembers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [hostProfile, setHostProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const selectedParty = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>selectedId ? parties.find((p)=>p.id === selectedId) || null : null, [
        parties,
        selectedId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [
        authLoading,
        user,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const load = async ()=>{
            if (!user) return;
            setLoading(true);
            try {
                // hosting party
                const partyFields = `id, created_at, updated_at, host_id, party_size, duration_minutes, expires_at, meetup_point, drop_off, is_friends_only, is_gender_only, ride_options, host_comments, host_university, display_university, is_active`;
                const { data: hosting, error: hostErr } = await supabase.from('parties').select(partyFields).eq('host_id', user.id).eq('is_active', true);
                if (hostErr) console.warn('host fetch error', hostErr);
                // joined parties: get ids then fetch
                const { data: myMemberRows, error: memErr } = await supabase.from('party_members').select('party_id').eq('user_id', user.id).eq('status', 'joined');
                if (memErr) console.warn('membership fetch error', memErr);
                let joined = [];
                const ids = (myMemberRows || []).map((r)=>r.party_id);
                if (ids.length) {
                    const { data: joinedParties, error: joinedErr } = await supabase.from('parties').select(partyFields).in('id', ids).eq('is_active', true);
                    if (joinedErr) console.warn('joined fetch error', joinedErr);
                    joined = joinedParties || [];
                }
                // merge unique by id
                const mergedRaw = [
                    ...hosting || [],
                    ...joined
                ].reduce((acc, p)=>acc.find((x)=>x.id === p.id) ? acc : acc.concat(p), []);
                // map to Party shape (dates)
                const casted = mergedRaw.map((p)=>({
                        ...p,
                        created_at: new Date(p.created_at),
                        updated_at: p.updated_at ? new Date(p.updated_at) : new Date(p.created_at),
                        expires_at: new Date(p.expires_at),
                        ride_options: Array.isArray(p.ride_options) ? p.ride_options : [],
                        duration_minutes: typeof p.duration_minutes === 'number' ? p.duration_minutes : 0,
                        display_university: p.display_university,
                        is_active: p.is_active
                    }));
                setParties(casted);
                setSelectedId(casted[0]?.id ?? null);
            } finally{
                setLoading(false);
            }
        };
        load();
    }, [
        user,
        supabase
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadDetails = async ()=>{
            if (!selectedParty) return;
            // Load members via service (RLS-safe) and compute excluding host
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partyMemberService"].getPartyMembers(selectedParty.id);
            const memberList = res.success && res.members ? res.members : [];
            setMembers(memberList);
            // If party has reached time 0 and has at least 1 member (besides host), create a notification (no auto-redirect)
            const now = Date.now();
            // Add a small buffer to avoid client/DB clock skew
            const expired = selectedParty.expires_at.getTime() <= now - 2000;
            const nonHostCount = memberList.filter((m)=>m.user_id !== selectedParty.host_id).length;
            if (expired && nonHostCount > 0) {
                const id = `live-start:${selectedParty.id}`;
                if (!hasNotification(id)) {
                    addNotification({
                        id,
                        message: `${hostProfile?.nickname || hostProfile?.full_name || 'Host'}'s party has started for ${selectedParty.drop_off}. Click to open.`,
                        timestamp: new Date(),
                        read: false,
                        href: `/live-party?id=${selectedParty.id}`
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info("Party started! Check the notification bell.");
                }
            }
            // load host profile for contact/university
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', selectedParty.host_id).maybeSingle();
            if (profile) {
                // normalize to Profile type
                const norm = {
                    id: profile.id,
                    username: profile.username,
                    full_name: profile.full_name,
                    major: profile.major,
                    bio: profile.bio,
                    updated_at: profile.updated_at ? new Date(profile.updated_at) : null,
                    gender: profile.gender,
                    ideal_departure_time: profile.ideal_departure_time,
                    ideal_location: profile.ideal_location,
                    nickname: profile.nickname,
                    punctuality: profile.punctuality,
                    birth_date: profile.birth_date ? new Date(profile.birth_date) : null,
                    location: profile.location,
                    avatar_url: profile.avatar_url,
                    points: profile.points,
                    university: profile.university,
                    created_at: profile.created_at ? new Date(profile.created_at) : null,
                    show_university: profile.show_university,
                    phone_number: profile.phone_number,
                    show_phone: profile.show_phone,
                    isGenderOnly: null,
                    rideOptions: null,
                    expiresIn: null
                };
                setHostProfile(norm);
            } else {
                setHostProfile(null);
            }
        };
        loadDetails();
    }, [
        selectedParty,
        supabase,
        router,
        addNotification,
        hasNotification,
        hostProfile
    ]);
    // Schedule a one-shot check right when the countdown reaches 0 to push a notification
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!selectedParty) return;
        const msUntilExpiry = selectedParty.expires_at.getTime() - Date.now();
        if (msUntilExpiry <= 0) return; // already handled by loadDetails above
        const timer = setTimeout(async ()=>{
            // Re-check members right at expiry time and exclude host explicitly
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partyMemberService"].getPartyMembers(selectedParty.id);
            const memberList = res.success && res.members ? res.members : [];
            const nonHostCount = memberList.filter((m)=>m.user_id !== selectedParty.host_id).length;
            if (nonHostCount > 0) {
                const id = `live-start:${selectedParty.id}`;
                if (!hasNotification(id)) {
                    addNotification({
                        id,
                        message: `${hostProfile?.nickname || hostProfile?.full_name || 'Host'}'s party has started for ${selectedParty.drop_off}. Click to open.`,
                        timestamp: new Date(),
                        read: false,
                        href: `/live-party?id=${selectedParty.id}`
                    });
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].info("Party started! Check the notification bell.");
                }
            }
        // else: stay on current party per requirement
        }, Math.min(msUntilExpiry + 100, 2_147_483_647)); // slight buffer, clamp to max setTimeout
        return ()=>clearTimeout(timer);
    }, [
        selectedParty,
        router,
        addNotification,
        hasNotification,
        hostProfile
    ]);
    const isHost = selectedParty && user && selectedParty.host_id === user.id;
    const handleLeave = async ()=>{
        if (!selectedParty || !user) return;
        if (!confirm('Leave this party?')) return;
        setBusy(true);
        const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partyMemberService"].leaveParty(selectedParty.id);
        if (!res.success) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(res.error || 'Failed to leave');
        else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Left the party');
            setParties((prev)=>prev.filter((p)=>p.id !== selectedParty.id));
            setSelectedId(null);
        }
        setBusy(false);
    };
    const handleCancel = async ()=>{
        if (!selectedParty || !isHost) return;
        if (!confirm('Cancel this party for everyone?')) return;
        setBusy(true);
        const { error } = await supabase.from('parties').update({
            is_active: false
        }).eq('id', selectedParty.id).eq('host_id', user.id);
        if (error) __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error('Failed to cancel');
        else {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Party canceled');
            setParties((prev)=>prev.filter((p)=>p.id !== selectedParty.id));
            setSelectedId(null);
        }
        setBusy(false);
    };
    const handleKick = async (member)=>{
        if (!isHost) return;
        const ok = confirm(`Kick ${member.profile?.nickname || member.profile?.full_name || 'this user'}?`);
        if (!ok) return;
        try {
            setBusy(true);
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$services$2f$partyMemberService$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["partyMemberService"].kickMember(selectedParty.id, member.user_id);
            if (!res.success) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(res.error || 'Failed to kick');
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Member removed');
            setMembers((prev)=>prev.filter((m)=>m.user_id !== member.user_id));
        } finally{
            setBusy(false);
        }
    };
    const initials = (name)=>{
        if (!name) return 'U';
        return name.split(' ').map((w)=>w[0]?.toUpperCase()).slice(0, 2).join('');
    };
    if (authLoading || loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-muted-foreground",
                children: "Loading current parties…"
            }, void 0, false, {
                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                lineNumber: 258,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/(main)/current-party/page.tsx",
            lineNumber: 257,
            columnNumber: 7
        }, this);
    }
    if (parties.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-6 space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                    asChild: true,
                    variant: "outline",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/dashboard",
                        children: "← Back"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 266,
                        columnNumber: 43
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                    lineNumber: 266,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "py-12 text-center space-y-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-xl font-semibold",
                                children: "No party in progress"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 269,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-muted-foreground",
                                children: "You aren’t in any party right now."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 270,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                asChild: true,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/dashboard",
                                    children: "Browse parties"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                    lineNumber: 272,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 271,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 268,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                    lineNumber: 267,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(main)/current-party/page.tsx",
            lineNumber: 265,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex items-center justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                        asChild: true,
                        variant: "outline",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/dashboard",
                            children: "← Back"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                            lineNumber: 283,
                            columnNumber: 43
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 283,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-semibold",
                        children: "Current Parties"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$main$292f$dashboard$2f$components$2f$NotificationsDropdown$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                lineNumber: 282,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 items-start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                    children: "Your Active Parties"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                    lineNumber: 291,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 290,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "space-y-2",
                                children: [
                                    parties.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground",
                                        children: "You haven’t joined any parties yet."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                        lineNumber: 295,
                                        columnNumber: 15
                                    }, this),
                                    parties.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSelectedId(p.id),
                                            className: `w-full text-left p-3 rounded border transition ${selectedId === p.id ? 'bg-accent border-accent-foreground/20' : 'bg-background border-input hover:border-foreground/30'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-medium",
                                                            children: p.drop_off
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 304,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-muted-foreground",
                                                            children: p.expires_at.toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: [
                                                        "Meet: ",
                                                        p.meetup_point
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 307,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, p.id, true, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 298,
                                            columnNumber: 15
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 293,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 289,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: !selectedParty ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "py-10 text-center text-muted-foreground",
                                children: "Select a party to see details"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                lineNumber: 316,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                            lineNumber: 315,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Card"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardHeader"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardTitle"], {
                                        children: [
                                            "Ride to ",
                                            selectedParty.drop_off
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                        lineNumber: 321,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CardContent"], {
                                    className: "space-y-6",
                                    children: [
                                        (()=>{
                                            const expired = selectedParty.expires_at.getTime() <= Date.now() - 2000;
                                            const nonHostCount = members.filter((m)=>m.user_id !== selectedParty.host_id).length;
                                            if (expired && nonHostCount > 0) {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 rounded border bg-amber-500/10 text-amber-200 text-sm flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Party has started. Open the live page from the notification bell."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 331,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                            size: "sm",
                                                            variant: "secondary",
                                                            onClick: ()=>router.push(`/live-party?id=${selectedParty.id}`),
                                                            children: "Open Live Party"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 23
                                                }, this);
                                            }
                                            return null;
                                        })(),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                            size: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 339,
                                                            columnNumber: 60
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Meetup:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 339,
                                                            columnNumber: 80
                                                        }, this),
                                                        " ",
                                                        selectedParty.meetup_point
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 339,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                            size: 18
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 60
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-medium",
                                                            children: "Size:"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 340,
                                                            columnNumber: 79
                                                        }, this),
                                                        " ",
                                                        members.filter((m)=>m.user_id !== selectedParty.host_id).length,
                                                        "/",
                                                        selectedParty.party_size
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 338,
                                            columnNumber: 17
                                        }, this),
                                        selectedParty.host_comments && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3 rounded border bg-muted/30",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-medium mb-1",
                                                    children: "Host notes"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 345,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm text-muted-foreground whitespace-pre-wrap",
                                                    children: selectedParty.host_comments
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 346,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 344,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mb-2 text-sm font-medium",
                                                    children: "Members"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 351,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col divide-y border rounded",
                                                    children: [
                                                        members.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between p-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                                href: `/profile/id/${m.user_id}`,
                                                                                className: "flex items-center",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Avatar"], {
                                                                                    className: "h-8 w-8",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarImage"], {
                                                                                            src: m.profile?.avatar_url || ''
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                            lineNumber: 358,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$avatar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AvatarFallback"], {
                                                                                            children: initials(m.profile?.nickname || m.profile?.full_name)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                            lineNumber: 359,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                    lineNumber: 357,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                lineNumber: 356,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                                                href: `/profile/id/${m.user_id}`,
                                                                                                className: "font-medium hover:underline",
                                                                                                children: m.profile?.nickname || m.profile?.full_name || 'User'
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                                lineNumber: 364,
                                                                                                columnNumber: 31
                                                                                            }, this),
                                                                                            m.user_id === selectedParty.host_id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                                                                                                size: 14,
                                                                                                className: "text-yellow-500"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                                lineNumber: 365,
                                                                                                columnNumber: 71
                                                                                            }, this),
                                                                                            m.profile?.gender && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GenderBadge$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                                                gender: m.profile.gender
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                                lineNumber: 367,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                        lineNumber: 363,
                                                                                        columnNumber: 29
                                                                                    }, this),
                                                                                    m.profile?.show_university && m.profile.university && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "text-xs text-muted-foreground",
                                                                                        children: m.profile.university
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                        lineNumber: 372,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                lineNumber: 362,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                        lineNumber: 355,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    isHost && m.user_id !== user.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "sm",
                                                                        variant: "outline",
                                                                        onClick: ()=>handleKick(m),
                                                                        disabled: busy,
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__UserX$3e$__["UserX"], {
                                                                                className: "h-4 w-4 mr-1"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                                lineNumber: 378,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            " Kick"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                        lineNumber: 377,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, m.id, true, {
                                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                                lineNumber: 354,
                                                                columnNumber: 23
                                                            }, this)),
                                                        members.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-3 text-sm text-muted-foreground",
                                                            children: "No members yet."
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 46
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 350,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between",
                                            children: !isHost ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "destructive",
                                                onClick: handleLeave,
                                                disabled: busy,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                        className: "h-4 w-4 mr-1"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                        lineNumber: 389,
                                                        columnNumber: 89
                                                    }, this),
                                                    " Exit party"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                lineNumber: 389,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "destructive",
                                                onClick: handleCancel,
                                                disabled: busy,
                                                children: "Cancel party"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                lineNumber: 391,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 387,
                                            columnNumber: 17
                                        }, this),
                                        hostProfile?.show_phone && hostProfile.phone_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 flex items-center gap-2 text-sm p-3 rounded border bg-muted/20",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                    size: 16
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 21
                                                }, this),
                                                " Host contact: ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-medium",
                                                    children: hostProfile.phone_number
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 55
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                            lineNumber: 397,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/(main)/current-party/page.tsx",
                                    lineNumber: 323,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/(main)/current-party/page.tsx",
                            lineNumber: 319,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/(main)/current-party/page.tsx",
                        lineNumber: 313,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(main)/current-party/page.tsx",
                lineNumber: 288,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(main)/current-party/page.tsx",
        lineNumber: 281,
        columnNumber: 5
    }, this);
}
}),

};

//# sourceMappingURL=src_fd72b613._.js.map