import Link from "next/link";
import Navbar from "@/components/navabr"
import PartyCard from "@/components/PartyCard"

export default function Home() {

  return (
    <div className="min-h-screen bg-indigo-50 p-5">
      <Navbar></Navbar>
      <h1>Welcome to meetriders!</h1>

      <div className="flex flex-row justify-evenly w-[100%]  items-center">
        <div className="flex flex-col justify-around gap-3 bg-green-600 h-[80vh] rounded-xl w-[640px] p-12 ">
          <PartyCard />
          <PartyCard />
          <PartyCard />
        </div>
      </div>

    </div>
  );
}
