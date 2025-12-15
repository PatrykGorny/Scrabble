"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, Label, TextInput, Card, Alert } from "flowbite-react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();
  const params = useSearchParams();
  const returnUrl = params.get("returnUrl");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await setPersistence(auth, browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        router.push("/user/verify");
        return;
      }

      router.push(returnUrl || "/");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Nie znaleziono użytkownika o podanym adresie email!");
      } else if (err.code === "auth/wrong-password") {
        setError("Nieprawidłowe hasło!");
      } else if (err.code === "auth/invalid-email") {
        setError("Nieprawidłowy format adresu email!");
      } else if (err.code === "auth/user-disabled") {
        setError("To konto zostało zablokowane!");
      } else {
        setError("Błąd logowania: " + err.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Logowanie</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="email"
              aria-label="email"
              vaule={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" value="Hasło" />
            <TextInput
              id="password"
              type="password"
              aria-label="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <Alert color="failure">
              <span className="font-medium">Błąd!</span> {error}
            </Alert>
          )}

          <Button type="submit" color="blue" data-testid="login-submit">
            Zaloguj się
          </Button>
        </form>
      </Card>
    </div>
  );
}
