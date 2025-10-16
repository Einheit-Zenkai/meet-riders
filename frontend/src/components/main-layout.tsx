'use client';

import Sidebar from "@/components/sidebar";
import MobileTabBar from "@/components/mobile-tab-bar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (hidden on mobile) */}
      <div className="hidden sm:block z-[70]">
        <Sidebar />
      </div>
      {/* Main Content; add left padding equal to collapsed width to avoid content underlap */}
      <main className="relative flex-1 pl-16 pr-4">
        <div className="h-full">
          {children}
        </div>
      </main>
      {/* Mobile bottom navigation */}
      <div className="sm:hidden">
        <MobileTabBar />
      </div>
      {/* Expired parties moved to a dedicated page */}
    </div>
  );
}
