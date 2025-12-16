"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import { Button } from "flowbite-react";
import { FaSignInAlt, FaUserPlus, FaSignOutAlt, FaBars } from "react-icons/fa";

export default function TopBar({ setMobileOpen }) {
  const { user } = useAuth();

  return (
    <header className="bg-gray-800 text-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Otwórz menu"
          >
            <FaBars />
          </button>
          <h1 className="text-xl font-bold"> Scrabble </h1>
        </div>

        <div className="flex gap-3 items-center">
          {!user ? (
            <>
              <Link href="/user/signin">
                <Button
                  color="blue"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaSignInAlt size={14} />
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/user/register">
                <Button
                  color="gray"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaUserPlus size={14} />
                  Zarejestruj się
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Zdjęcie profilowe - warunkowe renderowanie */}
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profil"
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <span className="text-white">
                Witaj, {user.displayName || user.email}
              </span>
              <Link href="/user/signout">
                <Button
                  color="failure"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FaSignOutAlt size={14} />
                  Wyloguj
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
