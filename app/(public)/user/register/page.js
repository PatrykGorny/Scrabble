"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { Button, Label, TextInput, Card, Alert } from "flowbite-react";
import { FaUserPlus } from "react-icons/fa";
import Link from "next/link";

export default function RegisterForm() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const router = useRouter();

  // Jeśli użytkownik jest zalogowany, nie pokazuj formularza
  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegisterError("");

    // Walidacja haseł
    if (password !== confirmPassword) {
      setRegisterError("Hasła nie są identyczne!");
      return;
    }

    if (password.length < 6) {
      setRegisterError("Hasło musi mieć minimum 6 znaków!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User registered!");

      // Wysłanie emaila weryfikacyjnego
      await sendEmailVerification(userCredential.user);
      console.log("Email verification sent!");

      // Przekierowanie do strony weryfikacji
      router.push("/user/verify");
    } catch (error) {
      // Obsługa różnych błędów Firebase
      if (error.code === "auth/email-already-in-use") {
        setRegisterError("Ten adres email jest już zarejestrowany!");
      } else if (error.code === "auth/invalid-email") {
        setRegisterError("Nieprawidłowy adres email!");
      } else if (error.code === "auth/weak-password") {
        setRegisterError("Hasło jest zbyt słabe!");
      } else {
        setRegisterError("Błąd rejestracji: " + error.message);
      }
      console.dir(error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Rejestracja</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Wpisz swój email"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" value="Hasło" />
            <TextInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wpisz hasło"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" value="Potwierdź hasło" />
            <TextInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz hasło"
              required
            />
          </div>

          {/* Alert z błędem */}
          {registerError && (
            <Alert color="failure">
              <span className="font-medium">Błąd!</span> {registerError}
            </Alert>
          )}

          <Button
            type="submit"
            color="blue"
            className="flex items-center justify-center gap-2"
          >
            <FaUserPlus size={16} />
            Zarejestruj się
          </Button>
        </form>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Masz już konto?{" "}
          <Link
            href="/user/signin"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Zaloguj się
          </Link>
        </p>
      </Card>
    </div>
  );
}
