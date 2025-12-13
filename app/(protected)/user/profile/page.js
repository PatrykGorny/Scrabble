"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/app/lib/AuthContext";
import { Button, Label, TextInput, Card, Alert } from "flowbite-react";

export default function ProfileForm() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Wypełnij formularz danymi użytkownika
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });
      setSuccess("Profil został zaktualizowany!");
      console.log("Profile updated");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  if (!user) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profil użytkownika</h2>

        {/* Zdjęcie profilowe - warunkowe renderowanie */}
        {user.photoURL && (
          <div className="flex justify-center mb-4">
            <img
              src={user.photoURL}
              alt="Zdjęcie profilowe"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="displayName" value="Nazwa wyświetlana" />
            <TextInput
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Twoja nazwa"
            />
          </div>

          <div>
            <Label htmlFor="email" value="Email" />
            <TextInput
              id="email"
              type="email"
              value={user.email || ""}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="photoURL" value="URL zdjęcia profilowego" />
            <TextInput
              id="photoURL"
              type="url"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {/* Alert z błędem */}
          {error && (
            <Alert color="failure">
              <span className="font-medium">Błąd!</span> {error}
            </Alert>
          )}

          {/* Alert z sukcesem */}
          {success && (
            <Alert color="success">
              <span className="font-medium">Sukces!</span> {success}
            </Alert>
          )}

          <Button type="submit" color="blue">
            Zaktualizuj profil
          </Button>
        </form>
      </Card>
    </div>
  );
}