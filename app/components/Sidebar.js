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

export default function Sidebar() {
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
    </aside>
  );
}
