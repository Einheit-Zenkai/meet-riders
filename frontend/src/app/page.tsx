import Link from "next/link";
import Navbar from "@/components/navabr"

export default function Home() {

  return (
    <div className="min-h-screen bg-indigo-50 p-5">

      <Navbar />

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-700 tracking-tight">Meetriders</h1>
        <nav className="space-x-6">
          <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 transition">
            Profile
          </Link>
          <Link href="/logout" className="text-red-500 hover:text-red-700 transition">
            Logout
          </Link>
        </nav>
      </header>

      <main>
        <div className="bg-white rounded-xl shadow-md max-w-2xl mx-auto p-8">
          <h2 className="text-2xl font-medium text-gray-800 mb-3">
            Welcome to Meetriders, Meat your rides now!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Find ride partners from your university, reduce travel costs and enjoy your rides!
          </p>


        </div>
      </main>
    </div>
  );
}
