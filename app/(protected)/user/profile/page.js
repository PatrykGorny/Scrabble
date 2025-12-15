"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Button, Label, TextInput, Card, Alert, Spinner } from "flowbite-react";
import Link from "next/link";
import { FaKey, FaSave } from "react-icons/fa";

export default function ProfileForm() {
  const { user, nickname, updateNickname } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [userNickname, setUserNickname] = useState("");

  // Pola adresowe
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Pobierz dane użytkownika z Auth i Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        // Dane z Authentication
        setDisplayName(user.displayName || "");
        setPhotoURL(user.photoURL || "");

        // Dane z Firestore
        try {
          const docRef = doc(db, "users", user.uid);
          const snapshot = await getDoc(docRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            setUserNickname(data.nickname || "");
            if (data.address) {
              setCity(data.address.city || "");
              setStreet(data.address.street || "");
              setZipCode(data.address.zipCode || "");
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Błąd pobierania danych: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Aktualizacja profilu w Authentication
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });

      // Aktualizacja danych w Firestore
      await setDoc(doc(db, "users", user.uid), {
        nickname: userNickname,
        address: {
          city: city,
          street: street,
          zipCode: zipCode,
        },
      }, { merge: true });

      // Aktualizuj nickname w kontekście
      await updateNickname(userNickname);

      setSuccess("Profil został zaktualizowany!");
      console.log("Profile and address updated");
    } catch (err) {
      if (err.code === "permission-denied") {
        setError("Brak uprawnień do zapisu danych!");
      } else {
        setError("Błąd: " + err.message);
      }
      console.error(err);
    }
  };

  if (!user) {
    return <div className="text-center p-8">Ładowanie...</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Profil użytkownika</h2>

        {/* Zdjęcie profilowe */}
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
            <Label htmlFor="nickname" value="Pseudonim" />
            <TextInput
              id="nickname"
              type="text"
              value={userNickname}
              onChange={(e) => setUserNickname(e.target.value)}
              placeholder="Twój pseudonim w grach"
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

          <Link href="/user/changepassword">
            <Button
              color="gray"
              className="w-full flex items-center justify-center gap-2"
            >
              <FaKey size={16} />
              Zmień hasło
            </Button>
          </Link>

          {/* Sekcja adresu */}
          <div className="border-t pt-4 mt-2">
            <h3 className="text-lg font-semibold mb-3">Adres</h3>

            <div className="mb-3">
              <Label htmlFor="street" value="Ulica" />
              <TextInput
                id="street"
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="ul. Przykładowa 1"
              />
            </div>

            <div className="mb-3">
              <Label htmlFor="city" value="Miasto" />
              <TextInput
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Kraków"
              />
            </div>

            <div>
              <Label htmlFor="zipCode" value="Kod pocztowy" />
              <TextInput
                id="zipCode"
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="00-000"
              />
            </div>
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

          <div className="flex gap-3">
            <Button
              type="submit"
              color="blue"
              className="flex items-center justify-center gap-2"
            >
              <FaSave size={16} />
              Zaktualizuj profil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
