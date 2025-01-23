"use client"
import Image from "next/image";

export default function Home() {
    function change(){
        window.location.href = "/login";
    }
  return (
      <div className="flex flex-col items-center justify-center min-h-screen">
          <button className="w-40 h-10 bg-red-500 rounded-3xl" onClick={change}>
              Login
          </button>
      </div>
  );
}
