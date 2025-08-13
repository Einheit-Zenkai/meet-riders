// src/components/Sidebar.tsx

import Link from "next/link";
import { User, Settings, Home, Users } from "lucide-react";

// Make sure you have lucide-react installed:
// npm install lucide-react

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-sidebar text-foreground flex flex-col items-center py-4 space-y-6 shadow-lg">
      {/* Logo / Home */}
      <Link href="/" className="hover:text-primary">
      <Home size={24} />
      </Link>

      {/* Profile */}
      <Link href="/profile" className="hover:text-primary">
      <User size={24} />
      </Link>

      {/* Parties */}
      <Link href="/my-parties" className="hover:text-primary">
      <Users size={24} />
      </Link>

      {/* Settings */}
      <Link href="/settings" className="hover:text-primary mt-auto mb-4">
      <Settings size={24} />
      </Link>
    </div>
  );
}