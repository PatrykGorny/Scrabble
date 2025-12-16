"use client";

import React from "react";

const ScrabbleBoard = ({
  board,
  currentMove,
  selectedTile,
  onTilePlace,
  onTileRemove,
}) => {
  // Funkcja określająca typ pola (do kolorów)
  const getCellType = (x, y) => {
    if (x === 7 && y === 7) return "start";
    const tripleWord = [
      [0, 0],
      [0, 7],
      [0, 14],
      [7, 0],
      [7, 14],
      [14, 0],
      [14, 7],
      [14, 14],
    ];
    if (tripleWord.some(([a, b]) => a === x && b === y)) return "TW";
    const doubleWord = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [1, 13],
      [2, 12],
      [3, 11],
      [4, 10],
      [13, 1],
      [12, 2],
      [11, 3],
      [10, 4],
      [13, 13],
      [12, 12],
      [11, 11],
      [10, 10],
    ];
    if (doubleWord.some(([a, b]) => a === x && b === y)) return "DW";
    const tripleLetter = [
      [1, 5],
      [1, 9],
      [5, 1],
      [5, 5],
      [5, 9],
      [5, 13],
      [9, 1],
      [9, 5],
      [9, 9],
      [9, 13],
      [13, 5],
      [13, 9],
    ];
    if (tripleLetter.some(([a, b]) => a === x && b === y)) return "TL";
    const doubleLetter = [
      [0, 3],
      [0, 11],
      [2, 6],
      [2, 8],
      [3, 0],
      [3, 7],
      [3, 14],
      [6, 2],
      [6, 6],
      [6, 8],
      [6, 12],
      [7, 3],
      [7, 11],
      [8, 2],
      [8, 6],
      [8, 8],
      [8, 12],
      [11, 0],
      [11, 7],
      [11, 14],
      [12, 6],
      [12, 8],
      [14, 3],
      [14, 11],
    ];
    if (doubleLetter.some(([a, b]) => a === x && b === y)) return "DL";
    return "normal";
  };

  const renderCell = (x, y) => {
    const key = `${x}-${y}`;
    const placedTile = board[key];
    const currentTile = currentMove.find(
      (tile) => tile.x === x && tile.y === y
    );
    const cellType = getCellType(x, y);

    // Kolory — bardziej subtelne, bez nadmiaru kontrastu
    const cellClasses = {
      normal: "bg-[#c7a87d]", // beżowo-brązowy
      DW: "bg-[#f6c3c3]", // jasnoróżowy
      TW: "bg-[#f07d7d]", // ciemniejszy róż
      DL: "bg-[#d0e6ff]", // jasnoniebieski
      TL: "bg-[#a0cfff]", // niebieski
      start: "bg-[#ffe58f]", // złoty (pole startowe)
    };

    const bgClass = cellClasses[cellType] || cellClasses.normal;

    return (
      <div
        key={`${x}-${y}`}
        style={{ width: "var(--cell-size)", height: "var(--cell-size)" }}
        className={`border border-gray-500 flex items-center justify-center relative ${bgClass} text-gray-800 shadow-sm cursor-pointer transition-all hover:scale-[1.02]`}
        onClick={() => {
          if (currentTile) {
            const index = currentMove.findIndex(
              (tile) => tile.x === x && tile.y === y
            );
            onTileRemove(index);
          } else if (!placedTile && selectedTile) {
            onTilePlace(x, y);
          }
        }}
      >
        {/* Stały kafelek (już położony) */}
        {placedTile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: "calc(var(--cell-size) - 0.5rem)",
                height: "calc(var(--cell-size) - 0.5rem)",
              }}
              className="rounded-sm bg-[#fdf5e6] border border-gray-400 shadow-inner flex flex-col items-center justify-center text-gray-900 font-bold text-sm"
            >
              {placedTile}
            </div>
          </div>
        )}

        {/* Tymczasowy kafelek (w trakcie ruchu) */}
        {currentTile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              style={{
                width: "calc(var(--cell-size) - 0.5rem)",
                height: "calc(var(--cell-size) - 0.5rem)",
              }}
              className="rounded-sm bg-white border-2 border-blue-500 shadow-md flex flex-col items-center justify-center text-blue-700 font-bold text-sm animate-pulse"
            >
              {currentTile.letter}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="inline-block bg-gradient-to-br from-amber-900 to-amber-800 p-3 rounded-xl shadow-2xl overflow-auto scrabble-board">
      <div
        className="grid gap-0 border-4 border-amber-700 rounded-lg"
        style={{
          gridTemplateColumns: "repeat(15, var(--cell-size))",
          gridTemplateRows: "repeat(15, var(--cell-size))",
          background: "#d0b49f",
        }}
      >
        {Array.from({ length: 15 }, (_, y) =>
          Array.from({ length: 15 }, (_, x) => renderCell(x, y))
        )}
      </div>
    </div>
  );
};

export default ScrabbleBoard;
