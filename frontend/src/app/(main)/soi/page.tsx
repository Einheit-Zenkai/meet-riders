"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Bus, Car, CarTaxiFront, Footprints, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/Authcontext";

const rideOptions = [
  { name: "On Foot", icon: Footprints },
  { name: "Auto", icon: CarTaxiFront },
  { name: "Cab", icon: Car },
  { name: "Bus", icon: Bus },
  { name: "SUV", icon: Car },
];

export default function ShowInterestPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const [isAlreadyHosting, setIsAlreadyHosting] = useState(false);

  // Form state
  const [partySize, setPartySize] = useState(1);
  const [meetupPoint, setMeetupPoint] = useState("");
  const [dropOff, setDropOff] = useState("");
  const [selectedRides, setSelectedRides] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(""); // HH:MM (time-only)
  const [displayUniversity, setDisplayUniversity] = useState(false);
  const [myUniversity, setMyUniversity] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      // Check if already hosting an active SOI
      const { data } = await supabase
        .from("soi_parties")
        .select("id")
        .eq("host_id", user.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (data) setIsAlreadyHosting(true);

      // Load profile university + preference
      const { data: prof } = await supabase
        .from("profiles")
        .select("university, show_university")
        .eq("id", user.id)
        .single();
      setMyUniversity((prof as any)?.university || "");
      setDisplayUniversity((prof as any)?.show_university ?? false);
    };
    init();
  }, [user, supabase]);

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

  const handleStartSOI = async () => {
    if (!meetupPoint || !dropOff || partySize <= 0 || !startTime) {
      toast.error("Fill meetup, destination, party size and start time");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to create a Show of Interest.");
      return;
    }

    // Convert HH:MM to the next occurrence (today if in future, otherwise tomorrow)
    const [hh, mm] = startTime.split(":");
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(hh || "0", 10),
      parseInt(mm || "0", 10),
      0,
      0
    );
    if (start.getTime() <= now.getTime()) {
      start.setDate(start.getDate() + 1);
    }
    const startISO = start.toISOString();

    const payload: any = {
      host_id: user.id,
      party_size: partySize,
      meetup_point: meetupPoint,
      drop_off: dropOff,
      ride_options: selectedRides,
      start_time: startISO,
      is_active: true,
    };

    if (displayUniversity && myUniversity) {
      payload.display_university = true;
      payload.host_university = myUniversity;
    } else {
      payload.display_university = false;
      payload.host_university = null;
    }

    const { error } = await supabase.from("soi_parties").insert([payload]);
    if (error) {
      console.error(error);
      toast.error(error.message || 'Failed to create SOI');
    } else {
      toast.success("Show of Interest created");
      router.push("/dashboard");
    }
  };

  if (isAlreadyHosting) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-10">
        <div className="bg-card p-8 rounded-lg shadow-md border">
          <AlertCircle className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold text-card-foreground mb-2">You're Already Hosting an SOI!</h1>
          <p className="text-muted-foreground mb-6">
            You can only host one Show of Interest at a time. Please cancel your existing one from the dashboard.
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <CalendarClock className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Show of Interest</h1>
        </div>

        {/* Meetup Point */}
        <div className="space-y-2">
          <label htmlFor="meetup" className="text-xl font-semibold text-foreground">
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

        {/* Destination */}
        <div className="space-y-2">
          <label htmlFor="dropoff" className="text-xl font-semibold text-foreground">
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

        {/* Party Size & University Toggle */}
        <div className="flex flex-wrap gap-8 items-start">
          <div className="space-y-4">
            <label className="text-xl font-semibold text-foreground">Max party size</label>
            <input
              type="number"
              value={partySize}
              onChange={(e) => {
                let v = parseInt(e.target.value || "0", 10);
                if (v < 1) v = 1;
                if (v > 7) v = 7;
                setPartySize(v);
              }}
              className="w-24 p-2 border-2 border-input rounded-lg text-center text-lg bg-background"
              min={1}
              max={7}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xl font-semibold text-foreground">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="p-2 border-2 border-input rounded-lg bg-background"
            />
            <p className="text-sm text-muted-foreground">
              We’ll schedule it for the next occurrence of this time (today if still ahead, otherwise tomorrow).
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xl font-semibold text-foreground">Visibility</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded text-primary focus:ring-ring"
                checked={displayUniversity}
                onChange={(e) => setDisplayUniversity(e.target.checked)}
                disabled={!myUniversity}
              />
              <span className="text-foreground">Display my university on this SOI</span>
              {!myUniversity && (
                <span className="text-xs text-muted-foreground"> (add your university in Profile)</span>
              )}
            </label>
          </div>
        </div>

        {/* Ride Options */}
        <div className="space-y-4">
          <label className="text-xl font-semibold text-foreground">Ideal ride from destination</label>
          <div className="flex flex-wrap gap-3">
            {rideOptions.map((ride) => (
              <button
                key={ride.name}
                type="button"
                onClick={() => handleRideToggle(ride.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-colors ${
                  selectedRides.includes(ride.name)
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

        {/* Submit */}
        <div className="pt-6 text-center">
          <button
            onClick={handleStartSOI}
            className="px-12 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-full hover:bg-primary/90 transition-colors shadow-lg"
          >
            Create SOI
          </button>
        </div>
      </div>
    </div>
  );
}
