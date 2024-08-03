class Game {
	constructor() {
		// Initialize game variables
		this.board = new Chessboard(this)
		// this.startPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
		this.startPosition = 'rfbekanw/pppppppp/8/8/8/8/PPPPPPPP/RFBEKANW'

		this.handleSquareClick = this.handleSquareClick.bind(this)
		this.selectedSquare = null
	}

	start() {
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

		this.board.draw(this.startPosition)
		this.board.enPassantIndex = null
	}

	//!-------------- Event Handling Methods --------------

	// Handle square click events
	handleSquareClick(event) {
		if (this.board.promotionInProgress) return

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
		const piece = this.board.getPieceFromCoordinate(square.getAttribute('coordinate'))
		if (!this.isActivePlayersPiece(square)) return
		this.availableMoves = this.calculateValidMoves(piece, parseInt(square.getAttribute('index120')))
		this.board.highlightSquares(this.availableMoves)
		square.classList.add('clickedSquare')
	}

	// Actions on second click
	handleSecondClick(square) {
		if (!this.availableMoves.includes(parseInt(square.getAttribute('index120')))) return
		const fromCoord = this.selectedSquare.getAttribute('coordinate')

		this.executeMove(fromCoord, square.getAttribute('coordinate'), this.board.getPieceFromCoordinate(fromCoord))
		this.resetSquareSelection()

		if (this.isKingCheckmated(this.getOpponentColour(this.activePlayer))) {
			this.gameOver = true
			console.log('Checkmate!')
		} else if (this.isKingInCheck(this.getOpponentColour(this.activePlayer))) {
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
		const castlingRightsBefore = JSON.parse(JSON.stringify(this.castlingRights))
		const enPassantIndexBefore = this.board.enPassantIndex

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
				this.board.promote(toCoord)
				moveType = 'promotion'
			}
		}

		this.moveHistory.push({ piece, fromCoord, toCoord, capturedPiece, capturedCoord, moveType, castlingRightsBefore, enPassantIndexBefore })
		this.checkCastlingRights(fromCoord, piece)
	}

	undoMove() {
		this.resetSquareSelection()
		this.board.hidePromotionOptions()
		this.board.promotionInProgress = false

		if (this.moveHistory.length === 0) return
		const lastMove = this.moveHistory.pop()
		const { fromCoord, toCoord, capturedPiece, capturedCoord, moveType, piece, castlingRightsBefore, enPassantIndexBefore } = lastMove
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
				if (toCoord === 'g1') this.board.move('f1', 'h1')
				else if (toCoord === 'b1') this.board.move('c1', 'a1')
				else if (toCoord === 'g8') this.board.move('f8', 'h8')
				else if (toCoord === 'b8') this.board.move('c8', 'a8')

				break
			default:
				this.board.move(toCoord, fromCoord)
				if (capturedPiece) this.board.place(capturedPiece, capturedCoord)
		}
		this.castlingRights = castlingRightsBefore
		this.board.enPassantIndex = enPassantIndexBefore
		this.gameOver = false
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
				this.board.promote(toCoord)
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
		this.activePlayer = this.getOpponentColour(this.activePlayer)
		console.log(this.displayMoveHistory())
	}

	// Update castling rights based on the move
	checkCastlingRights(fromCoord, piece) {
		const colour = this.board.getPieceColour(piece)

		if (piece.toLowerCase() === 'k') {
			this.castlingRights[colour].kingside = false
			this.castlingRights[colour].queenside = false
		} else if (piece.toLowerCase() === 'r') {
			if (fromCoord === 'a1' || fromCoord === 'a8') this.castlingRights[colour].queenside = false
			if (fromCoord === 'h1' || fromCoord === 'h8') this.castlingRights[colour].kingside = false
		}
	}

	//!-------------- Move Validation Methods --------------

	// Get valid moves for a piece at a given position
	calculateValidMoves(piece, currentPosition) {
		const colour = this.board.getPieceColour(piece)
		let moves = []

		// prettier-ignore
		switch (piece.toLowerCase()) {
			case 'k': moves = this.calculateKingMoves(currentPosition, colour); break
			case 'p': moves = this.calculatePawnMoves(currentPosition, colour); break
			case 'n': moves = this.calculateMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21], false); break
			case 'b': moves = this.calculateMoves(currentPosition, colour, [-11, -9, 9, 11], true); break
			case 'r': moves = this.calculateMoves(currentPosition, colour, [-10, -1, 1, 10], true); break
			case 'q': moves = this.calculateMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11], true); break
			case 'f': moves = this.calculateMoves(currentPosition, colour, [-21, -19, -12, -11, -10, -9, -8, -1, 1, 8, 9, 10, 11, 12, 19, 21], false); break
			case 'e': moves = this.calculateEarthMoves(currentPosition, colour); break
			case 'w': moves = this.calculateWaterMoves(currentPosition, colour); break
			case 'a': moves = this.calculateAirMoves(currentPosition, colour); break
			default:moves = []
		}

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

		for (let offset of [9 * dir, 11 * dir]) {
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
	calculateAirMoves(currentPosition, colour) {
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

	// Get valid moves for an Air Spirit
	calculateEarthMoves(currentPosition, colour) {
		const availableMoves = []
		for (const offset of [-10, -1, 1, 10, -11, -9, 9, 11]) {
			let newPosition = currentPosition
			for (let i = 0; i < 3; i++) {
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
				allMoves.push(...this.calculateValidMoves(piece, i).map((move) => [fromcoord, this.board.index120ToCoordinate(move)]))
			}
		}
		return allMoves
	}

	doesMoveLeaveKingSafe(from, to) {
		const tempBoard = [...this.board.boardArray120]
		const pieceToMove = tempBoard[from]
		const kingColour = this.board.getPieceColour(pieceToMove)

		tempBoard[to] = pieceToMove
		tempBoard[from] = ''

		const tempBoardInstance = new Chessboard(this)
		tempBoardInstance.boardArray120 = tempBoard

		const kingIndex = tempBoardInstance.findKingIndex(kingColour)

		return !tempBoardInstance.isSquareUnderAttack(kingIndex, this.getOpponentColour(kingColour))
	}

	// Check if the king of the given colour is in check
	isKingInCheck(colour) {
		return this.board.isSquareUnderAttack(this.board.findKingIndex(colour), this.getOpponentColour(colour))
	}

	// Check if the king of the given colour is in checkmate
	isKingCheckmated(colour) {
		if (!this.isKingInCheck(colour)) return false
		for (let i = 21; i <= 98; i++) {
			if (this.board.isSquareOccupiedByAlly(i, colour)) {
				const piece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(i))
				if (this.calculateValidMoves(piece, i).length > 0) return false
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
		let moveNotation = move.piece
		if (move.capturedPiece) moveNotation += 'x'
		moveNotation += move.toCoord
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
		const rookPiece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(colour === 'white' ? 98 : 28))

		return (
			this.castlingRights[colour].kingside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			this.board.getPieceColour(rookPiece) === colour
		)
	}

	// Check if queenside castling is possible
	canKingCastleQueenside(colour) {
		const emptySquares = colour === 'white' ? [94, 93, 92] : [24, 23, 22]
		const rookPiece = this.board.getPieceFromCoordinate(this.board.index120ToCoordinate(colour === 'white' ? 91 : 21))

		return (
			this.castlingRights[colour].queenside &&
			this.board.areSquaresEmpty(emptySquares) &&
			!this.areSquaresUnderAttack(emptySquares, colour) &&
			rookPiece &&
			rookPiece.toLowerCase() === 'r' &&
			this.board.getPieceColour(rookPiece) === colour
		)
	}

	// Check if the given squares are under attack
	areSquaresUnderAttack(indices, colour) {
		return indices.some((index) => this.board.isSquareUnderAttack(index, this.getOpponentColour(colour)))
	}

	// Get opponent colour
	getOpponentColour(colour) {
		return colour === 'white' ? 'black' : 'white'
	}
}
