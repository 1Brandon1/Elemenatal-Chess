# Elemental Chess

Welcome to Elemental Chess, a dynamic and innovative variant of the classic game of chess! Elemental Chess introduces new pieces with unique abilities alongside the standard chess pieces, enhancing strategic depth and player engagement. This project aims to reimagine traditional chess, providing a thrilling gaming experience for players of all skill levels.

## New Pieces and Their Abilities

1. **Fire Mage**:

    - Moves like a bishop but can also move two squares in any direction.
    - **Special Ability**: Can "burn" a piece directly in front of it (horizontally, vertically, or diagonally) once per game, removing that piece from the board.

2. **Water Mage**:

    - Moves like a rook but can also move two squares in any direction.
    - **Special Ability**: Can "freeze" a piece in any adjacent square, immobilizing it for one turn. This ability can be used twice per game.

3. **Earth Golem**:

    - Moves like a knight but can also move one square in any direction.
    - **Special Ability**: Can "fortify" an adjacent piece, making it immune to capture for one turn. This ability can be used twice per game.

4. **Air Spirit**:
    - Moves like a queen but can only move up to three squares in any direction.
    - **Special Ability**: Can "teleport" to any unoccupied square once per game.

## Setup

-   The new pieces are placed in specific positions, while the rest of the board is set up as in standard chess.
-   Positions:
    -   Fire Mage on f1 (White) and f8 (Black)
    -   Water Mage on h1 (White) and h8 (Black)
    -   Earth Golem on b1 (White) and b8 (Black)
    -   Air Spirit on d1 (White) and d8 (Black)

## Rules

1. **Piece Movement and Capture**:

    - Standard pieces (king, queen, rook, bishop, knight, and pawns) move and capture as usual.
    - New pieces move and capture according to their descriptions above.

2. **Special Abilities**:

    - Each special ability can be activated on the player’s turn instead of making a move with the piece.
    - Abilities have limited uses, as described above.

3. **Check and Checkmate**:

    - Check and checkmate rules remain the same as in standard chess.
    - Special abilities can be used to escape check if applicable (e.g., Air Spirit teleporting).

4. **Pawn Promotion**:

    - In addition to promoting to a queen, rook, bishop, or knight, pawns can also promote to any of the new pieces (Fire Mage, Water Mage, Earth Golem, Air Spirit).

5. **Special Ability Use**:
    - Players announce the use of a special ability and its target.
    - The game resumes after the ability is resolved.

## Setup Guide

To start playing Elemental Chess, follow these simple steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/your-username/Elemental-Chess.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Elemental-Chess
    ```

3. Install Node.js dependencies using npm:

    ```bash
    npm install
    ```

4. Start the local server using Express.js:

    ```bash
    npm start
    ```

5. Open your web browser and navigate to `http://localhost:3000` to launch the game.

6. Enjoy playing Elemental Chess with your friends or against the computer!
