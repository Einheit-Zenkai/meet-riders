import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PartyProvider } from "@/context/PartyContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ModeToggle";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/Authcontext";
import Sidebar from "@/components/sidebar";

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <AuthProvider> {/* 👈 wrap entire app with AuthProvider */}
          <PartyProvider>
            <ThemeProvider>
              {/* Global floating controls */}
              <div className="fixed top-4 right-4 z-50">
                <ModeToggle />
              </div>
              <div className="min-h-screen pl-16">
                <main>{children}</main>
              </div>
              <Toaster />
          </ThemeProvider>
          </PartyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
