class Game {
	constructor() {
		// Initialize game variables
		this.board = new Chessboard(this)

		// Default game settings
		this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		// this.startPosition = 'rebakfnw/pppppppp/8/8/8/8/PPPPPPPP/REBAKFNW'

		this.activePlayer = 'white'
		this.gameOver = false
		this.availableMoves = []
		this.moveHistory = []
		this.undoneMoves = []

		// Initialize castling state
		this.castlingRights = {
			white: { kingside: true, queenside: true },
			black: { kingside: true, queenside: true }
		}

		// Bind event handling method
		this.handleSquareClick = this.handleSquareClick.bind(this)
		this.selectedSquare = null
	}

	start() {
		this.moveHistory = []
		this.undoneMoves = []
		this.activePlayer = 'white'
		this.board.draw(this.startPosition)
		this.board.enPassantIndex = null
	}

	//!-------------- Event Handling Methods --------------

	// Handle square click events
	handleSquareClick(event) {
		const square = event.currentTarget
		if (!this.selectedSquare) {
			this.handleFirstClick(square)
		} else {
			if (square === this.selectedSquare) {
				this.resetSquareSelection()
			} else if (this.isActivePlayersPiece(square)) {
				this.resetSquareSelection()
				this.handleFirstClick(square)
			} else {
				this.handleSecondClick(square)
			}
		}
	}

	// Actions on first click
	handleFirstClick(square) {
		this.selectedSquare = square
		const squareCoord = square.getAttribute('coordinate')
		const piece = this.board.getPieceFromCoordinate(squareCoord)
		if (!this.isActivePlayersPiece(square)) return
		const squareIndex = parseInt(square.getAttribute('index120'))
		this.availableMoves = this.calculateValidMoves(piece, squareIndex)
		this.board.highlightSquares(this.availableMoves)
		square.classList.add('clickedSquare')
	}

	// Actions on second click
	handleSecondClick(square) {
		if (!this.availableMoves.includes(parseInt(square.getAttribute('index120')))) return
		const fromCoord = this.selectedSquare.getAttribute('coordinate')
		const toCoord = square.getAttribute('coordinate')
		const piece = this.board.getPieceFromCoordinate(fromCoord)

		this.executeMove(fromCoord, toCoord, piece)
		this.resetSquareSelection()

		if (this.isKingCheckmated(this.getOpponentColour())) {
			this.gameOver = true
			console.log('Checkmate!')
		} else if (this.isKingInCheck(this.getOpponentColour())) {
			console.log('Check!')
		}

		this.toggleTurn()
		this.undoneMoves = []
	}

	//!-------------- Move Management Methods --------------

	// Make a move
	executeMove(fromCoord, toCoord, piece) {
		let capturedPiece = null
		let capturedCoord = null
		let moveType = 'normal'
		const castlingRightsBefore = JSON.parse(JSON.stringify(this.castlingRights)) // Save castling rights before the move

		if (this.isEnPassantMove(toCoord, piece)) {
			const dir = piece === piece.toUpperCase() ? -1 : 1
			const enPassantCoord = this.board.index120ToCoordinate(this.board.enPassantIndex - 10 * dir)
			capturedPiece = this.retrieveCapturedPiece(enPassantCoord)
			capturedCoord = enPassantCoord
			this.board.enPassant(fromCoord, toCoord)
			moveType = 'enPassant'
		} else if (this.isCastleMove(fromCoord, toCoord, piece)) {
			this.board.castle(fromCoord, toCoord)
			moveType = 'castle'
		} else {
			capturedPiece = this.retrieveCapturedPiece(toCoord)
			if (capturedPiece) capturedCoord = toCoord
			this.board.move(fromCoord, toCoord)
			if (this.isPawnPromotion(piece, toCoord)) {
				this.board.promote(toCoord, this.board.getPieceColor(piece))
				moveType = 'promotion'
			}
		}

		this.moveHistory.push({ piece, fromCoord, toCoord, capturedPiece, capturedCoord, moveType, castlingRightsBefore }) // Save castling rights with the move
		this.checkCastlingRights(fromCoord, piece)
	}

	undoMove() {
		if (this.moveHistory.length === 0) return
		const lastMove = this.moveHistory.pop()
		const { fromCoord, toCoord, capturedPiece, capturedCoord, moveType, piece, castlingRightsBefore } = lastMove // Retrieve saved castling rights
		switch (moveType) {
			case 'enPassant':
				this.board.move(toCoord, fromCoord)
				this.board.place(capturedPiece, capturedCoord)
				break
			case 'promotion':
				this.board.place(capturedPiece, capturedCoord)
				this.board.place(piece, fromCoord)
				break
			case 'castle':
				this.board.move(toCoord, fromCoord)
				// Undo castling specific rook moves
				if (toCoord === 'g1') this.board.move('f1', 'h1')
				else if (toCoord === 'b1') this.board.move('c1', 'a1')
				else if (toCoord === 'g8') this.board.move('f8', 'h8')
				else if (toCoord === 'b8') this.board.move('c8', 'a8')

				break
			default:
				this.board.move(toCoord, fromCoord)
				if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		}
		this.castlingRights = castlingRightsBefore // Restore castling rights
		this.toggleTurn()
		this.undoneMoves.push(lastMove)
	}

	// Redo the last undone move
	redoMove() {
		if (this.undoneMoves.length === 0) return
		const lastUndoneMove = this.undoneMoves.pop()
		const { fromCoord, toCoord, moveType } = lastUndoneMove

		switch (moveType) {
			case 'enPassant':
				this.board.enPassant(fromCoord, toCoord)
				break
			case 'promotion':
				this.board.move(fromCoord, toCoord)
				this.board.promote(toCoord, this.board.getPieceColor(this.board.getPieceFromCoordinate(fromCoord)))
				break
			case 'castle':
				this.board.castle(fromCoord, toCoord)
				this.checkCastlingRights(fromCoord, this.board.getPieceFromCoordinate(toCoord))
				break
			default:
				this.board.move(fromCoord, toCoord)
		}
		this.moveHistory.push(lastUndoneMove)
		this.toggleTurn()
	}

	// Reset square selection and valid moves
	resetSquareSelection() {
		if (!this.selectedSquare) return
		this.selectedSquare.classList.remove('clickedSquare')
		this.board.unhighlightSquares(this.availableMoves)
		this.selectedSquare = null
		this.availableMoves = []
	}

	// Switch turn between players
	toggleTurn() {
		this.activePlayer = this.getOpponentColour()
		console.log(this.displayMoveHistory())
	}

	// Update castling rights based on the move
	checkCastlingRights(fromCoord, piece) {
		const colour = this.board.getPieceColor(piece)

		if (piece === 'k') {
			this.castlingRights[colour].kingside = false
			this.castlingRights[colour].queenside = false
		} else if (piece === 'r') {
			if (fromCoord === 'a1' || fromCoord === 'a8') this.castlingRights[colour].queenside = false
			if (fromCoord === 'h1' || fromCoord === 'h8') this.castlingRights[colour].kingside = false
		}
	}

	//!-------------- Move Validation Methods --------------

	// Get valid moves for a piece at a given position
	calculateValidMoves(piece, currentPosition) {
		const colour = this.board.getPieceColor(piece)
		const pieceType = piece.toLowerCase()
		let moves = []

		// prettier-ignore
		// Calculate possible moves based on piece type
		switch (pieceType) {
			case 'p': moves = this.calculatePawnMoves(currentPosition, colour); break
			case 'n': moves = this.calculateMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21], false); break
			case 'b': moves = this.calculateMoves(currentPosition, colour, [-11, -9, 9, 11], true); break
			case 'r': moves = this.calculateMoves(currentPosition, colour, [-10, -1, 1, 10], true); break
			case 'q': moves = this.calculateMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11], true); break
			case 'k': moves = this.calculateKingMoves(currentPosition, colour); break
			case 'f': moves = this.calculateFireMoves(currentPosition, colour); break
			case 'w': moves = this.calculateWaterMoves(currentPosition, colour); break
			case 'e': moves = this.calculateEarthMoves(currentPosition, colour); break
			case 'a': moves = this.calculateAirMoves(currentPosition, colour); break
			default:moves = []
		}

		// Filter moves that leave the king in check
		return moves.filter((move) => this.doesMoveLeaveKingSafe(currentPosition, move))
	}

	// Get moves for different pieces
	calculateMoves(currentPosition, colour, offsets, sliding) {
		const availableMoves = []
		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			while (this.board.isValidBoardIndex(newPosition) && !this.board.isSquareOccupiedByAlly(newPosition, colour)) {
				availableMoves.push(newPosition)
				if (this.board.isSquareOccupiedByOpponent(newPosition, colour) || !sliding) break
				newPosition += offset
			}
		}
		return availableMoves
	}

	// Get valid moves for a king
	calculateKingMoves(currentPosition, colour) {
		const moves = this.calculateMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11], false)
		if (this.canKingCastleKingside(colour)) moves.push(currentPosition + 2)
		if (this.canKingCastleQueenside(colour)) moves.push(currentPosition - 3)
		return moves
	}

	// Get valid moves for a pawn
	calculatePawnMoves(currentPosition, colour) {
		const dir = colour === 'white' ? -1 : 1
		const startRank = colour === 'white' ? 8 : 3
		const offsets = [10 * dir]
		const availableMoves = []

		if (
			Math.floor(currentPosition / 10) === startRank &&
			!this.board.isSquareOccupied(currentPosition + 10 * dir) &&
			!this.board.isSquareOccupied(currentPosition + 20 * dir)
		) {
			offsets.push(20 * dir)
		}

		const captureOffsets = [9 * dir, 11 * dir]
		for (let offset of captureOffsets) {
			let newPosition = currentPosition + offset
			if (this.board.isValidBoardIndex(newPosition)) {
				if (this.board.isSquareOccupiedByOpponent(newPosition, colour) || newPosition === this.board.enPassantIndex) {
					availableMoves.push(newPosition)
				}
			}
		}

		for (let offset of offsets) {
			let newPosition = currentPosition + offset
			if (this.board.isValidBoardIndex(newPosition) && !this.board.isSquareOccupied(newPosition)) availableMoves.push(newPosition)
		}
		return availableMoves
	}

	// Get valid moves for a Fire Mage
	calculateFireMoves(currentPosition, colour) {
		return this.calculateMoves(currentPosition, colour, [-11, -9, 9, 11], true).concat(
			this.calculateMoves(currentPosition, colour, [22, 20, 18, 2, -2, -18, -20, -22], false)
		)
	}

	// Get valid moves for a Water Mage
	calculateWaterMoves(currentPosition, colour) {
		return this.calculateMoves(currentPosition, colour, [-10, -1, 1, 10], true).concat(
			this.calculateMoves(currentPosition, colour, [22, 20, 18, 2, -2, -18, -20, -22], false)
		)
	}

	// Get valid moves for an Earth Golem
	calculateEarthMoves(currentPosition, colour) {
		return this.calculateMoves(currentPosition, colour, [-21, -19, -12, -11, -10, -9, -8, -1, 1, 8, 9, 10, 11, 12, 19, 21], false)
	}

	// Get valid moves for an Air Spirit
	calculateAirMoves(currentPosition, colour) {
		const availableMoves = []
		const offsets = [-10, -1, 1, 10, -11, -9, 9, 11]
		for (const offset of offsets) {
			let newPosition = currentPosition
			for (let i = 0; i < 3; i++) {
				// Limit to 3 squares
				newPosition += offset
				if (!this.board.isValidBoardIndex(newPosition) || this.board.isSquareOccupiedByAlly(newPosition, colour)) break
				availableMoves.push(newPosition)
				if (this.board.isSquareOccupiedByOpponent(newPosition, colour)) break
			}
		}
		return availableMoves
	}

	// Get all possible moves of the specified colour
	calculateAllMoves(colour) {
		const allMoves = []
		for (let i = 21; i <= 98; i++) {
			if (this.board.isSquareOccupiedByAlly(i, colour)) {
				const fromcoord = this.board.index120ToCoordinate(i)
				const piece = this.board.getPieceFromCoordinate(fromcoord)
				const availableMoves = this.calculateValidMoves(piece, i)
				allMoves.push(...availableMoves.map((move) => [fromcoord, this.board.index120ToCoordinate(move)]))
			}
		}
		return allMoves
	}

	doesMoveLeaveKingSafe(from, to) {
		const tempBoard = [...this.board.boardArray120]
		const pieceToMove = tempBoard[from]
		const kingColour = this.board.getPieceColor(pieceToMove)

		tempBoard[to] = pieceToMove
		tempBoard[from] = ''

		const tempBoardInstance = new Chessboard(this)
		tempBoardInstance.boardArray120 = tempBoard

		const opponentColour = kingColour === 'white' ? 'black' : 'white'
		const kingIndex = tempBoardInstance.findKingIndex(kingColour)

		return !tempBoardInstance.isSquareUnderAttack(kingIndex, opponentColour)
	}

	// Check if the king of the given colour is in check
	isKingInCheck(colour) {
		const kingIndex = this.board.findKingIndex(colour)
		return this.board.isSquareUnderAttack(kingIndex, colour === 'white' ? 'black' : 'white')
	}

	// Check if the king of the given colour is in checkmate
	isKingCheckmated(colour) {
		if (!this.isKingInCheck(colour)) return false
		for (let i = 21; i <= 98; i++) {
			if (this.board.isSquareOccupiedByAlly(i, colour)) {
				const piece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(i))
				const availableMoves = this.calculateValidMoves(piece, i)
				if (availableMoves.length > 0) return false
			}
		}
		return true
	}

	// Check if the clicked square contains the current player's piece
	isActivePlayersPiece(square) {
		const piece = square.querySelector('.piece')
		return piece && piece.classList.contains(this.activePlayer)
	}

	isEnPassantMove(toCoord, piece) {
		return this.board.coordinateToIndex120(toCoord) === this.board.enPassantIndex && piece.toLowerCase() === 'p'
	}

	isCastleMove(fromCoord, toCoord, piece) {
		if (piece.toLowerCase() !== 'k') return false
		const moveDistance = Math.abs(this.board.coordinateToIndex120(fromCoord) - this.board.coordinateToIndex120(toCoord))
		return moveDistance === 2 || moveDistance === 3
	}

	isPawnPromotion(piece, toCoord) {
		return piece.toLowerCase() === 'p' && (toCoord[1] === '1' || toCoord[1] === '8')
	}

	//!-------------- Move Conversion Methods --------------

	// Convert move to a description (eg. P from d2 to d4)
	convertMoveToString(move) {
		let moveString = `${move.piece} from ${move.fromCoord} to ${move.toCoord}`
		if (move.capturedPiece) moveString += `, capturing ${move.capturedPiece}`
		return moveString
	}

	// Convert move to chess notation
	convertMoveToChessNotation(move) {
		const pieceNotation = move.piece
		const toNotation = move.toCoord
		let moveNotation = pieceNotation
		if (move.capturedPiece) moveNotation += 'x'
		moveNotation += toNotation
		return moveNotation
	}

	//!-------------- Helper Methods --------------

	// Print move history
	displayMoveHistory() {
		if (this.moveHistory.length === 0) {
			return 'No moves have been made yet.'
		} else {
			return this.moveHistory
				.map((move, index) => `${index + 1}. ${this.convertMoveToChessNotation(move)} (${this.convertMoveToString(move)})`)
				.join('\n')
		}
	}

	// Get captured piece at the destination square
	retrieveCapturedPiece(toCoord) {
		const pieceAtDestination = this.board.getPieceFromCoordinate(toCoord)
		return pieceAtDestination ? pieceAtDestination : null
	}

	// Check if kingside castling is possible
	canKingCastleKingside(colour) {
		const emptySquares = colour === 'white' ? [96, 97] : [26, 27]
		const rookPosition = colour === 'white' ? 98 : 28
		const rookPiece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(rookPosition))

		return (
			this.castlingRights[colour].kingside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			this.board.getPieceColor(rookPiece) === colour
		)
	}

	// Check if queenside castling is possible
	canKingCastleQueenside(colour) {
		const emptySquares = colour === 'white' ? [94, 93, 92] : [24, 23, 22]
		const rookPosition = colour === 'white' ? 91 : 21
		const rookPiece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(rookPosition))

		return (
			this.castlingRights[colour].queenside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			this.board.getPieceColor(rookPiece) === colour
		)
	}

	// Check if the given squares are under attack
	areSquaresUnderAttack(indices, colour) {
		const opponentColour = colour === 'white' ? 'black' : 'white'
		return indices.some((index) => this.board.isSquareUnderAttack(index, opponentColour))
	}

	// Get opponent colour
	getOpponentColour() {
		return this.activePlayer === 'white' ? 'black' : 'white'
	}
}
