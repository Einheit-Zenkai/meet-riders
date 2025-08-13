import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Sidebar from "@/components/sidebar"; // This is YOUR component, preserved.
import HostButton from "@/components/ui/hostbutton"; // This is YOUR component, preserved.
import { PartyProvider } from "@/context/PartyContext"; // This is the ONLY addition.

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetRiders",
  description: "Meet and ride together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* We wrap your existing components with the PartyProvider */}
        <PartyProvider>
        
          {/* YOUR COMPONENTS ARE STILL HERE AND UNTOUCHED */}
          <Sidebar />
          <HostButton />

          <main className="ml-16">
            {children}
          </main>
          
        </PartyProvider>
      </body>
    </html>
  );
}