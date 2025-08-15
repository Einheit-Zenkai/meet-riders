// src/app/leaderboard/page.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  // Dummy data (replace with API data later)
  const topRiders = [
    { rank: 1, name: "Aditi Sharma", points: 120 },
    { rank: 2, name: "Rohit Mehta", points: 105 },
    { rank: 3, name: "Priya Nair", points: 98 },
    { rank: 4, name: "Arjun Verma", points: 90 },
    { rank: 5, name: "Kavya Singh", points: 85 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6 relative">
      {/* Go Back Button */}
      <Link
        href="/dashboard"
        className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-primary transition"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </Link>

      {/* Title */}
      <div className="flex flex-col items-center gap-2 mb-6 mt-6">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500 w-8 h-8" />
          <h1 className="text-3xl font-bold">Top Riders Leaderboard</h1>
        </div>
        <p className="text-sm text-gray-600 text-center max-w-md">
          EARN <span className="font-bold text-green-600">3 POINTS</span> FOR EVERY PARTY YOU JOIN  
          AND <span className="font-bold text-green-600">5 POINTS</span> FOR EVERY SUCCESSFUL PARTY YOU HOST! 🚗  
          WAITING TO SEE YOU AT THE TOP OF THE LIST! 🏆
        </p>
      </div>

      {/* Card */}
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-center">Weekly Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {topRiders.map((rider) => (
              <li
                key={rider.rank}
                className={`flex items-center justify-between p-3 rounded-lg shadow-sm hover:shadow-md transition
                  ${rider.rank === 1 ? "bg-yellow-100" :
                    rider.rank === 2 ? "bg-gray-200" :
                    rider.rank === 3 ? "bg-orange-100" :
                    "bg-white"}`}
              >
                <span className="font-semibold text-gray-700">#{rider.rank}</span>
                <span className="text-gray-900">{rider.name}</span>
                <span className="text-primary font-bold">{rider.points} pts</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
