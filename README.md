# Polish Scrabble Online

A web-based implementation of Scrabble adapted for Polish language rules, built with Next.js and Firebase.

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Lobby System**: Create and join game lobbies with real-time updates
- **Polish Scrabble Rules**:
  - Polish letter distribution and point values
  - Proper tile bag management (counts instead of arrays for efficiency)
  - Game ends when tile bag is empty and a player cannot draw to 7 tiles
- **Real-time Gameplay**: Live game state synchronization with Firestore
- **Responsive Design**: Dark-themed UI with Tailwind CSS and Flowbite components
- **Game Features**:
  - Place tiles on the board
  - Word validation (placeholder - integrate with Polish dictionary API)
  - Scoring with bonus squares
  - Turn-based gameplay
  - Surrender option
- **Multi-browser Support**: Play from multiple devices/browsers
- **Automated Testing**: Playwright tests for key functionalities

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React
- **Styling**: Tailwind CSS, Flowbite React
- **Backend**: Firebase (Authentication, Firestore)
- **Testing**: Playwright
- **Linting**: ESLint
- **Build Tool**: Next.js with Turbopack

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:

   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore
   - Copy your Firebase config to `app/lib/firebase.js`

4. Configure environment variables (if needed):
   - Update any API keys or configurations

## Usage

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Register/Login to access the game

4. Create or join a lobby from the Scrabble section

5. Play the game following Polish Scrabble rules

## Game Rules (Polish Adaptation)

- Standard Scrabble rules with Polish letter set
- 15x15 board with bonus squares
- Players draw 7 tiles initially
- Place words horizontally or vertically
- Score based on letter values and bonus squares
- Game continues until tile bag is empty
- When bag is empty, if a player has fewer than 7 tiles, the game ends
- Winner is the player with the highest score

## Project Structure

```
project/
├── app/
│   ├── (protected)/          # Auth-protected routes
│   │   ├── scrabble/
│   │   │   ├── game/[id]/    # Game page
│   │   │   ├── lobby/        # Lobby list and detail
│   │   │   └── ...
│   ├── (public)/             # Public routes (signin, register)
│   ├── components/           # Reusable components
│   ├── lib/                  # Utilities and Firebase config
│   └── globals.css
├── tests/                    # Playwright tests
├── playwright.config.js
└── package.json
```

## Testing

Run the test suite:

```bash
npx playwright test
```

Run tests in UI mode:

```bash
npx playwright test --ui
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Known Issues / TODO

- Word validation is placeholder - integrate with Polish dictionary API
- Add more comprehensive game validation
- Implement chat functionality
- Add game statistics and history

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Based on traditional Scrabble game rules
- Adapted for Polish language by [Your Name]
- Built with modern web technologies
