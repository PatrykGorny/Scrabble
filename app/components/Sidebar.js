"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import { FaHome, FaUser, FaSignInAlt, FaUserPlus, FaKey, FaSignOutAlt, FaNewspaper } from "react-icons/fa";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Menu</h2>
      </div>

      <nav className="space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
        >
          <FaHome size={20} />
          <span>Strona główna</span>
        </Link>

        {!user ? (
          <>
           
          </>
        ) : (
          <>
            <Link 
              href="/user/profile" 
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
            >
              <FaUser size={20} />
              <span>Profil</span>
            </Link>
               <Link 
              href="/scrabble" 
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
            >
              <FaUser size={20} />
              <span>Scrabble</span>
            </Link>
  
            <Link 
              href="/user/changepassword" 
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
            >
              <FaKey size={20} />
              <span>Zmień hasło</span>
            </Link>

          </>
        )}
      </nav>
    </aside>
  );
}