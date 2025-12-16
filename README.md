# Polish Scrabble Online

A web-based implementation of Scrabble adapted for Polish language rules.

🎮 **[Play Live](https://scrabble-game.example.com)**

## Features

- User authentication and lobby system
- Polish letter distribution and scoring
- Real-time multiplayer gameplay
- Word validation with Polish dictionary
- Responsive dark-themed interface
- Turn-based gameplay with surrender option

## Quick Start

1. Clone and install:
   ```bash
   git clone <repository-url>
   cd project
   npm install
   ```

2. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Add your config to `app/lib/firebase.js`

3. Run locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Game Rules

Standard Scrabble rules adapted for Polish:
- 15×15 board with bonus squares
- 7 tiles per player
- Words placed horizontally or vertically
- Game ends when tile bag is empty

## Testing

```bash
npm install --save-dev @playwright/test
npx playwright install
npx playwright test
```

## License

MIT License
