'use client'; // "use client" tells Next.js to run this component on the browser (client-side)

import Link from "next/link";
import Navbar from "@/components/navabr"
import PartyCard from "@/components/PartyCard"
import { Button } from "@/components/ui/button";

export default function Home() {

  return (
    <div className="min-h-screen bg-indigo-50 p-5">
      <Navbar></Navbar>
      <h1>Welcome to meetriders!</h1>

      <div className="flex flex-row justify-evenly w-[100%]  items-center">
        <div className="flex flex-row justify-around gap-6 bg-rose-500 h-[80vh] w-full rounded-xl w-[1200px] p-12 ">
          <PartyCard />
          <PartyCard />
          <PartyCard />
        </div>
        <Button
  className="fixed bottom-8 right-8 z-50 rounded-full w-14 h-14 text-3xl font-bold bg-black text-white shadow-xl hover:bg-gray-800 transition-all"
  onClick={() => alert('Create Party popup coming soon!')}
>
  +
</Button>
      </div>
      
    </div>
  );
}
