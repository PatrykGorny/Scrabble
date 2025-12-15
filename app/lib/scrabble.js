// Polski alfabet Scrabble z wartościami punktów
export const POLISH_TILES = {
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
  Ź: { count: 1, points: 9 },
  Ż: { count: 1, points: 5 },
  _: { count: 2, points: 0 }, // blank
};

// Rozmiar planszy
export const BOARD_SIZE = 15;

// Tworzenie puli płytek
export function createTileBag() {
  const tiles = [];
  Object.entries(POLISH_TILES).forEach(([letter, { count }]) => {
    for (let i = 0; i < count; i++) {
      tiles.push(letter);
    }
  });
  // Tasowanie
  return tiles.sort(() => Math.random() - 0.5);
}

// Losowanie liter dla gracza
export function drawTiles(tileBag, count = 7) {
  const drawn = [];
  for (let i = 0; i < count && tileBag.length > 0; i++) {
    drawn.push(tileBag.pop());
  }
  return drawn;
}

// Obliczanie punktów za słowo
export function calculateWordScore(word, multipliers = []) {
  let score = 0;
  word.forEach((letter, index) => {
    const letterPoints = POLISH_TILES[letter]?.points || 0;
    const multiplier = multipliers[index] || 1;
    score += letterPoints * multiplier;
  });
  return score;
}
