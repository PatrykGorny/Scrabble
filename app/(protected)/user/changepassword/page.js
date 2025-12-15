"use client";

import { useState } from "react";
import { updatePassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button, Label, TextInput, Card, Alert } from "flowbite-react";
import { FaKey } from "react-icons/fa";

export default function ChangePasswordPage() {
  const auth = getAuth();
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Nowe hasła nie są identyczne.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Nowe hasło musi mieć co najmniej 6 znaków.");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Użytkownik nie jest uwierzytelniony.");
        setLoading(false);
        return;
      }

      await updatePassword(user, newPassword);
      setSuccess("Hasło zostało pomyślnie zmienione!");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/user/profile");
      }, 2000);
    } catch (error) {
      setError(error.message || "Nie udało się zmienić hasła.");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Zmień hasło</h2>

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="newPassword" value="Nowe hasło" />
            <TextInput
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Podaj nowe hasło"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" value="Potwierdź nowe hasło" />
            <TextInput
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Powtórz nowe hasło"
              required
            />
          </div>

          {error && (
            <Alert color="failure">
              <span className="font-medium">Błąd!</span> {error}
            </Alert>
          )}

          {success && <Alert color="success">{success}</Alert>}

          <Button
            type="submit"
            disabled={loading}
            color="blue"
            className="flex items-center justify-center gap-2"
          >
            <FaKey size={16} />
            {loading ? "Aktualizowanie..." : "Zaktualizuj hasło"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
