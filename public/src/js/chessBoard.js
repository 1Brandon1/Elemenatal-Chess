class Chessboard {
	constructor(game) {
		this.boardElement = document.getElementById('Board')
		this.boardArray120 = new Array(120).fill('off')
		this.orientation = 'white'
		this.game = game
		// prettier-ignore
		this.mailbox120 = [
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1,  0,  1,  2,  3,  4,  5,  6,  7, -1,
			-1,  8,  9, 10, 11, 12, 13, 14, 15, -1,
			-1, 16, 17, 18, 19, 20, 21, 22, 23, -1,
			-1, 24, 25, 26, 27, 28, 29, 30, 31, -1,
			-1, 32, 33, 34, 35, 36, 37, 38, 39, -1,
			-1, 40, 41, 42, 43, 44, 45, 46, 47, -1,
			-1, 48, 49, 50, 51, 52, 53, 54, 55, -1,
			-1, 56, 57, 58, 59, 60, 61, 62, 63, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
			-1, -1, -1, -1, -1, -1, -1, -1, -1, -1
		]
		// prettier-ignore
		this.mailbox64 = [
			21, 22, 23, 24, 25, 26, 27, 28,
			31, 32, 33, 34, 35, 36, 37, 38,
			41, 42, 43, 44, 45, 46, 47, 48,
			51, 52, 53, 54, 55, 56, 57, 58,
			61, 62, 63, 64, 65, 66, 67, 68,
			71, 72, 73, 74, 75, 76, 77, 78,
			81, 82, 83, 84, 85, 86, 87, 88,
			91, 92, 93, 94, 95, 96, 97, 98
		]
	}

	//!-------------- Fen Manipulation Methods --------------

	// Check if string is a valid FEN string
	isFen(board) {
		const boardPattern = /^[prnbqkPRNBQK1-8\/]+$/
		if (!boardPattern.test(board)) return false // Invalid board position
		const ranks = board.split('/')
		if (ranks.length !== 8) return false // Invalid number of ranks
		for (const rank of ranks) {
			let squareCount = 0
			for (const char of rank) {
				if (/[1-8]/.test(char)) {
					squareCount += parseInt(char)
				} else if (/[prnbqkPRNBQK]/.test(char)) {
					squareCount++
				} else {
					return false // Invalid character in rank
				}
			}
			if (squareCount !== 8) return false // Invalid number of squares in rank
		}
		return true
	}

	// Convert FEN string to array
	fenToArray64(fen) {
		if (!this.isFen(fen)) throw new Error('Invalid FEN string')
		const boardArray = new Array(64).fill('')
		const fenParts = fen.split(' ')[0].split('/')
		let i = 0
		fenParts.forEach((rowFen) => {
			for (let char of rowFen) {
				if (/[1-8]/.test(char)) {
					i += parseInt(char, 10)
				} else {
					boardArray[i++] = char
				}
			}
		})
		return boardArray
	}

	//!-------------- Board Methods --------------

	// Draws the chessboard
	draw(fen) {
		const boardArray = this.fenToArray64(fen)
		this.clear()
		const fragment = document.createDocumentFragment()
		boardArray.forEach((pieceCode, squareIndex) => {
			const index120 = this.mailbox64[squareIndex]
			const square = document.createElement('div')
			square.classList.add('square')
			square.classList.add(((squareIndex % 8) + Math.floor(squareIndex / 8)) % 2 === 1 ? 'darkSquare' : 'lightSquare')
			square.setAttribute('coordinate', this.index120ToCoordinate(index120))
			square.setAttribute('index120', index120)
			const piece = pieceCode ? this.createPiece(pieceCode) : ''
			square.innerHTML = piece ? piece.getPieceHtml() : ''
			square.addEventListener('click', (event) => this.game.squareClicked(event))
			this.boardArray120[index120] = piece
			fragment.appendChild(square)
		})
		this.boardElement.appendChild(fragment)
	}

	// Clear the chessboard
	clear() {
		if (!this.boardElement) throw new Error('Board element not found')
		this.boardElement.innerHTML = ''
	}

	// Flip the chessboard orientation
	flip() {
		const squares = Array.from(this.boardElement.children)
		this.boardElement.innerHTML = ''
		squares.reverse().forEach((square) => this.boardElement.appendChild(square))
		this.orientation = this.orientation === 'white' ? 'black' : 'white'
	}

	// Flip the chessboard to a give side
	orient(side) {
		if (side !== 'white' && side !== 'black') throw new Error('Invalid orientation')
		if (side !== this.orientation) this.flip()
	}

	//!-------------- Piece Manipulation Methods --------------

	// prettier-ignore
	// Create chess piece object based on piece type
	createPiece(piece) {
		const pieceColour = piece === piece.toUpperCase() ? 'white' : 'black'
		switch (piece.toLowerCase()) {
			case 'p': return new Pawn(pieceColour)
			case 'r': return new Rook(pieceColour)
			case 'n': return new Knight(pieceColour)
			case 'b': return new Bishop(pieceColour)
			case 'q': return new Queen(pieceColour)
			case 'k': return new King(pieceColour)
			case 's': return new Squire(pieceColour)
			case 'c': return new Cardinal(pieceColour)
			case 'd': return new Dragon(pieceColour)
			case 'w': return new Warden(pieceColour)
			case 'a': return new Archon(pieceColour)
			default: return null // No piece for empty squares
		}
	}

	// Move a piece on the chessboard
	move(fromCoord, toCoord) {
		const fromSquareIndex = this.coordinateToIndex120(fromCoord)
		const toSquareIndex = this.coordinateToIndex120(toCoord)
		const fromSquare = this.getSquareFromIndex120(fromSquareIndex)
		const toSquare = this.getSquareFromIndex120(toSquareIndex)
		if (!fromSquare || !toSquare) throw new Error('Invalid coordinates provided for move.')
		const pieceToMove = fromSquare.querySelector('.piece')
		if (!pieceToMove) throw new Error('No piece to move on the source square.')
		const existingPiece = toSquare.querySelector('.piece')
		if (existingPiece) toSquare.removeChild(existingPiece)
		toSquare.appendChild(pieceToMove)
		this.boardArray120[toSquareIndex] = this.boardArray120[fromSquareIndex]
		this.boardArray120[fromSquareIndex] = ''
	}

	enPassant(fromCoord, toCoord) {
		const fromSquareIndex = this.coordinateToIndex120(fromCoord)
		const toSquareIndex = this.coordinateToIndex120(toCoord)
		const dir = this.boardArray120[fromSquareIndex].colour === 'white' ? 1 : -1
		const capturedPawnIndex = toSquareIndex + 10 * dir
		const capturedPawnSquare = this.getSquareFromIndex120(capturedPawnIndex)
		this.boardArray120[capturedPawnIndex] = ''
		capturedPawnSquare.innerHTML = ''
		this.move(fromCoord, toCoord)
	}

	castle() {}

	// place a piece on a given square
	place(pieceName, coordinate) {
		const piece = this.createPiece(pieceName)
		if (!piece) throw new Error('Invalid piece name')
		const squareIndex = this.coordinateToIndex120(coordinate)
		const square = this.getSquareFromIndex120(squareIndex)
		this.boardArray120[squareIndex] = piece
		square.innerHTML = piece.getPieceHtml()
	}

	// Find the index of the king of a certain colour
	findKingIndex(colour) {
		const kingPiece = colour === 'white' ? 'K' : 'k'
		for (let i = 0; i < this.boardArray120.length; i++) {
			const piece = this.boardArray120[i]
			if (piece && piece.name === kingPiece) {
				return i // Found the king's index
			}
		}
		throw new Error(`King of colour ${colour} not found on the board.`)
	}

	//!-------------- Highlight Methods --------------

	// Highlights squares
	highlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) square.classList.add(square.classList.contains('lightSquare') ? 'lightHighlight' : 'darkHighlight')
		})
	}

	// Unhighlights squares
	unhighlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) square.classList.remove('lightHighlight', 'darkHighlight')
		})
	}

	//!-------------- Coordinate Methods --------------

	// Convert coordinate to square index
	coordinateToIndex120(coordinate) {
		if (typeof coordinate !== 'string' || coordinate.length !== 2) throw new Error('Invalid coordinate format')
		const file = coordinate.toLowerCase().charCodeAt(0) - 97
		const rank = 8 - parseInt(coordinate[1])
		if (file < 0 || file > 7 || rank < 0 || rank > 7) throw new Error('Invalid coordinate')
		return this.mailbox64[rank * 8 + file]
	}

	// Convert square index to coordinate
	index120ToCoordinate(squareIndex) {
		squareIndex = this.mailbox120[squareIndex]
		if (squareIndex === undefined || squareIndex < 0 || squareIndex > 63) throw new Error('Invalid square index')
		const file = String.fromCharCode(97 + (squareIndex % 8))
		const rank = 8 - Math.floor(squareIndex / 8)
		return file + rank
	}

	//!-------------- Helper Methods --------------

	// Gets the square element from square index
	getSquareFromIndex120(squareIndex) {
		if (!this.boardElement) throw new Error('Board element not found')
		const square = this.boardElement.querySelector(`.square[index120="${squareIndex}"]`)
		if (!square) throw new Error('Square not found')
		return square
	}

	// Retrieves the name of the chess piece object on a given square coordinate
	getSquarePieceObj(coord) {
		const squareIndex = this.coordinateToIndex120(coord)
		return this.boardArray120[squareIndex]
	}

	// Retrieves the HTML piece element on a given square coordinate
	getSquarePieceHtml(coord) {
		const squareIndex = this.coordinateToIndex120(coord)
		const square = this.getSquareFromIndex120(squareIndex)
		return square.querySelector('.piece')
	}

	// Checks if the provided square  index represents a valid square on the board
	isBoardIndex(squareIndex) {
		return squareIndex >= 21 && squareIndex <= 98 && squareIndex % 10 !== 0 && (squareIndex + 1) % 10 !== 0
	}

	// Checks if the square at the provided square index is occupied by any chess piece
	isOccupied(squareIndex) {
		const piece = this.boardArray120[squareIndex]
		return piece !== ''
	}

	// Checks if the square at the provided square index is occupied by an opponent's chess piece
	isOccupiedByOpponent(squareIndex, colour) {
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && piece.colour !== colour
	}

	// Checks if the square at the provided square index is occupied by an ally's chess piece
	isOccupiedByAlly(squareIndex, colour) {
		if (!this.isBoardIndex(squareIndex)) return false
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && piece.colour === colour
	}
}
