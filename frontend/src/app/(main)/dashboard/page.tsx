"use client";

import HostButton from "@/components/ui/hostbutton";
import DashboardHeader from "./components/DashboardHeader";
import RidesList from "./components/RidesList";
import LoadingScreen from "./components/LoadingScreen";
import SoiList from "./components/SoiList";
import { useDashboard } from "./hooks/useDashboard";

export default function HomePage() {
  const { welcomeName, isLoading } = useDashboard();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6">
      <HostButton />

      <DashboardHeader
        welcomeName={welcomeName}
      />

      <div className="mt-6 space-y-10">
        <RidesList />

        <div>
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">Upcoming Rides (SOI)</h2>
          <SoiList />
        </div>
      </div>
    </div>
  );
}