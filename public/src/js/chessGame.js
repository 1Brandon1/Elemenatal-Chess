class Game {
	constructor() {
		// Initialize game variables
		this.chessboard = new Chessboard()
		this.gameState = this.chessboard.boardArray120
		// this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		this.startPosition = this.generateRandomFEN()
		this.currentTurn = 'white'
		this.gameOver = false
		this.movesHistory = []
		this.undoneMoves = []

		// Bind squareClicked function to the current instance
		this.squareClicked = this.squareClicked.bind(this)
		this.selectedSquare = null
		this.validMoves = []
	}

	generateRandomFEN() {
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

	// Method to shuffle an array
	shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[array[i], array[j]] = [array[j], array[i]]
		}
		return array
	}

	start() {
		this.movesHistory = []
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
		this.generateValidMoves()
	}

	// Actions on second click
	secondClick(square) {
		if (this.isPiecesTurn(this.selectedSquare) && this.isMoveInValidMoves(square)) {
			const fromCoord = this.selectedSquare.getAttribute('coordinate')
			const toCoord = square.getAttribute('coordinate')
			const piece = this.selectedSquare.querySelector('.piece').id
			const capturedPiece = this.getCapturedPiece(toCoord)
			this.chessboard.move(fromCoord, toCoord)
			const move = new Move(piece, fromCoord, toCoord, capturedPiece)
			this.movesHistory.push(move)
			this.resetSquareSelection()
			this.switchTurn()
		}
	}

	//!-------------- Move Related Methods --------------

	// Find valid moves for the selected piece
	generateValidMoves() {
		const piece = this.selectedSquare.querySelector('.piece')
		if (this.isPiecesTurn(this.selectedSquare)) {
			this.validMoves = getValidMoves(piece.id, parseInt(this.selectedSquare.getAttribute('index120')))
			this.chessboard.highlightSquares(this.validMoves)
			this.selectedSquare.classList.add('clickedSquare')
		}
	}

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
		const capturedPiece = lastUndoneMove.capturedPiece
		this.chessboard.move(fromCoord, toCoord)
		if (capturedPiece) this.chessboard.place(capturedPiece, fromCoord)
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
		this.chessboard.orient(this.currentTurn)
		console.log(this.printMoveHistory())
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
		const pieceAtDestination = this.chessboard.getPieceOnSquare(toCoord)
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

// Initialize and draw the game board
const game = new Game()
const board = game.chessboard
game.start()

//? TESTS
// board.place('D', 'c5')
// board.move('c5', 'b2')
// console.log(board.boardArray120)

// board.place('P', 'a5')
// board.place('B', 'c5')
// board.place('N', 'e5')
// board.place('R', 'g5')
// board.place('Q', 'h5')

// board.place('S', 'a4')
// board.place('C', 'c4')
// board.place('D', 'e4')
// board.place('W', 'g4')
// board.place('A', 'h4')
