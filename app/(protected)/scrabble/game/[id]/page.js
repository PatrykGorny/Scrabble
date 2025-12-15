"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/lib/AuthContext";
import { db } from "@/app/lib/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import { Card, Button, Spinner, Badge } from "flowbite-react";
import ScrabbleBoard from "@/app/components/ScrabbleBoard";
import { POLISH_TILES, drawTiles } from "@/app/lib/scrabble";

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
      (sum, tile) => sum + (POLISH_TILES[tile.letter]?.points || 0),
      0
    );
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
        console.warn(
          `Attempted to use letter "${letter}" ${countNeeded} times but have only ${countInHand} in hand.`
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
    const pseudoWord = currentMove.map((t) => t.letter).join("");
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
    let updatedBag = gameData.remainingTiles;
    if (needed > 0) {
      const { drawn, newBag } = drawTiles(gameData.remainingTiles, needed);
      updatedPlayerTiles = [...updatedPlayerTiles, ...drawn];
      updatedBag = newBag;
    }

    const updatedScores = gameData.scores.map((s) =>
      s.uid === user.uid ? { ...s, score: s.score + points } : s
    );

    // Sprawdź czy gra się kończy (worek pusty i gracz nie ma 7 liter)
    let gameStatus = "playing";
    let winner = null;
    const totalRemaining = Object.values(updatedBag).reduce(
      (sum, c) => sum + c,
      0
    );
    if (totalRemaining === 0 && updatedPlayerTiles.length < 7) {
      gameStatus = "ended";
      winner = updatedScores.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
    }

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
        "gameData.status": gameStatus,
        ...(winner && { "gameData.winner": winner }),
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
      <div className="flex justify-center items-center  bg-gray-900 text-white">
        <Spinner size="xl" color="info" />
      </div>
    );
  }

  if (!lobby) return null;

  const gameData = lobby.gameData;

  if (gameData.status === "ended") {
    const winner = gameData.winner;
    const winnerPlayer = lobby.players.find((p) => p.uid === winner.uid);
    const winnerName = winnerPlayer
      ? winnerPlayer.displayName || winnerPlayer.nickname || winnerPlayer.uid
      : winner.uid;
    return (
      <div className=" bg-gray-900 text-gray-100  flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Gra zakończona!
          </h2>
          <p className="text-center mb-4">
            Zwycięzca: <strong>{winnerName}</strong> z {winner.score} punktami.
          </p>
          <div className="text-center">
            <Button color="blue" onClick={() => router.push("/scrabble/lobby")}>
              Powrót do lobby
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentPlayerIndex = gameData.currentPlayer;
  const isCurrentPlayer = lobby.players[currentPlayerIndex]?.uid === user.uid;
  const playerTiles =
    gameData.playerTiles.find((pt) => pt.uid === user.uid)?.tiles || [];
  const remainingTilesCount = Object.values(
    gameData.remainingTiles || {}
  ).reduce((sum, c) => sum + c, 0);

  // Obliczenie, ile razy dana litera jest użyta w obecnym ruchu
  const usedInCurrentMove = currentMove.reduce((acc, t) => {
    acc[t.letter] = (acc[t.letter] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className=" bg-gray-900 text-gray-100 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
        {/* Nagłówek (niezmieniony) */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white tracking-wide">
              Scrabble <span className="text-blue-500">Online</span>
            </h1>
            <Badge color="light" className="text-gray-900">
              Worek: {remainingTilesCount} liter
            </Badge>
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
          <div className="flex-1 flex justify-center items-center bg-gray-800/50 p-2 rounded-xl border border-gray-700 shadow-xl max-h-[75vh] max-w-[38vw]">
            {/* Wrapper, który zapewni kwadratowy kształt planszy w dostępnym miejscu */}
            <div className="aspect-square w-full h-full max-w-[100%] ">
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
                            {player.displayName ||
                              player.nickname ||
                              player.uid}
                          </span>
                          {isActive && (
                            <Badge color="light" className="text-gray-900">
                              Ruch
                            </Badge>
                          )}
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
                    const totalInHand = playerTiles.filter(
                      (l) => l === letter
                    ).length;
                    const usedOnBoard = usedInCurrentMove[letter] || 0;
                    const isFullyUsed = usedOnBoard >= totalInHand;
                    const isSelected = selectedTile === letter;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isFullyUsed && !isSelected) return;
                          setSelectedTile(isSelected ? null : letter);
                        }}
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
                          {POLISH_TILES[letter]?.points}
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
                    disabled={!currentMove.length || isValidating}
                    className="w-full font-bold shadow-blue-900/50 shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2 w-full">
                      {isValidating && <Spinner size="sm" color="info" />}
                      <span>
                        Zatwierdź ruch ({calculatePoints(currentMove)} pkt)
                      </span>
                    </div>
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
