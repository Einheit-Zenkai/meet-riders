// frontend/src/app/hostparty/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParties } from '@/context/PartyContext'; // <-- This hook gets us the list of parties
import { User, Bus, Car, CarTaxiFront, Footprints, AlertCircle } from 'lucide-react';

const rideOptions = [
  { name: 'On Foot', icon: Footprints },
  { name: 'Auto', icon: CarTaxiFront },
  { name: 'Cab', icon: Car },
  { name: 'Bus', icon: Bus },
  { name: 'SUV', icon: Car },
];

export default function HostPartyPage() {
  const router = useRouter();
  // Get the complete list of parties AND the function to add one
  const { parties, addParty } = useParties();

  // --- Check if the current user is already hosting a party ---
  // In our simple case, we check if any party has `host === 'You'`
  const isAlreadyHosting = parties.some(party => party.host === 'You');


  // --- All of your state and handlers remain the same. ---
  // They are only needed if the user is NOT already hosting.
  const [partySize, setPartySize] = useState(1);
  const [meetupPoint, setMeetupPoint] = useState('');
  const [dropOff, setDropOff] = useState('');
  const [isFriendsOnly, setIsFriendsOnly] = useState(false);
  const [isGenderOnly, setIsGenderOnly] = useState(false);
  const [selectedRides, setSelectedRides] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState('10 min');

  const handlePartySizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newSize = parseInt(e.target.value, 10) || 0;
    if (newSize > 7) newSize = 7;
    if (newSize < 0) newSize = 0;
    setPartySize(newSize);
  };
  const handleRemoveMember = () => { if (partySize > 0) setPartySize(partySize - 1); };
  const handleRideToggle = (rideName: string) => {
    if (selectedRides.includes(rideName)) {
      setSelectedRides(selectedRides.filter((r) => r !== rideName));
    } else {
      if (selectedRides.length < 2) setSelectedRides([...selectedRides, rideName]);
      else alert("You can only select a maximum of 2 ride options.");
    }
  };
  const handleStartParty = () => {
    if (!meetupPoint || !dropOff || partySize === 0) {
      alert('Please fill out the meetup point, drop-off, and set a party size.');
      return;
    }
    addParty({
      partySize, meetupPoint, dropOff, isFriendsOnly, isGenderOnly,
      rideOptions: selectedRides, expiresIn: expiresIn
    });
    router.push('/');
  };

  
  // --- This is the conditional rendering logic ---

  if (isAlreadyHosting) {
    // If the user IS hosting, show this message.
    return (
        <div className="p-8 max-w-2xl mx-auto text-center mt-10">
          <div className="bg-white p-8 rounded-lg shadow-md border">
              <AlertCircle className="w-16 h-16 mx-auto text-orange-400 mb-4"/>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">You're Already Hosting!</h1>
              <p className="text-gray-600 mb-6">
                  You can only host one ride at a time. Please cancel your existing ride from the homepage if you wish to create a new one.
              </p>
              <Link href="/" className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-black transition-colors">
                  Back to Homepage
              </Link>
          </div>
        </div>
    );
  }

  // If the user is NOT hosting, show your original form.
  // This is your entire UI, 100% preserved.
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="inline-block mb-8 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">
        ← Back
      </Link>
      
      <div className="space-y-10">
        <h1 className="text-3xl font-bold text-gray-800">Host a Party</h1>

        <div className="space-y-4">
          <label className="text-xl font-semibold text-gray-700">Max party size</label>
          <div className="flex items-center space-x-4">
            <input 
              type="number" value={partySize} onChange={handlePartySizeChange}
              className="w-20 p-2 border-2 border-gray-300 rounded-lg text-center text-lg" min="1" max="7"
            />
            <div className="flex items-center space-x-2">
              {Array.from({ length: partySize }).map((_, index) => (
                <User key={index} className="w-8 h-8 text-gray-600 cursor-pointer" onClick={handleRemoveMember}/>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="meetup" className="text-xl font-semibold text-gray-700">Meetup point</label>
          <input 
            type="text" id="meetup" placeholder="Enter the full meeting address" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg"
            value={meetupPoint} onChange={(e) => setMeetupPoint(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dropoff" className="text-xl font-semibold text-gray-700">Your (host) drop location</label>
          <input 
            type="text" id="dropoff" placeholder="Enter your final destination address" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg"
            value={dropOff} onChange={(e) => setDropOff(e.target.value)}
          />
        </div>

        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Privacy</h2>
            <div className="flex flex-col space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="h-5 w-5 rounded text-rose-500 focus:ring-rose-400"
                    checked={isFriendsOnly} onChange={(e) => setIsFriendsOnly(e.target.checked)}
                  />
                  <span className="text-gray-700">Friends only (Private Party)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" className="h-5 w-5 rounded text-rose-500 focus:ring-rose-400"
                    checked={isGenderOnly} onChange={(e) => setIsGenderOnly(e.target.checked)}
                  />
                  <span className="text-gray-700">Your gender only</span>
              </label>
            </div>
        </div>

        <div className="space-y-4">
          <label className="text-xl font-semibold text-gray-700">Ideal ride from destination</label>
          <div className="flex flex-wrap gap-3">
            {rideOptions.map(ride => (
              <button 
                key={ride.name} onClick={() => handleRideToggle(ride.name)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-colors ${
                  selectedRides.includes(ride.name) ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                }`}
              >
                <ride.icon className="w-5 h-5"/>
                <span>{ride.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
            <label className="text-xl font-semibold text-gray-700">Expire party request in</label>
            <div className="flex flex-wrap gap-3">
                {['10 min', '15 min', '20 min', '30 min', '1 hr'].map(time => (
                    <label key={time} className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="expiration" value={time}
                          checked={expiresIn === time} onChange={() => setExpiresIn(time)}
                          className="h-4 w-4 text-rose-500 focus:ring-rose-400"
                        />
                        <span className="text-gray-700">{time}</span>
                    </label>
                ))}
            </div>
        </div>
        
        <div className="pt-6 text-center">
          <button onClick={handleStartParty} className="px-12 py-4 bg-black text-white font-bold text-lg rounded-full hover:bg-gray-800 transition-colors shadow-lg">
            Start Party!
          </button>
        </div>
      </div>
    </div>
  );
}