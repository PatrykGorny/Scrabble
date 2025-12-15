"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchDisplayName(user);
      } else {
        setDisplayName(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchDisplayName = async (user) => {
    try {
      const uid = user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      // Priority: auth.displayName > firestore.displayName > firestore.nickname (backwards compat) > random
      if (user.displayName) {
        // ensure stored
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.displayName !== user.displayName) {
            await setDoc(
              userDocRef,
              { displayName: user.displayName },
              { merge: true }
            );
          }
        } else {
          await setDoc(userDocRef, { displayName: user.displayName });
        }
        setDisplayName(user.displayName);
        return;
      }

      if (userDoc.exists()) {
        const data = userDoc.data();
        const name =
          data.displayName || data.nickname || generateRandomNickname();
        if (!data.displayName) {
          await setDoc(userDocRef, { displayName: name }, { merge: true });
        }
        setDisplayName(name);
      } else {
        const randomName = generateRandomNickname();
        await setDoc(userDocRef, { displayName: randomName });
        setDisplayName(randomName);
      }
    } catch (err) {
      console.error("Error fetching displayName:", err);
      setDisplayName(generateRandomNickname());
    }
  };

  const updateDisplayName = async (newDisplayName) => {
    if (!user) return;
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { displayName: newDisplayName },
        { merge: true }
      );
      setDisplayName(newDisplayName);
    } catch (err) {
      console.error("Error updating displayName:", err);
    }
  };

  const generateRandomNickname = () => {
    const adjectives = [
      "Szybki",
      "Mądry",
      "Śmiały",
      "Cichy",
      "Głośny",
      "Zielony",
      "Niebieski",
    ];
    const nouns = ["Lis", "Wilk", "Orzeł", "Kot", "Pies", "Słoń", "Lew"];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${noun}${num}`;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, displayName, updateDisplayName }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
