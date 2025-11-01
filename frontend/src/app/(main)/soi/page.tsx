"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Bus, Car, CarTaxiFront, Footprints, CalendarClock, MapPin, Flag, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import useAuthStore from "@/stores/authStore";

const rideOptions = [
  { name: "On Foot", icon: Footprints },
  { name: "Auto", icon: CarTaxiFront },
  { name: "Cab", icon: Car },
  { name: "Bus", icon: Bus },
  { name: "SUV", icon: Car },
];

export default function ShowInterestPage() {
  const router = useRouter();
  const { user } = useAuthStore();
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

      // Check if already hosting a non-expired SOI
      const { data: activeSois } = await supabase
        .from("soi_parties")
        .select("id,start_time,expiry_timestamp")
        .eq("host_id", user.id)
        .eq("is_active", true);

      if (activeSois && Array.isArray(activeSois)) {
        const nowMs = Date.now();
        const startThreshold = nowMs - 10 * 60 * 1000; // align with dashboard window
        const hasLiveSoi = activeSois.some((row: any) => {
          const startMs = row?.start_time ? new Date(row.start_time).getTime() : Number.NaN;
          const expiryMs = row?.expiry_timestamp ? new Date(row.expiry_timestamp).getTime() : null;
          if (Number.isNaN(startMs)) return false;
          const withinStartWindow = startMs >= startThreshold;
          const notExpired = expiryMs == null || expiryMs > nowMs;
          return withinStartWindow && notExpired;
        });
        setIsAlreadyHosting(hasLiveSoi);
      } else {
        setIsAlreadyHosting(false);
      }

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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <CalendarClock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Create Show of Interest</h1>
          <p className="text-muted-foreground">Let others know you're interested in sharing a ride</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-8">
          
          {/* Location Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Journey Details
            </h2>
            
            <div className="space-y-4 pl-7">
              <div className="space-y-2">
                <label htmlFor="meetup" className="text-sm font-medium text-foreground flex items-center gap-2">
                  Meetup Point
                </label>
                <input
                  type="text"
                  id="meetup"
                  placeholder="Where should everyone meet?"
                  className="w-full p-3 border-2 border-input rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={meetupPoint}
                  onChange={(e) => setMeetupPoint(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dropoff" className="text-sm font-medium text-foreground flex items-center gap-2">
                  Final Destination
                </label>
                <input
                  type="text"
                  id="dropoff"
                  placeholder="Where are you heading?"
                  className="w-full p-3 border-2 border-input rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={dropOff}
                  onChange={(e) => setDropOff(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6"></div>

          {/* Time & Party Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              When & Who
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-3 border-2 border-input rounded-lg bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Next occurrence of this time
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Party Size
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-input hover:border-primary hover:bg-primary/5 transition-all font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={partySize}
                    onChange={(e) => {
                      let v = parseInt(e.target.value || "0", 10);
                      if (v < 1) v = 1;
                      if (v > 7) v = 7;
                      setPartySize(v);
                    }}
                    className="w-20 p-3 border-2 border-input rounded-lg text-center text-xl font-semibold bg-background"
                    min={1}
                    max={7}
                  />
                  <button
                    type="button"
                    onClick={() => setPartySize(Math.min(7, partySize + 1))}
                    className="w-10 h-10 rounded-lg border-2 border-input hover:border-primary hover:bg-primary/5 transition-all font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6"></div>

          {/* Ride Options */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Car className="w-5 h-5 text-primary" />
              Preferred Ride Type
            </h2>
            <p className="text-sm text-muted-foreground pl-7">Select up to 2 options</p>
            <div className="flex flex-wrap gap-3 pl-7">
              {rideOptions.map((ride) => (
                <button
                  key={ride.name}
                  type="button"
                  onClick={() => handleRideToggle(ride.name)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl border-2 transition-all ${
                    selectedRides.includes(ride.name)
                      ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                      : "bg-background text-foreground border-input hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <ride.icon className="w-5 h-5" />
                  <span className="font-medium">{ride.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6"></div>

          {/* Visibility */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Flag className="w-5 h-5 text-primary" />
              Visibility Settings
            </h2>
            <label className="flex items-start gap-3 cursor-pointer pl-7 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                className="h-5 w-5 rounded text-primary focus:ring-ring mt-0.5"
                checked={displayUniversity}
                onChange={(e) => setDisplayUniversity(e.target.checked)}
                disabled={!myUniversity}
              />
              <div className="flex-1">
                <span className="text-foreground font-medium">Display my university on this SOI</span>
                {!myUniversity && (
                  <p className="text-xs text-muted-foreground mt-1">Add your university in Profile to enable this</p>
                )}
                {myUniversity && (
                  <p className="text-xs text-muted-foreground mt-1">Show "{myUniversity}" to other users</p>
                )}
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleStartSOI}
              className="w-full px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-98"
            >
              Create Show of Interest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
