import Link from "next/link";
import Sidebar from "@/components/sidebar";

export default function HostPartyPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Back button at the top left */}
        <Link href="/" className="inline-block mb-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors font-medium">
          ← Back
        </Link>
        {/* Content placeholder */}
        <h1 className="text-2xl font-bold text-gray-800">Host a Party</h1>
      </div>
    </div>
  );
}
