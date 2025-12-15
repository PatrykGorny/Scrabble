"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { Card, Button, Spinner, Badge } from "flowbite-react";

export default function LobbyDetail() {
  const { user, nickname } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const lobbyRef = doc(db, "lobbies", id);
    const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
      if (docSnap.exists()) {
        setLobby({ id: docSnap.id, ...docSnap.data() });
      } else {
        alert("Lobby nie istnieje!");
        router.push("/scrabble/lobby");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, router]);

  const toggleReady = async () => {
    if (!lobby || !user) return;

    const isReady = lobby.players.find(p => p.uid === user.uid)?.ready || false;
    const updatedPlayers = lobby.players.map(p =>
      p.uid === user.uid ? { ...p, ready: !isReady } : p
    );

    try {
      await updateDoc(doc(db, "lobbies", id), {
        players: updatedPlayers,
      });
    } catch (err) {
      console.error("Error updating ready status:", err);
    }
  };

  const startGame = async () => {
    if (!lobby || lobby.ownerId !== user.uid) return;

    // Potwierdzenie
    if (!window.confirm("Czy na pewno chcesz rozpocząć grę? Wszyscy gracze muszą być gotowi.")) return;

    // Sprawdź czy wszyscy są gotowi (tylko jeśli więcej niż 1 gracz)
    const allReady = lobby.players.every(p => p.ready);
    if (lobby.players.length > 1 && !allReady) {
      alert("Nie wszyscy gracze są gotowi!");
      return;
    }

    try {
      // Inicjalizuj grę
      const gameData = {
        lobbyId: id,
        players: lobby.players,
        currentPlayer: 0,
        board: {}, // Pusta plansza jako object, klucze "x-y"
        scores: lobby.players.map(p => ({ uid: p.uid, score: 0 })),
        status: "playing",
        startedAt: serverTimestamp(),
        // Losuj 7 liter dla każdego gracza z polskiego alfabetu
        playerTiles: lobby.players.map(p => ({
          uid: p.uid,
          tiles: drawTiles(7)
        })),
        moves: [],
      };

      await updateDoc(doc(db, "lobbies", id), {
        status: "playing",
        gameData,
      });

      router.push(`/scrabble/game/${id}`);
    } catch (err) {
      console.error("Error starting game:", err);
      alert("Błąd rozpoczynania gry: " + err.message);
    }
  };

  const leaveLobby = async () => {
    if (!lobby || !user) return;

    const updatedPlayers = lobby.players.filter(p => p.uid !== user.uid);

    try {
      if (updatedPlayers.length === 0) {
        // Jeśli ostatni gracz, usuń lobby
        await deleteDoc(doc(db, "lobbies", id));
        router.push("/scrabble/lobby");
      } else {
        // Jeśli właściciel wychodzi, przekaż własność pierwszemu graczowi
        let updateData = { players: updatedPlayers };
        if (lobby.ownerId === user.uid) {
          updateData.ownerId = updatedPlayers[0].uid;
          updateData.ownerNickname = updatedPlayers[0].nickname;
        }
        await updateDoc(doc(db, "lobbies", id), updateData);
        router.push("/scrabble/lobby");
      }
    } catch (err) {
      console.error("Error leaving lobby:", err);
    }
  };

  // Funkcja do losowania liter z polskiego alfabetu
  const drawTiles = (count) => {
    const polishAlphabet = "AĄBCĆDEĘFGHIJKLŁMNŃOÓPQRSŚTUVWXYZŻŹ";
    const tiles = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * polishAlphabet.length);
      tiles.push(polishAlphabet[randomIndex]);
    }
    return tiles;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!lobby) return null;

  const isOwner = lobby.ownerId === user.uid;
  const currentPlayer = lobby.players.find(p => p.uid === user.uid);
  const isReady = currentPlayer?.ready || false;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lobby: {lobby.name}</h1>
        <Button color="red" onClick={leaveLobby}>
          Opuść Lobby
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-bold mb-4">Gracze ({lobby.players.length}/{lobby.maxPlayers})</h3>
            <div className="space-y-2">
              {lobby.players.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{player.nickname}</span>
                    {lobby.ownerId === player.uid && (
                      <Badge color="blue">Właściciel</Badge>
                    )}
                  </div>
                  <Badge color={player.ready ? "success" : "warning"}>
                    {player.ready ? "Gotowy" : "Oczekuje"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Status</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status lobby:</p>
                <Badge color={lobby.status === "waiting" ? "success" : "warning"}>
                  {lobby.status === "waiting" ? "Oczekuje na graczy" : "W grze"}
                </Badge>
              </div>

              {!isOwner && (
                <Button
                  color={isReady ? "gray" : "green"}
                  onClick={toggleReady}
                  className="w-full"
                >
                  {isReady ? "Niegotowy" : "Gotowy"}
                </Button>
              )}

              {isOwner && (
                <Button
                  color="blue"
                  onClick={startGame}
                  disabled={lobby.players.length < 1 || (lobby.players.length > 1 && !lobby.players.every(p => p.ready))}
                  className="w-full"
                >
                  Rozpocznij Grę
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}