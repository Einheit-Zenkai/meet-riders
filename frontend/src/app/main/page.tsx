import Image from "next/image";
import Navbar from "@/components/navabr";

export default function Home() {
  return (
   <><div className="bg-green-500 min-h-screen"><Navbar /><h1 className="text-red-500 font-bold underline ">
      Hello world!
    </h1></div></>
  )
}