class Bot {
	constructor(game, colour) {
		this.game = game
		this.colour = colour
		this.pieceValues = {
			p: 1, // Pawn
			n: 3, // Knight
			b: 3, // Bishop
			r: 5, // Rook
			q: 9, // Queen
			f: 5, // Fire Mage
			w: 7, // Water Mage
			e: 5, // Earth Golem
			a: 9, // Air Spirit
			k: Infinity // King
		}
	}

	makeRandomMove() {
		if (this.game.activePlayer === this.colour && !this.game.gameOver) {
			const allMoves = this.game.calculateAllMoves(this.colour)
			if (allMoves.length === 0) throw new Error('No valid moves')
			const squares = allMoves[Math.floor(Math.random() * allMoves.length)]
			this.game.board.move(squares[0], squares[1])
		}
	}

	// Get piece value
	getPieceValue(piece) {
		return this.pieceValues[piece.toLowerCase()] || 0
	}
}
