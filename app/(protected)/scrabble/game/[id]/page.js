"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import ScrabbleBoard from "@/app/components/ScrabbleBoard";

// 1. Definicja polskiego rozkładu liter i punktacji
const TILE_CONFIG = {
  A: { count: 9, points: 1 },
  Ą: { count: 1, points: 5 },
  B: { count: 2, points: 3 },
  C: { count: 3, points: 2 },
  Ć: { count: 1, points: 6 },
  D: { count: 3, points: 2 },
  E: { count: 7, points: 1 },
  Ę: { count: 1, points: 5 },
  F: { count: 1, points: 5 },
  G: { count: 2, points: 3 },
  H: { count: 2, points: 3 },
  I: { count: 8, points: 1 },
  J: { count: 2, points: 3 },
  K: { count: 3, points: 2 },
  L: { count: 3, points: 2 },
  Ł: { count: 2, points: 3 },
  M: { count: 3, points: 2 },
  N: { count: 5, points: 1 },
  Ń: { count: 1, points: 7 },
  O: { count: 6, points: 1 },
  Ó: { count: 1, points: 5 },
  P: { count: 3, points: 2 },
  R: { count: 4, points: 1 },
  S: { count: 4, points: 1 },
  Ś: { count: 1, points: 5 },
  T: { count: 3, points: 2 },
  U: { count: 2, points: 3 },
  W: { count: 4, points: 1 },
  Y: { count: 4, points: 2 },
  Z: { count: 5, points: 1 },
  Ż: { count: 1, points: 5 },
  Ź: { count: 1, points: 9 },
  _: { count: 2, points: 0 }, // Blanki (opcjonalnie)
};

export default function ScrabbleGame() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [lobby, setLobby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTile, setSelectedTile] = useState(null);
  const [currentMove, setCurrentMove] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const lobbyRef = doc(db, "lobbies", id);
    const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status !== "playing") {
          router.push(`/scrabble/lobby/${id}`);
          return;
        }

        // Inicjalizacja worka liter, jeśli go nie ma
        if (!data.gameData.remainingTiles) {
          const initialBag = [];
          Object.entries(TILE_CONFIG).forEach(([letter, config]) => {
            for (let i = 0; i < config.count; i++) initialBag.push(letter);
          });
          // Mieszanie
          for (let i = initialBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [initialBag[i], initialBag[j]] = [initialBag[j], initialBag[i]];
          }
          // Uwaga: To jest optymalne, jeśli plansza jest tworzona po raz pierwszy
          // Możesz usunąć ten updateDoc po wdrożeniu pełnej logiki startu gry
          updateDoc(lobbyRef, { "gameData.remainingTiles": initialBag });
        }

        setLobby({ id: docSnap.id, ...data });
      } else {
        alert("Gra nie istnieje!");
        router.push("/scrabble/lobby");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id, router]);

  // --- LOGIKA GRY (NIEZMIENIONA W STOSUNKU DO POPRZEDNIEJ ODPOWIEDZI) ---

  const validateWordInDictionary = async (word) => {
    // Placeholder - zastąp przez API słownika
    console.log(`Sprawdzam w słowniku: ${word}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (word.toUpperCase() === "XYZ") resolve(false);
        resolve(true);
      }, 500);
    });
  };

  const calculatePoints = (tiles) => {
    return tiles.reduce(
      (sum, tile) => sum + (TILE_CONFIG[tile.letter]?.points || 0),
      0
    );
  };

  const drawTilesFromBag = (currentBag, countNeeded) => {
    if (!currentBag || currentBag.length === 0)
      return { newTiles: [], updatedBag: [] };

    const tilesToDraw = Math.min(countNeeded, currentBag.length);
    const newTiles = currentBag.slice(0, tilesToDraw);
    const updatedBag = currentBag.slice(tilesToDraw);

    return { newTiles, updatedBag };
  };

  const submitMove = async () => {
    if (!lobby || !currentMove.length) return;
    setIsValidating(true);

    const gameData = lobby.gameData;
    const playerTiles =
      gameData.playerTiles.find((pt) => pt.uid === user.uid)?.tiles || [];
    const remainingTilesBag = gameData.remainingTiles || [];

    // A. Walidacja posiadania liter (Strict Mode: limit użycia)
    const moveCounts = currentMove.reduce((acc, t) => {
      acc[t.letter] = (acc[t.letter] || 0) + 1;
      return acc;
    }, {});

    for (const [letter, countNeeded] of Object.entries(moveCounts)) {
      const countInHand = playerTiles.filter((t) => t === letter).length;
      if (countInHand < countNeeded) {
        alert(
          `Błąd: Użyłeś litery "${letter}" ${countNeeded} razy, a masz ją tylko ${countInHand} razy. Nie możesz przekroczyć limitu liter!`
        );
        setIsValidating(false);
        return;
      }
    }

    // B. Walidacja pozycji (Start od środka)
    if (gameData.moves.length === 0) {
      const hasCenter = currentMove.some((t) => t.x === 7 && t.y === 7);
      if (!hasCenter) {
        alert("Pierwszy ruch musi przechodzić przez środek planszy (złote)!");
        setIsValidating(false);
        return;
      }
    }

    // C. Walidacja słownikowa
    const pseudoWord = currentMove.map((t) => t.letter).join(""); // Uproszczenie!
    const isWordValid = await validateWordInDictionary(pseudoWord);

    if (!isWordValid) {
      alert(`Słowo "${pseudoWord}" nie znajduje się w słowniku!`);
      setIsValidating(false);
      return;
    }

    // D. Obliczenia i aktualizacja stanu
    const points = calculatePoints(currentMove);
    const updatedBoard = { ...gameData.board };
    currentMove.forEach((tile) => {
      updatedBoard[`${tile.x}-${tile.y}`] = tile.letter;
    });

    let updatedPlayerTiles = [...playerTiles];
    // Usuń użyte
    Object.entries(moveCounts).forEach(([letter, count]) => {
      for (let i = 0; i < count; i++) {
        const idx = updatedPlayerTiles.indexOf(letter);
        if (idx > -1) updatedPlayerTiles.splice(idx, 1);
      }
    });

    // Dobierz nowe z worka
    const needed = 7 - updatedPlayerTiles.length;
    const { newTiles, updatedBag } = drawTilesFromBag(
      remainingTilesBag,
      needed
    );
    updatedPlayerTiles = [...updatedPlayerTiles, ...newTiles];

    const updatedScores = gameData.scores.map((s) =>
      s.uid === user.uid ? { ...s, score: s.score + points } : s
    );

    const newMoveEntry = {
      player: user.uid,
      tiles: currentMove,
      points,
      timestamp: Date.now(),
    };

    try {
      await updateDoc(doc(db, "lobbies", id), {
        "gameData.moves": [...gameData.moves, newMoveEntry],
        "gameData.board": updatedBoard,
        "gameData.scores": updatedScores,
        "gameData.remainingTiles": updatedBag,
        "gameData.playerTiles": gameData.playerTiles.map((pt) =>
          pt.uid === user.uid
            ? { uid: user.uid, tiles: updatedPlayerTiles }
            : pt
        ),
        "gameData.currentPlayer":
          (gameData.currentPlayer + 1) % lobby.players.length,
      });
      setCurrentMove([]);
    } catch (err) {
      console.error("Error submitting move:", err);
      alert("Błąd zapisu ruchu.");
    } finally {
      setIsValidating(false);
    }
  };

  const surrender = async () => {
    if (!lobby || !user) return;
    const updatedPlayers = lobby.players.filter((p) => p.uid !== user.uid);
    try {
      if (updatedPlayers.length < 1) {
        await deleteDoc(doc(db, "lobbies", id));
      } else {
        await updateDoc(doc(db, "lobbies", id), {
          players: updatedPlayers,
          "gameData.playerTiles": lobby.gameData.playerTiles.filter(
            (pt) => pt.uid !== user.uid
          ),
          "gameData.scores": lobby.gameData.scores.filter(
            (s) => s.uid !== user.uid
          ),
        });
      }
      router.push("/scrabble/lobby");
    } catch (err) {
      console.error(err);
    }
  };

  // --- WIZUALIZACJA ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <Spinner size="xl" color="info" />
      </div>
    );
  }

  if (!lobby) return null;

  const gameData = lobby.gameData;
  const currentPlayerIndex = gameData.currentPlayer;
  const isCurrentPlayer = lobby.players[currentPlayerIndex]?.uid === user.uid;
  const playerTiles =
    gameData.playerTiles.find((pt) => pt.uid === user.uid)?.tiles || [];
  const remainingTilesCount = gameData.remainingTiles?.length || 0;

  // Obliczenie, ile razy dana litera jest użyta w obecnym ruchu
  const usedInCurrentMove = currentMove.reduce((acc, t) => {
    acc[t.letter] = (acc[t.letter] || 0) + 1;
    return acc;
  }, {});

  return (
    // Użycie min-h-screen i p-4/p-8 z oryginalnego kodu, ale w połączeniu z elastycznym układem
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Nagłówek (niezmieniony) */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Scrabble <span className="text-blue-500">Online</span>
            </h1>
            <Badge color="info">Worek: {remainingTilesCount} liter</Badge>
          </div>
          <Button
            color="failure"
            size="sm"
            onClick={() => {
              if (
                confirm(
                  "Czy na pewno chcesz opuścić grę? Zostanie to uznane za poddanie się."
                )
              ) {
                surrender();
              }
            }}
          >
            Poddaj się / Wyjdź
          </Button>
        </div>

        {/* GŁÓWNY KONTENER GRY - Musi zajmować resztę miejsca (flex-1) */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
          {/* Sekcja Planszy - musi być elastyczna i zajmować dostępną przestrzeń */}
          <div className="flex-1 flex justify-center items-center bg-gray-800/50 p-2 rounded-xl border border-gray-700 shadow-xl min-h-[300px] lg:min-h-0">
            {/* Wrapper, który zapewni kwadratowy kształt planszy w dostępnym miejscu */}
            <div className="aspect-square w-full h-full max-w-[100%] max-h-[100%]">
              <ScrabbleBoard
                board={gameData.board}
                currentMove={currentMove || []}
                selectedTile={selectedTile}
                onTilePlace={(x, y) => {
                  if (!isCurrentPlayer || !selectedTile) return;
                  setCurrentMove((prev) => [
                    ...prev,
                    { letter: selectedTile, x, y },
                  ]);
                  setSelectedTile(null);
                }}
                onTileRemove={(index) => {
                  if (!isCurrentPlayer) return;
                  setCurrentMove((prev) => prev.filter((_, i) => i !== index));
                }}
              />
            </div>
          </div>

          {/* Panel Boczny - ma stałą szerokość */}
          <div className="w-full lg:w-96 flex flex-col gap-6 flex-shrink-0 lg:overflow-y-auto custom-scrollbar">
            {/* Karta Graczy (Ranking) - Przywrócony oryginalny wygląd */}
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <h3 className="text-xl font-bold mb-2 text-white border-b border-gray-700 pb-2">
                Ranking
              </h3>
              <div className="space-y-3">
                {lobby.players.map((player, idx) => {
                  const score =
                    gameData.scores.find((s) => s.uid === player.uid)?.score ||
                    0;
                  const isActive = idx === currentPlayerIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isActive
                          ? "bg-blue-900/40 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          : "bg-gray-700/40 border-gray-600 opacity-80"
                      }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              isActive ? "text-blue-200" : "text-gray-300"
                            }`}
                          >
                            {player.nickname}
                          </span>
                          {isActive && <Badge color="info">Ruch</Badge>}
                        </div>
                        {isActive && isCurrentPlayer && (
                          <span className="text-xs text-blue-300 mt-1">
                            To twój ruch!
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-xl text-white">
                        {score}{" "}
                        <span className="text-sm font-normal text-gray-400">
                          pkt
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Karta: Twoje Litery (Przywrócony oryginalny wygląd) */}
            {isCurrentPlayer ? (
              <Card className="bg-gray-800 border-gray-700 shadow-lg flex-shrink-0">
                <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
                  <h3 className="text-xl font-bold text-white">Twoje litery</h3>
                  <span className="text-xs text-gray-400">
                    Kliknij, aby wybrać
                  </span>
                </div>

                <div className="flex gap-2 justify-center flex-wrap py-2">
                  {playerTiles.map((letter, idx) => {
                    // Liczba instancji tej litery w ręce
                    const totalInHand = playerTiles.filter(
                      (l) => l === letter
                    ).length;
                    // Liczba instancji tej litery użyta w obecnym ruchu
                    const usedOnBoard = usedInCurrentMove[letter] || 0;

                    // Czy wybranie tej litery przekroczy limit?
                    // Jest to prosta wizualizacja. W `submitMove` jest twarda walidacja.
                    const isFullyUsed = usedOnBoard >= totalInHand;
                    const isSelected = selectedTile === letter;

                    return (
                      <button
                        key={idx}
                        // Wizualnie blokujemy TYLKO wtedy, gdy wybrana jest już inna litera i ta konkretna litera jest już wykorzystana.
                        // UWAGA: Trudno jest śledzić pojedyncze kafelki bez unikalnych ID, więc polegamy na ogólnej liczbie.
                        // Lepsza wizualizacja wymagałaby zmiany struktury `playerTiles` na `{ id: string, letter: string }[]`.
                        // Na razie polegamy na logice walidacji w `submitMove`.
                        onClick={() =>
                          setSelectedTile(isSelected ? null : letter)
                        }
                        className={`
                          w-10 h-10 md:w-12 md:h-12 flex flex-col items-center justify-center rounded-md text-lg font-bold shadow-sm transition-transform leading-none
                          ${
                            isSelected
                              ? "bg-blue-600 text-white scale-110 ring-2 ring-blue-400"
                              : "bg-amber-100 text-gray-900 hover:bg-amber-200"
                          }
                          ${
                            isFullyUsed && !isSelected
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                        `}
                      >
                        {letter}
                        <span className="text-[8px] font-normal opacity-70">
                          {TILE_CONFIG[letter]?.points}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ) : (
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 text-center text-gray-400 italic flex-shrink-0">
                Czekaj na swoją turę...
              </div>
            )}

            {/* Przyciski Akcji (Przywrócony oryginalny wygląd) */}
            {isCurrentPlayer && (
              <Card className="bg-gray-800 border-gray-700 shadow-lg flex-shrink-0">
                <div className="space-y-3">
                  <Button
                    color="blue"
                    size="lg"
                    onClick={submitMove}
                    isProcessing={isValidating}
                    disabled={!currentMove.length || isValidating}
                    className="w-full font-bold shadow-blue-900/50 shadow-lg"
                  >
                    Zatwierdź ruch ({calculatePoints(currentMove)} pkt)
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => {
                      setCurrentMove([]);
                      setSelectedTile(null);
                    }}
                    disabled={!currentMove.length || isValidating}
                    className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                  >
                    Cofnij płytki na rękę
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Tu można umieścić Footer, a dzięki flex-grow nie będzie wymagał scrollowania */}
    </div>
  );
}
