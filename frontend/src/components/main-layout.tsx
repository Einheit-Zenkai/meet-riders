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
      <main className="flex-1 pl-16 relative">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
