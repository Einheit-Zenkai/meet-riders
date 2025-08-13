// src/components/Sidebar.tsx

import Link from "next/link";
import { User, Settings, Home, Users } from "lucide-react";

// Make sure you have lucide-react installed:
// npm install lucide-react

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 h-full w-16 bg-gray-900 text-white flex flex-col items-center py-4 space-y-6 shadow-lg">
      {/* Logo / Home */}
      <Link href="/" className="hover:text-orange-500">
        <Home size={24} />
      </Link>

      {/* Profile */}
      <Link href="/profile" className="hover:text-orange-500">
        <User size={24} />
      </Link>

      {/* Parties */}
      <Link href="/my-parties" className="hover:text-orange-500">
        <Users size={24} />
      </Link>

      {/* Settings */}
      <Link href="/settings" className="hover:text-orange-500 mt-auto mb-4">
        <Settings size={24} />
      </Link>
    </div>
  );
}