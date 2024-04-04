class Game {
	constructor() {
		// Initialize game variables
		this.chessboard = new Chessboard()
		this.gameState = this.chessboard.boardArray120

		this.moveSound = new Audio('/assets/sounds/move.mp3')
		this.captureSound = new Audio('/assets/sounds/capture.mp3')

		this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		// this.startPosition = this.getRandomFEN()
		this.currentTurn = 'white'
		this.gameOver = false
		this.movesHistory = []
		this.undoneMoves = []

		// Bind squareClicked function to the current instance
		this.squareClicked = this.squareClicked.bind(this)
		this.selectedSquare = null
		this.validMoves = []
	}

	getRandomFEN() {
		// Generate random piece placement for White
		let blackPieces = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']
		for (let i = blackPieces.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[blackPieces[i], blackPieces[j]] = [blackPieces[j], blackPieces[i]]
		}
		let fen = blackPieces.join('') + '/pppppppp/8/8/8/8/PPPPPPPP/'
		let whitePieces = blackPieces
			.map((piece) => {
				return piece.toUpperCase()
			})
			.join('')
		fen += whitePieces
		return fen
	}

	start() {
		this.movesHistory = []
		this.undoneMoves = []
		this.chessboard.draw(this.startPosition)
	}

	//!-------------- Event Handling Methods --------------

	// Handle square click events
	squareClicked(event) {
		const square = event.currentTarget
		if (!this.selectedSquare) {
			this.firstClick(square)
		} else {
			if (square === this.selectedSquare) {
				this.resetSquareSelection()
			} else if (this.isPiecesTurn(square)) {
				this.resetSquareSelection()
				this.firstClick(square)
			} else {
				this.secondClick(square)
			}
		}
	}

	// Actions on first click
	firstClick(square) {
		this.selectedSquare = square
		const piece = this.selectedSquare.querySelector('.piece')
		if (this.isPiecesTurn(this.selectedSquare)) {
			this.validMoves = this.getValidMoves(piece.id, parseInt(this.selectedSquare.getAttribute('index120')))
		}
		this.chessboard.highlightSquares(this.validMoves)
		this.selectedSquare.classList.add('clickedSquare')
	}

	// Actions on second click
	secondClick(square) {
		if (this.isPiecesTurn(this.selectedSquare) && this.isMoveInValidMoves(square)) {
			const fromCoord = this.selectedSquare.getAttribute('coordinate')
			const toCoord = square.getAttribute('coordinate')
			const piece = this.chessboard.getSquarePieceObj(fromCoord)
			const capturedPiece = this.getCapturedPiece(toCoord)
			this.chessboard.move(fromCoord, toCoord)
			if (capturedPiece) {
				this.captureSound.play()
			} else {
				this.moveSound.play()
			}
			const move = new Move(piece, fromCoord, toCoord, capturedPiece)
			this.movesHistory.push(move)
			this.resetSquareSelection()
			this.switchTurn()
			this.undoneMoves = []
		}
	}

	//!-------------- Move Related Methods --------------

	// Undo the last move
	undo() {
		if (this.movesHistory.length === 0) {
			console.log('No moves to undo.')
			return
		}
		const lastMove = this.movesHistory.pop()
		const fromCoord = lastMove.toCoord
		const toCoord = lastMove.fromCoord
		const capturedPiece = lastMove.capturedPiece
		this.chessboard.move(fromCoord, toCoord)
		if (capturedPiece) this.chessboard.place(capturedPiece, fromCoord)
		if (capturedPiece) {
			this.captureSound.play()
		} else {
			this.moveSound.play()
		}
		this.switchTurn() // Revert turn change
		this.undoneMoves.push(lastMove) // Store undone move
	}

	// Redo the last undone move
	redo() {
		if (this.undoneMoves.length === 0) {
			console.log('No moves to redo.')
			return
		}
		const lastUndoneMove = this.undoneMoves.pop()
		const fromCoord = lastUndoneMove.fromCoord
		const toCoord = lastUndoneMove.toCoord
		this.chessboard.move(fromCoord, toCoord)
		if (lastUndoneMove.capturedPiece) {
			this.captureSound.play()
		} else {
			this.moveSound.play()
		}
		this.movesHistory.push(lastUndoneMove) // Restore move to history
		this.switchTurn() // Restore turn change
	}

	// Print move history
	printMoveHistory() {
		if (this.movesHistory.length === 0) {
			return 'No moves have been made yet.'
		} else {
			let historyString = 'Move History:\n'
			this.movesHistory.forEach((move, index) => {
				historyString += `${index + 1}. ${move.toChessNotation()} (${move.toString()})\n`
			})
			return historyString
		}
	}

	//!-------------- Utility Methods --------------

	// Switch turn between players
	switchTurn() {
		this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white'
		console.log(this.printMoveHistory())
	}

	// Method to shuffle an array
	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	// Reset square selection and valid moves
	resetSquareSelection() {
		if (this.selectedSquare) {
			this.selectedSquare.classList.remove('clickedSquare')
			this.chessboard.unhighlightSquares(this.validMoves)
			this.selectedSquare = null
			this.validMoves = []
		}
	}

	// Get captured piece at the destination square
	getCapturedPiece(toCoord) {
		const pieceAtDestination = this.chessboard.getSquarePieceHtml(toCoord)
		return pieceAtDestination ? pieceAtDestination.id : null
	}

	// Check if the clicked square contains the current player's piece
	isPiecesTurn(square) {
		const piece = square.querySelector('.piece')
		return piece && piece.classList.contains(this.currentTurn)
	}

	// Check if the move is within valid moves
	isMoveInValidMoves(square) {
		const toSquare = square.getAttribute('index120')
		return this.validMoves.includes(parseInt(toSquare))
	}

	//!-------------- Move validation Methods --------------

	getValidMoves(piece, currentPosition) {
		const colour = piece === piece.toUpperCase() ? 'white' : 'black'
		const pieceType = piece.toLowerCase()
		// prettier-ignore
		switch (pieceType) {
			case 'p': return this.getPawnMoves(currentPosition, colour)
			case 'n': return this.getKnightOrKingMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21])
			case 'b': return this.getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11])
			case 'r': return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10])
			case 'q': return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11])
			case 'k': return this.getKnightOrKingMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11])
			default: return [] // No valid moves for unknown pieces
		}
	}

	getKnightOrKingMoves(currentPosition, colour, offsets) {
		let validMoves = []
		for (let offset of offsets) {
			const newPosition = currentPosition + offset
			if (this.chessboard.isBoardIndex(newPosition) && !this.chessboard.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
			}
		}
		return validMoves
	}

	getPawnMoves(currentPosition, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startingRank = colour === 'white' ? 8 : 3
		const offsets = [10 * dir]
		let validMoves = []
		if (Math.floor(currentPosition / 10) === startingRank) offsets.push(20 * dir)
		for (let offset of offsets) {
			const newPosition = currentPosition + offset
			if (this.chessboard.isBoardIndex(newPosition) && !this.chessboard.isOccupied(newPosition)) {
				validMoves.push(newPosition)
			}
		}
		const captureOffsets = [9 * dir, 11 * dir]
		for (let offset of captureOffsets) {
			const newPosition = currentPosition + offset
			if (this.chessboard.isBoardIndex(newPosition) && this.chessboard.isOccupiedByOpponent(newPosition, colour)) {
				validMoves.push(newPosition)
			}
		}
		return validMoves
	}

	getSlidingMoves(currentPosition, colour, offsets) {
		let validMoves = []
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			while (this.chessboard.isBoardIndex(newPosition) && !this.chessboard.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
				if (this.chessboard.isOccupiedByOpponent(newPosition, colour)) break
				newPosition += offset
			}
		}
		return validMoves
	}
}

class Move {
	constructor(piece, fromCoord, toCoord, capturedPiece = null) {
		this.piece = piece
		this.fromCoord = fromCoord
		this.toCoord = toCoord
		this.capturedPiece = capturedPiece
	}

	//!-------------- String Conversion Methods --------------

	// Convert move to string representation
	toString() {
		let moveString = `${this.piece} from ${this.fromCoord} to ${this.toCoord}`
		if (this.capturedPiece) moveString += `, capturing ${this.capturedPiece}`
		return moveString
	}

	// Convert move to chess notation
	toChessNotation() {
		const pieceNotation = this.piece
		const toNotation = this.toCoord
		let moveNotation = pieceNotation
		if (this.capturedPiece) moveNotation += 'x'
		moveNotation += toNotation
		return moveNotation
	}
}

// Sample implementation to show how the game would be initialized and started
const game = new Game()
game.start()
