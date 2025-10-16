'use client';

import Sidebar from "@/components/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar overlays content on the left */}
      <Sidebar />
      {/* Main Content; add left padding equal to collapsed width to avoid content underlap */}
      <main className="relative flex-1 pl-16 pr-4">
        <div className="h-full">
          {children}
        </div>
      </main>
      {/* Expired parties moved to a dedicated page */}
    </div>
  );
}
