import Link from "next/link";
import { Plus } from "lucide-react";

export default function HostButton() {
  return (
    <div className="fixed bottom-10 right-4 sm:right-6 group z-[60]">
      <Link
        href="/hostparty"
        className="flex items-center justify-center w-20 h-20 bg-black rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300"
      >
        <Plus className="w-10 h-10 text-white" />
      </Link>
      <div className="absolute bottom-1/2 right-full mr-4 flex translate-y-1/2 items-center px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Host Ride
      </div>
    </div>
  );
}