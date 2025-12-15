"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchNickname(user.uid);
      } else {
        setNickname(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchNickname = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setNickname(data.nickname || generateRandomNickname());
      } else {
        const randomNick = generateRandomNickname();
        await setDoc(doc(db, "users", uid), { nickname: randomNick });
        setNickname(randomNick);
      }
    } catch (err) {
      console.error("Error fetching nickname:", err);
      setNickname(generateRandomNickname());
    }
  };

  const updateNickname = async (newNickname) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), { nickname: newNickname }, { merge: true });
      setNickname(newNickname);
    } catch (err) {
      console.error("Error updating nickname:", err);
    }
  };

  const generateRandomNickname = () => {
    const adjectives = ["Szybki", "Mądry", "Śmiały", "Cichy", "Głośny", "Zielony", "Niebieski"];
    const nouns = ["Lis", "Wilk", "Orzeł", "Kot", "Pies", "Słoń", "Lew"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, nickname, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);