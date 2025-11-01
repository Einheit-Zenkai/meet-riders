import Link from "next/link";
import { Plus } from "lucide-react";

export default function HostButton() {
  return (
    <div className="fixed bottom-10 right-4 hidden sm:block sm:right-6 group z-[60]">
      <Link
        href="/hostparty"
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 backdrop-blur-xl hover:bg-slate-950/50 hover:border-white/20"
      >
        <Plus className="w-10 h-10 text-white/80" />
      </Link>
      <div className="absolute bottom-1/2 right-full mr-4 flex translate-y-1/2 items-center px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Host Ride
      </div>
    </div>
  );
}