// src/app/leaderboard/page.tsx

"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  // Dummy data (you can replace this with API data later)
  const topRiders = [
    { rank: 1, name: "Aditi Sharma", points: 120 },
    { rank: 2, name: "Rohit Mehta", points: 105 },
    { rank: 3, name: "Priya Nair", points: 98 },
    { rank: 4, name: "Arjun Verma", points: 90 },
    { rank: 5, name: "Kavya Singh", points: 85 },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="text-yellow-500 w-8 h-8" />
        <h1 className="text-3xl font-bold">Top Riders Leaderboard</h1>
      </div>

      {/* Card */}
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-center">
            Weekly Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {topRiders.map((rider) => (
              <li
                key={rider.rank}
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span className="font-semibold text-gray-700">
                  #{rider.rank}
                </span>
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
