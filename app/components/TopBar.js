"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import { Button } from "flowbite-react";

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800"> Scrabble </h1>

        <div className="flex gap-3 items-center">
          {!user ? (
            <>
              <Link href="/user/signin">
                <Button color="blue" size="sm">
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/user/register">
                <Button color="gray" size="sm">
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
              <span className="text-gray-600">
                Witaj, {user.displayName || user.email}
              </span>
              <Link href="/user/signout">
                <Button color="failure" size="sm">
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