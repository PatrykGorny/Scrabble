"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { Card } from "flowbite-react";

export default function VerifyEmail() {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Zapisz email przed wylogowaniem
    if (user) {
      setUserEmail(user.email);
      // Automatyczne wylogowanie
      signOut(auth);
    }
  }, [user]);

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Weryfikuj swój adres email
        </h2>
        <p className="text-gray-600 text-center">
          Wysłaliśmy wiadomość weryfikacyjną na adres:
        </p>
        <p className="text-blue-600 font-semibold text-center my-4">
          {userEmail}
        </p>
        <p className="text-gray-600 text-center text-sm">
          Kliknij w link weryfikacyjny w emailu, aby aktywować swoje konto.
        </p>
      </Card>
    </div>
  );
}