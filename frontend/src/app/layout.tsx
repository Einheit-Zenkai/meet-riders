import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


import Sidebar from "@/components/sidebar";
import HostButton from "@/components/ui/hostbutton";

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
        
        <Sidebar />
        <HostButton />

        <main className="ml-16">
          {children}
        </main>
        
      </body>
    </html>
  );
}