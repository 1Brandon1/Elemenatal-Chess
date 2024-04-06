class Bot {
	constructor(game, colour) {
		this.game = game
		this.colour = colour
	}

	makeRandomMove() {
		if (this.game.currentTurn === this.colour && !this.game.gameOver) {
			const allMoves = this.game.getAllMoves(this.colour)
			if (allMoves.length === 0) throw new Error('No valid moves')
			const randomIndex = Math.floor(Math.random() * allMoves.length)
			const squares = allMoves[randomIndex]
			const fromCoord = squares[0]
			const toCoord = squares[1]
			this.game.chessboard.move(fromCoord, toCoord)
		}
	}
}
