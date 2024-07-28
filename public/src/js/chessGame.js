class Game {
	constructor() {
		// Initialize game variables
		this.board = new Chessboard(this)
		this.state = this.board.boardArray120

		// Default game settings
		this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		// this.startPosition = 'rebakfnw/pppppppp/8/8/8/8/PPPPPPPP/REBAKFNW'

		this.currentTurn = 'white'
		this.gameOver = false
		this.validMoves = []
		this.movesHistory = []
		this.undoneMoves = []

		// Initialize castling state
		this.castlingRights = {
			white: { kingside: true, queenside: true },
			black: { kingside: true, queenside: true }
		}

		// Bind event handling method
		this.squareClicked = this.squareClicked.bind(this)
		this.selectedSquare = null
	}

	start() {
		this.movesHistory = []
		this.undoneMoves = []
		this.currentTurn = 'white'
		this.board.draw(this.startPosition)
		this.board.enPassantIndex = null
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
		const squareCoord = square.getAttribute('coordinate')
		const piece = this.board.getSquarePieceObj(squareCoord)
		if (!this.isPiecesTurn(square)) return
		const squareIndex = parseInt(square.getAttribute('index120'))
		this.validMoves = this.getValidMoves(piece, squareIndex)
		this.board.highlightSquares(this.validMoves)
		square.classList.add('clickedSquare')
	}

	// Actions on second click
	onSecondClick(square) {
		if (!this.isMoveInValidMoves(square)) return
		const fromCoord = this.selectedSquare.getAttribute('coordinate')
		const toCoord = square.getAttribute('coordinate')
		const piece = this.board.getSquarePieceObj(fromCoord)

		this.makeMove(fromCoord, toCoord, piece)
		this.resetSquareSelection()

		if (this.isCheckmate(this.getOpponentColour())) {
			this.gameOver = true
			console.log('Checkmate!')
		} else if (this.isKingInCheck(this.getOpponentColour())) {
			console.log('Check!')
		}

		this.switchTurn()
		this.undoneMoves = []
	}

	// Make a move
	makeMove(fromCoord, toCoord, piece) {
		let capturedPiece = null
		let capturedCoord = null

		if (this.isEnPassant(toCoord, piece)) {
			const dir = piece.name === piece.name.toUpperCase() ? -1 : 1
			const enPassantCoord = this.board.index120ToCoordinate(this.board.enPassantIndex - 10 * dir)
			capturedPiece = this.getCapturedPiece(enPassantCoord)
			capturedCoord = enPassantCoord
			this.board.enPassant(fromCoord, toCoord)
		} else {
			capturedPiece = this.getCapturedPiece(toCoord)
			if (capturedPiece) capturedCoord = toCoord
			this.board.move(fromCoord, toCoord)
			if (this.isPromotion(piece, toCoord)) this.board.promote(toCoord, piece.colour)
		}

		this.updateCastlingRights(fromCoord, piece)
		this.movesHistory.push({ piece: piece.name, fromCoord, toCoord, capturedPiece, capturedCoord })
	}

	//!-------------- Move Management Methods --------------

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
		this.currentTurn = this.getOpponentColour()
		console.log(this.printMoveHistory())
	}

	// Get opponent colour
	getOpponentColour() {
		return this.currentTurn === 'white' ? 'black' : 'white'
	}

	undo() {
		if (this.movesHistory.length === 0) return
		const lastMove = this.movesHistory.pop()
		const { fromCoord, toCoord, capturedPiece, capturedCoord } = lastMove
		this.board.move(toCoord, fromCoord)
		if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		this.switchTurn()
		this.undoneMoves.push(lastMove)
	}

	// Redo the last undone move
	redo() {
		if (this.undoneMoves.length === 0) return
		const lastUndoneMove = this.undoneMoves.pop()
		const { fromCoord, toCoord } = lastUndoneMove
		this.board.move(fromCoord, toCoord)
		this.movesHistory.push(lastUndoneMove)
		this.switchTurn()
	}

	// Update castling rights based on the move
	updateCastlingRights(fromCoord, piece) {
		const pieceName = piece.name.toLowerCase()
		const colour = piece.colour

		if (pieceName === 'k') {
			this.castlingRights[colour].kingside = false
			this.castlingRights[colour].queenside = false
		} else if (pieceName === 'r') {
			if (fromCoord === 'a1' || fromCoord === 'a8') this.castlingRights[colour].queenside = false
			if (fromCoord === 'h1' || fromCoord === 'h8') this.castlingRights[colour].kingside = false
		}
	}

	//!-------------- Move Conversion Methods --------------

	// Convert move to a description (eg. P from d2 to d4)
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

	//!-------------- Move Validation Methods --------------

	// Get valid moves for a piece at a given position
	getValidMoves(piece, currentPosition) {
		const colour = piece.colour
		const pieceType = piece.name.toLowerCase()
		let moves = []

		// prettier-ignore
		// Calculate possible moves based on piece type
		switch (pieceType) {
			case 'p': moves = this.getPawnMoves(currentPosition, colour); break
			case 'n': moves = this.getKnightMoves(currentPosition, colour); break
			case 'b': moves = this.getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11]); break
			case 'r': moves = this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10]); break
			case 'q': moves = this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11]); break
			case 'k': moves = this.getKingMoves(currentPosition, colour); break
			case 'f': moves = this.getFireMoves(currentPosition, colour); break
			case 'w': moves = this.getWaterMoves(currentPosition, colour); break
			case 'e': moves = this.getEarthMoves(currentPosition, colour); break
			case 'a': moves = this.getAirMoves(currentPosition, colour); break
			default:moves = []
		}

		// Filter moves that leave the king in check
		return moves.filter((move) => this.isMoveSafe(currentPosition, move))
	}

	// Get valid moves for a knight
	getKnightMoves(currentPosition, colour) {
		return this.getMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21], false)
	}

	// Get valid moves for a king
	getKingMoves(currentPosition, colour) {
		const moves = this.getMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11], false)
		if (this.canCastleKingside(colour)) moves.push(currentPosition + 2)
		if (this.canCastleQueenside(colour)) moves.push(currentPosition - 3)
		return moves
	}

	// Get valid moves for a pawn
	getPawnMoves(currentPosition, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startRank = colour === 'white' ? 8 : 3
		const offsets = [10 * dir]
		const validMoves = []

		if (
			Math.floor(currentPosition / 10) === startRank &&
			!this.board.isOccupied(currentPosition + 10 * dir) &&
			!this.board.isOccupied(currentPosition + 20 * dir)
		) {
			offsets.push(20 * dir)
		}

		const captureOffsets = [9 * dir, 11 * dir]
		for (let offset of captureOffsets) {
			let newPosition = currentPosition + offset
			if (this.board.isBoardIndex(newPosition)) {
				if (this.board.isOccupiedByOpponent(newPosition, colour) || newPosition === this.board.enPassantIndex) {
					validMoves.push(newPosition)
				}
			}
		}

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
		return this.getMoves(currentPosition, colour, offsets, true)
	}

	// Get moves for different pieces
	getMoves(currentPosition, colour, offsets, sliding) {
		const validMoves = []
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			while (this.board.isBoardIndex(newPosition) && !this.board.isOccupiedByAlly(newPosition, colour)) {
				validMoves.push(newPosition)
				if (this.board.isOccupiedByOpponent(newPosition, colour) || !sliding) break
				newPosition += offset
			}
		}
		return validMoves
	}

	// Get valid moves for a Fire Mage
	getFireMoves(currentPosition, colour) {
		return this.getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11]).concat(this.getKnightMoves(currentPosition, colour))
	}

	// Get valid moves for a Water Mage
	getWaterMoves(currentPosition, colour) {
		return this.getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10]).concat(this.getKnightMoves(currentPosition, colour))
	}

	// Get valid moves for an Earth Golem
	getEarthMoves(currentPosition, colour) {
		return this.getMoves(currentPosition, colour, [-21, -19, -12, -11, -10, -9, -8, -1, 1, 8, 9, 10, 11, 12, 19, 21], false)
	}

	// Get valid moves for an Air Spirit
	getAirMoves(currentPosition, colour) {
		const validMoves = []
		const offsets = [-10, -1, 1, 10, -11, -9, 9, 11]
		for (const offset of offsets) {
			let newPosition = currentPosition
			for (let i = 0; i < 3; i++) {
				// Limit to 3 squares
				newPosition += offset
				if (!this.board.isBoardIndex(newPosition) || this.board.isOccupiedByAlly(newPosition, colour)) break
				validMoves.push(newPosition)
				if (this.board.isOccupiedByOpponent(newPosition, colour)) break
			}
		}
		return validMoves
	}

	// Get all possible moves of the specified colour
	getAllMoves(colour) {
		const allMoves = []
		for (let i = 21; i <= 98; i++) {
			if (this.board.isOccupiedByAlly(i, colour)) {
				const fromcoord = this.board.index120ToCoordinate(i)
				const piece = this.board.getSquarePieceObj(fromcoord)
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
			return this.movesHistory.map((move, index) => `${index + 1}. ${this.moveToChessNotation(move)} (${this.moveToString(move)})`).join('\n')
		}
	}

	// Get captured piece at the destination square
	getCapturedPiece(toCoord) {
		const pieceAtDestination = this.board.getSquarePieceHtml(toCoord)
		return pieceAtDestination ? pieceAtDestination.id : null
	}

	isEnPassant(toCoord, piece) {
		return this.board.coordinateToIndex120(toCoord) === this.board.enPassantIndex && piece.name.toLowerCase() === 'p'
	}

	isPromotion(piece, toCoord) {
		return piece.name.toLowerCase() === 'p' && (toCoord[1] === '1' || toCoord[1] === '8')
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

	// Check if kingside castling is possible
	canCastleKingside(colour) {
		const emptySquares = colour === 'white' ? [96, 97] : [26, 27]
		return this.castlingRights[colour].kingside && this.board.areSquaresEmpty(emptySquares) && !this.areSquaresUnderAttack(emptySquares, colour)
	}

	// Check if queenside castling is possible
	canCastleQueenside(colour) {
		const emptySquares = colour === 'white' ? [94, 93, 92] : [24, 23, 22]
		return this.castlingRights[colour].queenside && this.board.areSquaresEmpty(emptySquares) && !this.areSquaresUnderAttack(emptySquares, colour)
	}

	// Check if the given squares are under attack
	areSquaresUnderAttack(indices, colour) {
		const opponentColour = colour === 'white' ? 'black' : 'white'
		return indices.some((index) => this.board.isSquareUnderAttack(index, opponentColour))
	}

	// Check if the king of the given colour is in check
	isKingInCheck(colour) {
		const kingIndex = this.board.findKingIndex(colour)
		return this.board.isSquareUnderAttack(kingIndex, colour === 'white' ? 'black' : 'white')
	}

	// Check if the king of the given colour is in checkmate
	isCheckmate(colour) {
		if (!this.isKingInCheck(colour)) return false
		for (let i = 21; i <= 98; i++) {
			if (this.board.isOccupiedByAlly(i, colour)) {
				const piece = this.board.getSquarePieceObj(this.board.index120ToCoordinate(i))
				const validMoves = this.getValidMoves(piece, i)
				if (validMoves.length > 0) return false
			}
		}
		return true
	}

	isMoveSafe(from, to) {
		const tempBoard = [...this.board.boardArray120]
		const pieceToMove = tempBoard[from]
		const kingColour = pieceToMove.colour

		tempBoard[to] = pieceToMove
		tempBoard[from] = ''

		const tempBoardInstance = new Chessboard(this)
		tempBoardInstance.boardArray120 = tempBoard

		const opponentColour = kingColour === 'white' ? 'black' : 'white'
		const kingIndex = tempBoardInstance.findKingIndex(kingColour)

		return !tempBoardInstance.isSquareUnderAttack(kingIndex, opponentColour)
	}
}
