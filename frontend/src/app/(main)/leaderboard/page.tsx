// src/app/(main)/leaderboard/page.tsx

"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";
import HostButton from "@/components/ui/hostbutton";

export default function LeaderboardPage() {
  // Dummy data (replace with API data later)
  const topRiders = [
    { rank: 1, name: "Aditi Sharma", points: 120 },
    { rank: 2, name: "Rohit Mehta", points: 105 },
    { rank: 3, name: "Priya Nair", points: 98 },
    { rank: 4, name: "Arjun Verma", points: 90 },
    { rank: 5, name: "Kavya Singh", points: 85 },
  ];

  const getRankIndicator = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-400" />;
    return <span className="font-medium text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <Card className="mb-8 border-0 shadow-none bg-transparent">
        <CardHeader className="text-center px-0">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Top Riders
          </CardTitle>
          <CardDescription className="max-w-md mx-auto pt-2">
            Earn points by joining and hosting parties. See you at the top! 🏆
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topRiders.map((rider) => (
                <TableRow key={rider.rank} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center justify-center h-full">
                      {getRankIndicator(rider.rank)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rider.name}</TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {rider.points}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Floating Host (+) button */}
      <HostButton />
    </div>
  );
}
