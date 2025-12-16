"use client";

import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import {
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaKey,
  FaSignOutAlt,
  FaNewspaper,
  FaGamepad,
} from "react-icons/fa";

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user } = useAuth();
  const [currentGameId, setCurrentGameId] = useState(null);

  useEffect(() => {
    if (!user) {
      setCurrentGameId(null);
      return;
    }

    const q = query(
      collection(db, "lobbies"),
      where("players", "array-contains", { uid: user.uid }),
      where("status", "==", "playing")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const game = snapshot.docs[0];
        setCurrentGameId(game.id);
      } else {
        setCurrentGameId(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const NavContent = (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold"></h2>
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
          <></>
        ) : (
          <>
            <Link
              href="/user/profile"
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
            >
              <FaUser size={20} />
              <span>Profil</span>
            </Link>
            {currentGameId && (
              <Link
                href={`/scrabble/game/${currentGameId}`}
                className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
              >
                <FaGamepad size={20} />
                <span>Aktualna Gra</span>
              </Link>
            )}
            <Link
              href="/scrabble/lobby"
              className="flex items-center gap-3 p-3 rounded hover:bg-gray-700 transition"
            >
              <FaUser size={20} />
              <span>Scrabble</span>
            </Link>
          </>
        )}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-gray-800 text-white min-h-screen p-4">
        {NavContent}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          mobileOpen ? "" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <aside
          className={`fixed left-0 top-0 bottom-0 w-64 bg-gray-800 p-4 transform transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Menu</h2>
            <button
              className="text-white text-xl"
              onClick={() => setMobileOpen(false)}
            >
              ✕
            </button>
          </div>
          {NavContent}
        </aside>
      </div>
    </>
  );
}
