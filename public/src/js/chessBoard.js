class Chessboard {
	// Predefined constants for board indices
	// prettier-ignore
	static MAILBOX_120 = [
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
	static MAILBOX_64 = [
		21, 22, 23, 24, 25, 26, 27, 28,
		31, 32, 33, 34, 35, 36, 37, 38,
		41, 42, 43, 44, 45, 46, 47, 48,
		51, 52, 53, 54, 55, 56, 57, 58,
		61, 62, 63, 64, 65, 66, 67, 68,
		71, 72, 73, 74, 75, 76, 77, 78,
		81, 82, 83, 84, 85, 86, 87, 88,
		91, 92, 93, 94, 95, 96, 97, 98
	]

	// Constructor for initializing the chessboard
	constructor(game) {
		this.boardElement = document.getElementById('Board')
		this.boardArray120 = new Array(120).fill('off') // Initialize board
		this.orientation = 'white' // Default orientation
		this.game = game // Reference to the game instance
		this.enPassantIndex = null // En Passant target square
		this.moveSound = new Audio('/assets/sounds/move.mp3')
		this.captureSound = new Audio('/assets/sounds/capture.mp3')
		this.castleSound = new Audio('/assets/sounds/castle.mp3')
		this.checkSound = new Audio('/assets/sounds/check.mp3')
		this.promoteSound = new Audio('/assets/sounds/promote.mp3')
	}

	// Check if a given FEN string is valid
	isFen(board) {
		const boardPattern = /^[prnbqkfweaPRNBQKFWEA1-8\/]+$/
		if (!boardPattern.test(board)) return false // Invalid board position
		const ranks = board.split('/')
		if (ranks.length !== 8) return false // Invalid number of ranks
		for (const rank of ranks) {
			let squareCount = 0
			for (const char of rank) {
				if (/[1-8]/.test(char)) {
					squareCount += parseInt(char, 10)
				} else if (/[prnbqkfweaPRNBQKFWEA]/.test(char)) {
					squareCount++
				} else {
					return false // Invalid character in rank
				}
			}
			if (squareCount !== 8) return false // Invalid number of squares in rank
		}
		return true
	}

	// Convert a FEN string to a 64-square board array
	fenToArray64(fen) {
		if (!this.isFen(fen)) throw new Error('Invalid FEN string')

		const boardArray = new Array(64).fill('')
		const fenParts = fen.split(' ')[0].split('/')
		let i = 0

		fenParts.forEach((rowFen) => {
			for (const char of rowFen) {
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

	// Draw the board based on the given FEN string
	draw(fen) {
		const boardArray = this.fenToArray64(fen)
		this.clear() // Clear the existing board
		const fragment = document.createDocumentFragment() // Create a document fragment for performance

		boardArray.forEach((pieceCode, squareIndex) => {
			const index120 = Chessboard.MAILBOX_64[squareIndex]
			const square = document.createElement('div')
			square.className = `square ${((squareIndex % 8) + Math.floor(squareIndex / 8)) % 2 === 1 ? 'darkSquare' : 'lightSquare'}`
			square.setAttribute('coordinate', this.index120ToCoordinate(index120))
			square.setAttribute('index120', index120)

			const piece = pieceCode ? this.createPiece(pieceCode) : ''
			square.innerHTML = piece ? piece.getPieceHtml() : ''
			square.addEventListener('click', (event) => this.game.squareClicked(event))

			this.boardArray120[index120] = piece
			fragment.appendChild(square)
		})

		this.boardElement.appendChild(fragment) // Append all squares at once
	}

	// Clear the board's HTML
	clear() {
		if (!this.boardElement) throw new Error('Board element not found')
		this.boardElement.innerHTML = ''
	}

	// Flip the board to the opposite orientation
	flip() {
		const squares = Array.from(this.boardElement.children)
		this.boardElement.innerHTML = ''
		squares.reverse().forEach((square) => this.boardElement.appendChild(square))
		this.orientation = this.orientation === 'white' ? 'black' : 'white'
	}

	// Set the board orientation
	orient(side) {
		if (!['white', 'black'].includes(side)) throw new Error('Invalid orientation')
		if (side !== this.orientation) this.flip()
	}

	//!-------------- Piece Manipulation Methods --------------

	// Create a piece object from a piece code
	createPiece(piece) {
		const pieceColour = piece === piece.toUpperCase() ? 'white' : 'black'
		const pieceMap = {
			p: Pawn,
			r: Rook,
			n: Knight,
			b: Bishop,
			q: Queen,
			k: King,
			f: Fire,
			w: Water,
			e: Earth,
			a: Air
		}

		const PieceClass = pieceMap[piece.toLowerCase()]
		return PieceClass ? new PieceClass(pieceColour) : null
	}

	// Move a piece from one coordinate to another
	move(fromCoord, toCoord) {
		const fromSquareIndex = this.coordinateToIndex120(fromCoord)
		const toSquareIndex = this.coordinateToIndex120(toCoord)
		const fromSquare = this.getSquareFromIndex120(fromSquareIndex)
		const toSquare = this.getSquareFromIndex120(toSquareIndex)

		if (!fromSquare || !toSquare) throw new Error('Invalid coordinates provided for move.')

		const pieceToMove = fromSquare.querySelector('.piece')
		if (!pieceToMove) throw new Error('No piece to move on the source square.')

		const existingPiece = toSquare.querySelector('.piece')
		if (existingPiece) {
			this.captureSound.play()
			toSquare.removeChild(existingPiece)
		} else {
			this.moveSound.play()
		}

		toSquare.appendChild(pieceToMove)
		this.boardArray120[toSquareIndex] = this.boardArray120[fromSquareIndex]
		this.boardArray120[fromSquareIndex] = ''

		const pieceObj = this.boardArray120[toSquareIndex]
		this.updateEnPassantIndex(fromCoord, toCoord, pieceObj)

		// Handle castling
		if (pieceToMove.id.toLowerCase() === 'k') {
			const moveDistance = Math.abs(fromSquareIndex - toSquareIndex)
			if (moveDistance === 2 || moveDistance === 3) {
				this.castle(fromSquareIndex, toSquareIndex)
			}
		}
	}

	// Perform castling move
	castle(kingFromIndex, kingToIndex) {
		const direction = kingToIndex > kingFromIndex ? 1 : -1
		const rookFromIndex = direction === 1 ? kingFromIndex + 3 : kingFromIndex - 4
		const rookToIndex = kingToIndex - direction

		const rookFromSquare = this.getSquareFromIndex120(rookFromIndex)
		const rookToSquare = this.getSquareFromIndex120(rookToIndex)
		const rookToMove = rookFromSquare.querySelector('.piece')

		if (rookToMove) {
			rookToSquare.appendChild(rookToMove)
			this.boardArray120[rookToIndex] = this.boardArray120[rookFromIndex]
			this.boardArray120[rookFromIndex] = ''

			this.castleSound.play()
		}
	}

	// Performs an en passant capture on the board
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

	// Promote a pawn to a different piece
	promote(coord, colour) {
		const squareIndex = this.coordinateToIndex120(coord)
		const squareElement = this.getSquareFromIndex120(squareIndex)

		// allow the user to pick the piece to promote to
		const option = 'Q'

		const newPiece = colour === 'black' ? option.toLowerCase() : option
		const pieceObj = this.createPiece(newPiece)

		squareElement.innerHTML = pieceObj.getPieceHtml()
		this.boardArray120[squareIndex] = pieceObj
	}

	// Place a new piece on the board
	place(pieceName, coordinate) {
		const piece = this.createPiece(pieceName)
		if (!piece) throw new Error('Invalid piece name')

		const squareIndex = this.coordinateToIndex120(coordinate)
		const square = this.getSquareFromIndex120(squareIndex)

		this.boardArray120[squareIndex] = piece
		square.innerHTML = piece.getPieceHtml()
	}

	//!-------------- Highlight Methods --------------

	// Highlight squares on the board
	highlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) {
				square.classList.add(square.classList.contains('lightSquare') ? 'lightHighlight' : 'darkHighlight')
			}
		})
	}

	// Unhighlight squares on the board
	unhighlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) {
				square.classList.remove('lightHighlight', 'darkHighlight')
			}
		})
	}

	//!-------------- Coordinate Methods --------------

	// Convert coordinates to board index
	coordinateToIndex120(coordinate) {
		if (typeof coordinate !== 'string' || coordinate.length !== 2) throw new Error('Invalid coordinate format')
		const file = coordinate.toLowerCase().charCodeAt(0) - 97
		const rank = 8 - parseInt(coordinate[1], 10)
		if (file < 0 || file > 7 || rank < 0 || rank > 7) throw new Error('Invalid coordinate')
		return Chessboard.MAILBOX_64[rank * 8 + file]
	}

	// Convert board index to coordinates
	index120ToCoordinate(squareIndex) {
		squareIndex = Chessboard.MAILBOX_120[squareIndex]
		if (squareIndex === undefined || squareIndex < 0 || squareIndex > 63) throw new Error('Invalid square index')
		const file = String.fromCharCode(97 + (squareIndex % 8))
		const rank = 8 - Math.floor(squareIndex / 8)
		return file + rank
	}

	//!-------------- Helper Methods --------------

	// Find the index of the king for a given color
	findKingIndex(colour) {
		const kingPiece = colour === 'white' ? 'K' : 'k'
		for (let i = 0; i < this.boardArray120.length; i++) {
			const piece = this.boardArray120[i]
			if (piece && piece.name === kingPiece) {
				return i
			}
		}
		throw new Error(`King of colour ${colour} not found on the board.`)
	}

	// Update en passant index based on move
	updateEnPassantIndex(fromCoord, toCoord, piece) {
		if (piece && piece.name.toLowerCase() === 'p') {
			const fromSquareIndex = this.coordinateToIndex120(fromCoord)
			const toSquareIndex = this.coordinateToIndex120(toCoord)
			this.enPassantIndex = null
			if (Math.abs(toSquareIndex - fromSquareIndex) === 20) {
				this.enPassantIndex = (fromSquareIndex + toSquareIndex) / 2
			}
		}
	}

	// Get a square element based on its index
	getSquareFromIndex120(squareIndex) {
		if (!this.boardElement) throw new Error('Board element not found')
		const square = this.boardElement.querySelector(`.square[index120="${squareIndex}"]`)
		if (!square) throw new Error('Square not found')
		return square
	}

	// Get the piece object on a given square
	getSquarePieceObj(coord) {
		const squareIndex = this.coordinateToIndex120(coord)
		return this.boardArray120[squareIndex]
	}

	// Get the HTML of the piece on a given square
	getSquarePieceHtml(coord) {
		const squareIndex = this.coordinateToIndex120(coord)
		return this.boardArray120[squareIndex]?.pieceHtml || ''
	}

	// Check if a square index is within the board's valid range
	isBoardIndex(squareIndex) {
		return squareIndex >= 21 && squareIndex <= 98 && squareIndex % 10 !== 0 && (squareIndex + 1) % 10 !== 0
	}

	// Check if a square is occupied
	isOccupied(squareIndex) {
		return this.boardArray120[squareIndex] !== ''
	}

	// Check if a square is occupied by an opponent's piece
	isOccupiedByOpponent(squareIndex, colour) {
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && piece.colour !== colour
	}

	// Check if a square is occupied by an ally's piece
	isOccupiedByAlly(squareIndex, colour) {
		if (!this.isBoardIndex(squareIndex)) return false
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && piece.colour === colour
	}

	// Check if the given squares are empty
	areSquaresEmpty(indices) {
		return indices.every((index) => !this.isOccupied(index))
	}
}
