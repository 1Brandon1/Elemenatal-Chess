# Chess?

Welcome to Chess?, a dynamic and innovative variant of the classic game of chess!

## Introduction

Chess? introduces exciting new elements such as power-ups, special abilities, and dynamic board features, enhancing strategic depth and player engagement. This project aims to reimagine traditional chess, providing a thrilling gaming experience for players of all skill levels.

## Setup Guide

To start playing Chess?, follow these simple steps:

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/your-username/Chess-Remade.git
    ```

2. Navigate to the project directory:

    ```bash
    cd Chess-Remade
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

6. Enjoy playing Chess? with your friends or against the computer!

## Rules

### 1. Game Setup

-   Starts the same as normal chess.

### 2. Piece Upgrades

-   **Pawns:** Upgrade to **Squires** after capturing one pieces, allowing them to move one square left, right, or forward and diagonally forward.
-   **Bishops:** Upgrade to **Cardinals** after capturing two pieces, gaining the ability to move like a knight.
-   **Knights:** Upgrade to **Dragons** after capturing two pieces, gaining the ability to move one square diagonally.
-   **Rooks:** Upgrade to **Wardens** after capturing three pieces, gaining the ability to move like a knight.
-   **Queens:** Upgrade to **Archons** after capturing three pieces, gaining combined movement of a knight.

### 3. King

-   The king retains standard movement capabilities.

### 4. Victory Conditions

-   Win by achieving checkmate.
-   Draw if stalemate occurs or if a player has no legal moves and their king is not in check.

### 5. Other Rules

-   There is no time limit for games.
-   Castling, en passant, and pawn promotion follow standard chess rules.
-   Traditional chess rules apply.
