import Link from "next/link";
import { Plus } from "lucide-react";

export default function HostButton() {
  return (
    <div className="fixed bottom-10 right-10 group z-50">
      <Link
        href="/hostparty"
        className="flex items-center justify-center w-16 h-16 bg-black rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300"
      >
        <Plus className="w-8 h-8 text-white" />
      </Link>
      <div className="absolute bottom-1/2 transform translate-y-1/2 right-20 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Host Ride
      </div>
    </div>
  );
}