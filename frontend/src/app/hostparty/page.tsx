    // frontend/src/app/hostparty/page.tsx
    "use client";

    import { useState, useEffect } from "react";
    import Link from "next/link";
    import { useRouter } from "next/navigation";
    import { User, Bus, Car, CarTaxiFront, Footprints, AlertCircle } from "lucide-react";
    import { supabase } from "@/lib/supabaseClient"; // ✅ adjust path if needed

    const rideOptions = [
      { name: "On Foot", icon: Footprints },
      { name: "Auto", icon: CarTaxiFront },
      { name: "Cab", icon: Car },
      { name: "Bus", icon: Bus },
      { name: "SUV", icon: Car },
    ];

    export default function HostPartyPage() {
      const router = useRouter();
      const [userId, setUserId] = useState<string | null>(null);
      const [isAlreadyHosting, setIsAlreadyHosting] = useState(false);

      // Form state
      const [partySize, setPartySize] = useState(1);
      const [meetupPoint, setMeetupPoint] = useState("");
      const [dropOff, setDropOff] = useState("");
      const [isFriendsOnly, setIsFriendsOnly] = useState(false);
      const [isGenderOnly, setIsGenderOnly] = useState(false);
      const [selectedRides, setSelectedRides] = useState<string[]>([]);
      const [expiresIn, setExpiresIn] = useState("10 min");

      // ✅ Fetch logged-in user & check if already hosting
      useEffect(() => {
        const getUserAndCheckParty = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            router.push("/login");
            return;
          }

          setUserId(user.id);

          // check if user is already hosting
          const { data, error } = await supabase
            .from("parties")
            .select("id")
            .eq("host_id", user.id)
            .eq("is_active", true) // assuming you track active status
            .single();

          if (data) setIsAlreadyHosting(true);
        };

        getUserAndCheckParty();
      }, [router]);

      // Handlers
      const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newSize = parseInt(e.target.value, 10) || 0;
        if (newSize > 7) newSize = 7;
        if (newSize < 0) newSize = 0;
        setPartySize(newSize);
      };

      const handleRemoveMember = () => {
        if (partySize > 0) setPartySize(partySize - 1);
      };

      const handleRideToggle = (rideName: string) => {
        if (selectedRides.includes(rideName)) {
          setSelectedRides(selectedRides.filter((r) => r !== rideName));
        } else {
          if (selectedRides.length < 2) {
            setSelectedRides([...selectedRides, rideName]);
          } else {
            alert("You can only select a maximum of 2 ride options.");
          }
        }
      };

      const handleStartParty = async () => {
        if (!meetupPoint || !dropOff || partySize === 0) {
          alert("Please fill out the meetup point, drop-off, and set a party size.");
          return;
        }

        if (!userId) {
          alert("You must be logged in to host a party.");
          return;
        }

        const { error } = await supabase.from("parties").insert([
          {
            host_id: userId,
            party_size: partySize,
            meetup_point: meetupPoint,
            drop_off: dropOff,
            friends_only: isFriendsOnly,
            gender_only: isGenderOnly,
            ride_options: selectedRides,
            expires_in: expiresIn,
            is_active: true,
          },
        ]);

        if (error) {
          console.error(error);
          alert(error.message);
        } else {
          alert("✅ Party created!");
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
                href="/"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        );
      }

      // --- Party creation form ---
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-block mb-8 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
          >
            ← Back
          </Link>

          <div className="space-y-10">
            <h1 className="text-3xl font-bold text-foreground">Host a Party</h1>

            {/* Party Size */}
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
                  min="1"
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
                Your (host) drop location
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
                    checked={isGenderOnly}
                    onChange={(e) => setIsGenderOnly(e.target.checked)}
                  />
                  <span className="text-foreground">Your gender only</span>
                </label>
              </div>
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
  import { useAuth } from "@/context/Authcontext"; // 👈 use our new context