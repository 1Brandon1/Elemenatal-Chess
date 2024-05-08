class Game {
	constructor() {
		// Initialize game variables
		this.board = new Chessboard(this)
		this.state = this.board.boardArray120

		// Default game settings
		this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		// this.startPosition = 'r1bk3r/p2pBpNp/n4n2/1p1NP2P/6P1/3P4/P1P1K3/q5b1'
		this.currentTurn = 'white'
		this.gameOver = false

		// Bind event handling method
		this.squareClicked = this.squareClicked.bind(this)
		this.selectedSquare = null
		this.validMoves = []
		this.movesHistory = []
		this.undoneMoves = []
	}

	start() {
		this.movesHistory = []
		this.undoneMoves = []
		this.board.draw(this.startPosition)
	}

	//!-------------- Event Handling Methods --------------

	// Handle square click events
	squareClicked(event) {
		const square = event.currentTarget
		if (!this.selectedSquare) {
			this.onFirstClick(square)
		} else {
			if (square === this.selectedSquare) {
				this.resetSquareSelection()
			} else if (this.isPiecesTurn(square)) {
				this.resetSquareSelection()
				this.onFirstClick(square)
			} else {
				this.onSecondClick(square)
			}
		}
	}

	// Actions on first click
	onFirstClick(square) {
		this.selectedSquare = square
		const squareCoord = this.selectedSquare.getAttribute('coordinate')
		const piece = this.board.getSquarePieceObj(squareCoord)
		if (!this.isPiecesTurn(this.selectedSquare)) return
		const squareIndex = parseInt(this.selectedSquare.getAttribute('index120'))
		this.validMoves = this.getValidMoves(piece, squareIndex)
		this.board.highlightSquares(this.validMoves)
		this.selectedSquare.classList.add('clickedSquare')
	}

	// Actions on second click
	onSecondClick(square) {
		if (!this.isPiecesTurn(this.selectedSquare) || !this.isMoveInValidMoves(square)) return
		const fromCoord = this.selectedSquare.getAttribute('coordinate')
		const toCoord = square.getAttribute('coordinate')
		const piece = this.board.getSquarePieceObj(fromCoord)
		let capturedPiece = null
		let capturedCoord = null

		if (this.isEnPassant(toCoord, piece)) {
			const dir = piece.name === piece.name.toUpperCase() ? -1 : 1
			const enPassentCoord = this.board.index120ToCoordinate(this.board.enPassantIndex - 10 * dir)
			capturedPiece = this.getCapturedPiece(enPassentCoord)
			capturedCoord = enPassentCoord
			this.board.enPassant(fromCoord, toCoord)
		} else {
			capturedPiece = this.getCapturedPiece(toCoord)
			if (capturedPiece) capturedCoord = toCoord
			this.board.move(fromCoord, toCoord)
		}

		const move = { piece: piece.name, fromCoord: fromCoord, toCoord: toCoord, capturedPiece: capturedPiece, capturedCoord: capturedCoord }
		this.movesHistory.push(move)
		this.resetSquareSelection()
		this.switchTurn()
		this.undoneMoves = []
	}

	//!-------------- Move Manegment Methods --------------

	// Reset square selection and valid moves
	resetSquareSelection() {
		if (!this.selectedSquare) return
		this.selectedSquare.classList.remove('clickedSquare')
		this.board.unhighlightSquares(this.validMoves)
		this.selectedSquare = null
		this.validMoves = []
	}

	// Switch turn between players
	switchTurn() {
		this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white'
		console.log(this.printMoveHistory())
	}

	undo() {
		if (this.movesHistory.length === 0) return
		const lastMove = this.movesHistory.pop()
		const fromCoord = lastMove.fromCoord
		const toCoord = lastMove.toCoord
		const capturedPiece = lastMove.capturedPiece
		const capturedCoord = lastMove.capturedCoord
		this.board.move(toCoord, fromCoord)
		if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		this.switchTurn()
		this.undoneMoves.push(lastMove)
	}

	// Redo the last undone move
	redo() {
		if (this.undoneMoves.length === 0) return
		const lastUndoneMove = this.undoneMoves.pop()
		const fromCoord = lastUndoneMove.fromCoord
		const toCoord = lastUndoneMove.toCoord
		this.board.move(fromCoord, toCoord)
		this.movesHistory.push(lastUndoneMove)
		this.switchTurn()
	}

	//!-------------- Move Conversion Methods --------------

	// Convert move to a desription (eg. P from d2 to d4)
	moveToString(move) {
		let moveString = `${move.piece} from ${move.fromCoord} to ${move.toCoord}`
		if (move.capturedPiece) moveString += `, capturing ${move.capturedPiece}`
		return moveString
	}

	// Convert move to chess notation
	moveToChessNotation(move) {
		const pieceNotation = move.piece
		const toNotation = move.toCoord
		let moveNotation = pieceNotation
		if (move.capturedPiece) moveNotation += 'x'
		moveNotation += toNotation
		return moveNotation
	}

	//!-------------- Move validation Methods --------------

	// Get valid moves for a piece at a given position
	getValidMoves(piece, currentPosition) {
		const colour = piece.colour
		const pieceType = piece.name.toLowerCase()
		// prettier-ignore
		switch (pieceType) {
			case 'p': return this.getPawnMoves(currentPosition, colour)
			case 'n': return this.getKnightMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21])
			case 'b': return this.getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11])
			case 'r': return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10])
			case 'q': return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11])
			case 'k': return this.getKingMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11])
			case 's': return this.getSquireMoves(currentPosition, colour)
			case 'c': return this.getCardinalMoves(currentPosition, colour)
			case 'd': return this.getKnightMoves(currentPosition, colour, [-21, -19, -12, -11, -9, -8, 8, 9, 11, 12, 19, 21])
			case 'w': return this.getWardenMoves(currentPosition, colour)
			case 'a': return this.getArchonMoves(currentPosition, colour) 
			default: return [] 
		}
	}

	// Get valid moves for a knight and other pieces with similar movement
	getKnightMoves(currentPosition, colour, offsets) {
		const validMoves = []
		for (let offset of offsets) {
			const newPosition = currentPosition + offset
			if (this.board.isBoardIndex(newPosition) && !this.board.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
			}
		}
		return validMoves
	}

	// Get valid moves for a king
	getKingMoves(currentPosition, colour, offsets) {
		const validMoves = []
		for (let offset of offsets) {
			const newPosition = currentPosition + offset
			if (this.board.isBoardIndex(newPosition) && !this.board.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
			}
		}
		return validMoves
	}

	// Get valid moves for a pawn
	getPawnMoves(currentPosition, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startingRank = colour === 'white' ? 8 : 3
		const offsets = [10 * dir]
		const validMoves = []

		// If the pawn is on its starting rank, it can move forward two squares
		if (
			Math.floor(currentPosition / 10) === startingRank &&
			!this.board.isOccupied(currentPosition + 10 * dir) &&
			!this.board.isOccupied(currentPosition + 20 * dir)
		) {
			offsets.push(20 * dir)
		}

		// Check diagonal capture moves and en passant
		const captureOffsets = [9 * dir, 11 * dir]
		for (let offset of captureOffsets) {
			let newPosition = currentPosition + offset
			if (this.board.isBoardIndex(newPosition)) {
				if (this.board.isOccupiedByOpponent(newPosition, colour)) {
					validMoves.push(newPosition)
				} else if (newPosition === this.board.enPassantIndex) {
					validMoves.push(newPosition)
				}
			}
		}

		// Check forward moves
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			if (this.board.isBoardIndex(newPosition) && !this.board.isOccupied(newPosition)) {
				validMoves.push(newPosition)
			}
		}
		return validMoves
	}

	// Get valid sliding moves (bishop, rook, queen)
	getSlidingMoves(currentPosition, colour, offsets) {
		const validMoves = []
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			while (this.board.isBoardIndex(newPosition) && !this.board.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
				if (this.board.isOccupiedByOpponent(newPosition, colour)) break
				newPosition += offset
			}
		}
		return validMoves
	}

	// Get valid moves for a squire
	getSquireMoves(currentPosition, colour) {
		const pawnMoves = this.getPawnMoves(currentPosition, colour)
		return pawnMoves.concat(this.getKingMoves(currentPosition, colour, [-1, 1]))
	}

	// Get valid moves for a cardinal
	getCardinalMoves(currentPosition, colour) {
		return this.getKnightMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21]).concat(
			this.getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11])
		)
	}

	// Get valid moves for a warden
	getWardenMoves(currentPosition, colour) {
		return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10]).concat(
			this.getKnightMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21])
		)
	}

	// Get valid moves for a archon
	getArchonMoves(currentPosition, colour) {
		return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11]).concat(
			this.getKnightMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21])
		)
	}

	// Get all possible moves of the specified colour
	getAllMoves(colour) {
		const allMoves = []
		for (let i = 21; i <= 98; i++) {
			if (this.board.isOccupiedByAlly(i, colour)) {
				const fromcoord = this.board.index120ToCoordinate(i)
				const piece = this.board.getSquarePieceObj(fromcoord).name
				const validMoves = this.getValidMoves(piece, i)
				allMoves.push(...validMoves.map((move) => [fromcoord, this.board.index120ToCoordinate(move)]))
			}
		}
		return allMoves
	}

	//!-------------- Helper Methods --------------

	// Print move history
	printMoveHistory() {
		if (this.movesHistory.length === 0) {
			return 'No moves have been made yet.'
		} else {
			let historyString = 'Move History:\n'
			this.movesHistory.forEach((move, index) => {
				historyString += `${index + 1}. ${this.moveToChessNotation(move)} (${this.moveToString(move)})\n`
			})
			return historyString
		}
	}

	// Get captured piece at the destination square
	getCapturedPiece(toCoord) {
		const pieceAtDestination = this.board.getSquarePieceHtml(toCoord)
		return pieceAtDestination ? pieceAtDestination.id : null
	}

	isEnPassant(toCoord, piece) {
		return (
			this.board.coordinateToIndex120(toCoord) === this.board.enPassantIndex &&
			(piece.name.toLowerCase() === 'p' || piece.name.toLowerCase() === 's')
		)
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
