import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { StoreInitializer } from "@/components/store-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeetRiders",
  description: "Meet and ride together",
};

export default function RootLayout({
    children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <StoreInitializer />
        <ThemeProvider>
          <div className="min-h-screen">
            <main>{children}</main>
          <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
