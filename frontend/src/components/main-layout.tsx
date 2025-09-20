'use client';

import Sidebar from "@/components/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-16 relative">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
