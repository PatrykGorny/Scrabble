"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Card, Button, Spinner, Badge, TextInput, Label } from "flowbite-react";

export default function ScrabbleLobby() {
  const { user, nickname } = useAuth();
  const router = useRouter();
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [lobbyName, setLobbyName] = useState("");

  // Subskrypcja do lobbies
  useEffect(() => {
    const q = query(collection(db, "lobbies"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lobbiesData = [];
      snapshot.forEach((doc) => {
        lobbiesData.push({ id: doc.id, ...doc.data() });
      });
      setLobbies(lobbiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Tworzenie lobby
  const createLobby = async () => {
    if (!lobbyName.trim()) return;

    try {
      const lobbyRef = await addDoc(collection(db, "lobbies"), {
        name: lobbyName,
        ownerId: user.uid,
        ownerNickname: nickname,
        players: [{ uid: user.uid, nickname: nickname, ready: true }],
        maxPlayers: 4,
        status: "waiting",
        createdAt: serverTimestamp(),
      });

      setLobbyName("");
      setShowCreateForm(false);
      router.push(`/scrabble/lobby/${lobbyRef.id}`);
    } catch (err) {
      console.error("Error creating lobby:", err);
      alert("Błąd tworzenia lobby!");
    }
  };

  // Dołączanie do lobby
  const joinLobby = async (lobby) => {
    if (lobby.players.length >= lobby.maxPlayers) {
      alert("Lobby jest pełne!");
      return;
    }

    if (lobby.players.some((p) => p.uid === user.uid)) {
      router.push(`/scrabble/lobby/${lobby.id}`);
      return;
    }

    try {
      await updateDoc(doc(db, "lobbies", lobby.id), {
        players: arrayUnion({ uid: user.uid, nickname: nickname, ready: false }),
      });
      router.push(`/scrabble/lobby/${lobby.id}`);
    } catch (err) {
      console.error("Error joining lobby:", err);
      alert("Błąd dołączania: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scrabble - Lobby</h1>
        <Button color="blue" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Anuluj" : "Utwórz Lobby"}
        </Button>
      </div>

      {/* Formularz tworzenia lobby */}
      {showCreateForm && (
        <Card className="mb-6">
          <h3 className="text-xl font-bold mb-4">Utwórz nowe lobby</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="lobbyName">Nazwa lobby</Label>
              <TextInput
                id="lobbyName"
                value={lobbyName}
                onChange={(e) => setLobbyName(e.target.value)}
                placeholder="Wpisz nazwę..."
              />
            </div>
            <Button color="blue" onClick={createLobby} className="self-end">
              Utwórz
            </Button>
          </div>
        </Card>
      )}

      {/* Lista lobby */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lobbies.length === 0 ? (
          <Card>
            <p className="text-gray-600 text-center">
              Brak dostępnych lobby. Utwórz nowe!
            </p>
          </Card>
        ) : (
          lobbies.map((lobby) => (
            <Card key={lobby.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold">{lobby.name}</h3>
                  <p className="text-sm text-gray-600">
                    Właściciel: {lobby.ownerNickname}
                  </p>
                </div>
                <Badge
                  color={lobby.status === "waiting" ? "success" : "warning"}
                >
                  {lobby.status === "waiting" ? "Oczekuje" : "W grze"}
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  Gracze: {lobby.players.length}/{lobby.maxPlayers}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {lobby.players.map((player, idx) => (
                    <Badge key={idx} color="gray">
                      {player.nickname}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                color="blue"
                onClick={() => joinLobby(lobby)}
                disabled={
                  lobby.status !== "waiting" ||
                  lobby.players.length >= lobby.maxPlayers
                }
              >
                {lobby.players.some((p) => p.uid === user.uid)
                  ? "Wejdź"
                  : "Dołącz"}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
