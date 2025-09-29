// frontend/src/app/hostparty/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Bus, Car, CarTaxiFront, Footprints, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";
import usePartyStore from "@/stores/partyStore";

const rideOptions = [
  { name: "On Foot", icon: Footprints },
  { name: "Auto", icon: CarTaxiFront },
  { name: "Cab", icon: Car },
  { name: "Bus", icon: Bus },
  { name: "SUV", icon: Car },
];

export default function HostPartyPage() {
  const router = useRouter();
  const { user } = useAuthStore(); // Get user from auth context
  const supabase = createClient();
  const { addParty } = usePartyStore();
  const [isAlreadyHosting, setIsAlreadyHosting] = useState(false);

  // Form state
  const [partySize, setPartySize] = useState(2);
  const [meetupPoint, setMeetupPoint] = useState("");
  const [dropOff, setDropOff] = useState("");
  const [isFriendsOnly, setIsFriendsOnly] = useState(false);
  const [displayUniversity, setDisplayUniversity] = useState(false);
  const [myUniversity, setMyUniversity] = useState<string>("");
  // Removed gender-only option for safety
  const [selectedRides, setSelectedRides] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState("10 min");
  const [hostComments, setHostComments] = useState("");

  // ✅ Check if user is already hosting
  useEffect(() => {
    const checkIfHosting = async () => {
      if (!user) return; // User is guaranteed by middleware, but safety check

      // check if user is already hosting
      const { data, error } = await supabase
        .from("parties")
        .select("id")
        .eq("host_id", user.id)
        .eq("is_active", true) // assuming you track active status
        .single();

      if (data) setIsAlreadyHosting(true);

      // fetch my profile university for display toggle
      const { data: prof } = await supabase
        .from('profiles')
        .select('university, show_university')
        .eq('id', user.id)
        .single();
      setMyUniversity(prof?.university || "");
      // default display state to profile's preference if available
      setDisplayUniversity((prof as any)?.show_university ?? false);
    };

    checkIfHosting();
  }, [user, supabase]);

  // Handlers
  const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSize = parseInt(e.target.value, 10) || 0;
    if (newSize > 7) newSize = 7;
    if (newSize < 2) newSize = 2;
    setPartySize(newSize);
  };

  const handleRemoveMember = () => {
    if (partySize > 2) setPartySize(partySize - 1);
  };

  const handleRideToggle = (rideName: string) => {
    if (selectedRides.includes(rideName)) {
      setSelectedRides(selectedRides.filter((r) => r !== rideName));
    } else {
      if (selectedRides.length < 2) {
        setSelectedRides([...selectedRides, rideName]);
      } else {
  toast.info("You can only select a maximum of 2 ride options.");
      }
    }
  };

  const handleStartParty = async () => {
    if (!meetupPoint || !dropOff || partySize < 2) {
      toast.error("Please fill out the meetup point, drop-off, and set a party size of at least 2.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to host a party.");
      return;
    }

    const payload: any = {
      host_id: user.id,
      party_size: partySize,
      meetup_point: meetupPoint,
      drop_off: dropOff,
      is_friends_only: isFriendsOnly,
      is_gender_only: false, // enforced disabled by design
      ride_options: selectedRides,
      expires_in: expiresIn,
      is_active: true,
      host_comments: hostComments,
      expiry_timestamp: (() => {
        const now = new Date();
        const minutes = parseInt(expiresIn.split(' ')[0], 10);
        now.setMinutes(now.getMinutes() + minutes);
        return now.toISOString();
      })(),
    };

    if (displayUniversity && myUniversity) {
      payload.display_university = true;
      payload.host_university = myUniversity;
    } else {
      payload.display_university = false;
      payload.host_university = null;
    }

    const { error } = await supabase.from("parties").insert([
      {
        ...payload,
      },
    ]);

    if (error) {
      console.error(error);
      toast.error(error.message || 'Failed to create party');
    } else {
      // Also add to local context so it appears immediately
      addParty({
        partySize,
        meetupPoint,
        dropOff,
        isFriendsOnly,
        isGenderOnly: false,
        rideOptions: selectedRides,
        expiresIn,
        // displayUniversity: payload.display_university,
        // hostUniversity: payload.host_university || undefined,
      });
      toast.success("Party created and visible on the dashboard");
      router.push("/dashboard");
    }
  };

  // --- Conditional rendering if already hosting ---
  if (isAlreadyHosting) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-10">
        <div className="bg-card p-8 rounded-lg shadow-md border">
          <AlertCircle className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            You're Already Hosting!
          </h1>
          <p className="text-muted-foreground mb-6">
            You can only host one ride at a time. Please cancel your existing
            ride from the homepage if you wish to create a new one.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // --- Party creation form ---
  return (
    <div className="p-8 max-w-4xl mx-auto">

      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-foreground">Host a Party</h1>

        {/* Party Size */}


        {/* Meetup Point */}
        <div className="space-y-2">
          <label
            htmlFor="meetup"
            className="text-xl font-semibold text-foreground"
          >
            Meetup point
          </label>
          <input
            type="text"
            id="meetup"
            placeholder="Enter the full meeting address"
            className="w-full p-3 border-2 border-input rounded-lg bg-background"
            value={meetupPoint}
            onChange={(e) => setMeetupPoint(e.target.value)}
          />
        </div>

        {/* Dropoff */}
        <div className="space-y-2">
          <label
            htmlFor="dropoff"
            className="text-xl font-semibold text-foreground"
          >
            Final Destination
          </label>
          <input
            type="text"
            id="dropoff"
            placeholder="Enter your final destination address"
            className="w-full p-3 border-2 border-input rounded-lg bg-background"
            value={dropOff}
            onChange={(e) => setDropOff(e.target.value)}
          />
        </div>

        <div className="flex space-x-6">
          {/* Privacy */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Privacy</h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded text-primary focus:ring-ring"
                  checked={isFriendsOnly}
                  onChange={(e) => setIsFriendsOnly(e.target.checked)}
                />
                <span className="text-foreground">Friends only (Private Party)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded text-primary focus:ring-ring"
                  checked={displayUniversity}
                  onChange={(e) => setDisplayUniversity(e.target.checked)}
                  disabled={!myUniversity}
                />
                <span className="text-foreground">Display my university on this party</span>
                {!myUniversity && (
                  <span className="text-xs text-muted-foreground"> (add your university in Profile)</span>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xl font-semibold text-foreground">
              Max party size
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={partySize}
                onChange={handlePartySizeChange}
                className="w-20 p-2 border-2 border-input rounded-lg text-center text-lg bg-background"
                min="2"
                max="7"
              />
              <div className="flex items-center space-x-2">
                {Array.from({ length: partySize }).map((_, index) => (
                  <User
                    key={index}
                    className="w-8 h-8 text-muted-foreground cursor-pointer"
                    onClick={handleRemoveMember}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Host Comments */}
        <div className="space-y-2">
          <label htmlFor="host-comments" className="text-xl font-semibold text-foreground">
            Additional Comments (optional)
          </label>
          <textarea
            id="host-comments"
            className="w-full p-3 border-2 border-input rounded-lg bg-background"
            placeholder="Add any special instructions, notes, or comments for your party members."
            value={hostComments}
            onChange={e => setHostComments(e.target.value)}
            rows={3}
          />
        </div>
        {/* Ride Options */}
        <div className="space-y-4">
          <label className="text-xl font-semibold text-foreground">
            Ideal ride from destination
          </label>
          <div className="flex flex-wrap gap-3">
            {rideOptions.map((ride) => (
              <button
                key={ride.name}
                onClick={() => handleRideToggle(ride.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-colors ${selectedRides.includes(ride.name)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-input hover:border-foreground/50"
                  }`}
              >
                <ride.icon className="w-5 h-5" />
                <span>{ride.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Expiry */}
        <div className="space-y-4">
          <label className="text-xl font-semibold text-foreground">
            Expire party request in
          </label>
          <div className="flex flex-wrap gap-3">
            {["10 min", "15 min", "20 min", "30 min", "1 hr"].map((time) => (
              <label
                key={time}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="expiration"
                  value={time}
                  checked={expiresIn === time}
                  onChange={() => setExpiresIn(time)}
                  className="h-4 w-4 text-primary focus:ring-ring"
                />
                <span className="text-foreground">{time}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 text-center">
          <button
            onClick={handleStartParty}
            className="px-12 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors shadow-lg"
          >
            Start Party!
          </button>
        </div>
      </div>
    </div>
  );
}