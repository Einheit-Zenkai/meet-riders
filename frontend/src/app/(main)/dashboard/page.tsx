"use client";

import HostButton from "@/components/ui/hostbutton";
import DashboardHeader from "./components/DashboardHeader";
import RidesList from "./components/RidesList";
import LoadingScreen from "./components/LoadingScreen";
import SoiList from "./components/SoiList";
import { useDashboard } from "./hooks/useDashboard";

export default function HomePage() {
  const {
    welcomeName,
    isLoading,
    orderedParties,
    refreshParties,
    destinationQuery,
    setDestinationQuery,
    timeWindowMins,
    setTimeWindowMins,
    sameDepartment,
    setSameDepartment,
    sameYear,
    setSameYear,
  } = useDashboard();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6">
      <HostButton />
      
      <DashboardHeader
        welcomeName={welcomeName}
        destinationQuery={destinationQuery}
        onDestinationQueryChange={setDestinationQuery}
        timeWindowMins={timeWindowMins}
        onTimeWindowChange={setTimeWindowMins}
        sameDepartment={sameDepartment}
        onSameDepartmentChange={setSameDepartment}
        sameYear={sameYear}
        onSameYearChange={setSameYear}
      />

      <RidesList 
        parties={orderedParties} 
        onPartyUpdate={refreshParties}
      />

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-card-foreground mb-4">Upcoming Rides (SOI)</h2>
        <SoiList />
      </div>
    </div>
  );
}