class Chessboard {
	// Predefined constants for board indices
	// prettier-ignore
	static MAILBOX120 = [
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
	static MAILBOX64 = [
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
		this.boardArray120 = new Array(120).fill('off')
		this.orientation = 'white'
		this.game = game
		this.enPassantIndex = null
		if (!this.boardElement) throw new Error('Board element not found in the DOM')
		this.initSounds()
	}

	// Initialize sound effects
	initSounds() {
		this.soundEffects = new Map([
			['move', new Audio('/assets/sounds/move.mp3')],
			['capture', new Audio('/assets/sounds/capture.mp3')],
			['castle', new Audio('/assets/sounds/castle.mp3')],
			['check', new Audio('/assets/sounds/check.mp3')],
			['promote', new Audio('/assets/sounds/promote.mp3')]
		])
	}

	// Check if a given FEN string is valid
	isValidFEN(fen) {
		if (!/^[prnbqkfweaPRNBQKFWEA1-8\/]+$/.test(fen)) return false

		const ranks = fen.split(' ')[0].split('/')
		if (ranks.length !== 8) return false

		return ranks.every((rank) => {
			let squareCount = 0
			for (const char of rank) {
				if (/[1-8]/.test(char)) squareCount += parseInt(char, 10)
				else if (/[prnbqkfweaPRNBQKFWEA]/.test(char)) squareCount++
				else return false
			}
			return squareCount === 8
		})
	}

	// Convert a FEN string to a 64-square board array
	convertFENtoArray64(fen) {
		if (!this.isValidFEN(fen)) throw new Error('Invalid FEN string')

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
		const boardArray = this.convertFENtoArray64(fen)
		this.clear()
		const fragment = document.createDocumentFragment() // Create a document fragment for performance

		boardArray.forEach((pieceCode, squareIndex) => {
			const index120 = Chessboard.MAILBOX64[squareIndex]
			const square = this.createSquareHtml(pieceCode, index120, squareIndex)
			fragment.appendChild(square)
		})

		this.boardElement.appendChild(fragment) // Append all squares at once
	}

	// Create a square element
	createSquareHtml(pieceCode, index120, squareIndex) {
		const square = document.createElement('div')
		const isDarkSquare = ((squareIndex % 8) + Math.floor(squareIndex / 8)) % 2 === 1
		square.className = `square ${isDarkSquare ? 'darkSquare' : 'lightSquare'}`
		square.setAttribute('coordinate', this.index120ToCoordinate(index120))
		square.setAttribute('index120', index120)

		const pieceHtml = pieceCode ? this.createPieceHtml(pieceCode) : ''
		square.innerHTML = pieceHtml ? pieceHtml : ''
		square.addEventListener('click', (event) => this.game.handleSquareClick(event))

		this.boardArray120[index120] = pieceCode ? pieceCode : ''
		return square
	}

	// Generate HTML representation of the piece
	createPieceHtml(pieceCode) {
		if (!pieceCode) return ''
		const isRegularPiece = ['p', 'r', 'b', 'n', 'q', 'k'].includes(pieceCode.toLowerCase())
		const pieceColour = pieceCode === pieceCode.toUpperCase() ? 'white' : 'black'
		const pieceImgSrc = `/assets/${isRegularPiece ? 'chessPieces' : 'specialPieces'}/${pieceColour[0]}${pieceCode.toUpperCase()}.svg`
		return `<div class="piece ${pieceColour}" id="${pieceCode}"><img src="${pieceImgSrc}" alt=""></div>`
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
			this.soundEffects.get('capture').play()
			toSquare.removeChild(existingPiece)
		} else {
			this.soundEffects.get('move').play()
		}

		toSquare.appendChild(pieceToMove)
		this.boardArray120[toSquareIndex] = this.boardArray120[fromSquareIndex]
		this.boardArray120[fromSquareIndex] = ''

		this.updateEnPassantIndex(fromCoord, toCoord, this.boardArray120[toSquareIndex])
	}

	// Perform castling move
	castle(kingFromCoord, kingToCoord) {
		const kingFromIndex = this.coordinateToIndex120(kingFromCoord)
		const kingToIndex = this.coordinateToIndex120(kingToCoord)
		const kingToMove = this.getSquareFromIndex120(kingFromIndex).querySelector('.piece')

		const direction = kingToIndex > kingFromIndex ? 1 : -1
		const rookFromIndex = direction === 1 ? kingFromIndex + 3 : kingFromIndex - 4
		const rookToIndex = kingToIndex - direction

		const rookToMove = this.getSquareFromIndex120(rookFromIndex).querySelector('.piece')

		if (rookToMove) {
			this.getSquareFromIndex120(kingToIndex).appendChild(kingToMove)
			this.boardArray120[kingToIndex] = this.boardArray120[kingFromIndex]
			this.boardArray120[kingFromIndex] = ''

			this.getSquareFromIndex120(rookToIndex).appendChild(rookToMove)
			this.boardArray120[rookToIndex] = this.boardArray120[rookFromIndex]
			this.boardArray120[rookFromIndex] = ''
			this.soundEffects.get('castle').play()
		}
	}

	// Performs an en passant capture on the board
	enPassant(fromCoord, toCoord) {
		const dir = this.getPieceColour(this.boardArray120[this.coordinateToIndex120(fromCoord)]) === 'white' ? 1 : -1
		const capturedPawnIndex = this.coordinateToIndex120(toCoord) + 10 * dir

		this.boardArray120[capturedPawnIndex] = ''
		this.getSquareFromIndex120(capturedPawnIndex).innerHTML = ''
		this.move(fromCoord, toCoord)
		this.soundEffects.get('capture').play()
	}

	// Promote a pawn to a different piece
	promote(coord, colour) {
		const squareIndex = this.coordinateToIndex120(coord)

		// allow the user to pick the piece to promote to
		const option = 'Q'

		const newPiece = colour === 'black' ? option.toLowerCase() : option
		const pieceHtml = this.createPieceHtml(newPiece)

		this.getSquareFromIndex120(squareIndex).innerHTML = pieceHtml
		this.boardArray120[squareIndex] = newPiece
	}

	// Place a new piece on the board
	place(pieceName, coordinate) {
		const pieceHtml = this.createPieceHtml(pieceName)
		if (!pieceHtml) throw new Error('Invalid piece name')

		const squareIndex = this.coordinateToIndex120(coordinate)
		this.boardArray120[squareIndex] = pieceName
		this.getSquareFromIndex120(squareIndex).innerHTML = pieceHtml
		this.soundEffects.get('move').play()
	}

	//!-------------- Highlight Methods --------------

	// Highlight squares on the board
	highlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) square.classList.add(square.classList.contains('lightSquare') ? 'lightHighlight' : 'darkHighlight')
		})
	}

	// Unhighlight squares on the board
	unhighlightSquares(moves) {
		moves.forEach((move) => {
			const square = this.boardElement.querySelector(`.square[index120="${move}"]`)
			if (square) square.classList.remove('lightHighlight', 'darkHighlight')
		})
	}

	//!-------------- Coordinate Methods --------------

	// Convert coordinates to board index
	coordinateToIndex120(coordinate) {
		if (typeof coordinate !== 'string' || coordinate.length !== 2) throw new Error('Invalid coordinate format')
		const file = coordinate.toLowerCase().charCodeAt(0) - 97
		const rank = 8 - parseInt(coordinate[1], 10)
		if (file < 0 || file > 7 || rank < 0 || rank > 7) throw new Error('Invalid coordinate')
		return Chessboard.MAILBOX64[rank * 8 + file]
	}

	// Convert board index to coordinates
	index120ToCoordinate(squareIndex) {
		squareIndex = Chessboard.MAILBOX120[squareIndex]
		if (squareIndex === undefined || squareIndex < 0 || squareIndex > 63) throw new Error('Invalid square index')
		return String.fromCharCode(97 + (squareIndex % 8)) + (8 - Math.floor(squareIndex / 8))
	}

	//!-------------- Helper Methods --------------

	// Find the index of the king for a given colour
	findKingIndex(colour) {
		for (let i = 0; i < 120; i++) {
			const piece = this.boardArray120[i]
			if (piece && (piece === colour) === 'white' ? 'K' : 'k') return i
		}
		throw new Error(`King of colour ${colour} not found on the board.`)
	}

	// Update en passant index based on move
	updateEnPassantIndex(fromCoord, toCoord, piece) {
		if (piece && piece.toLowerCase() === 'p') {
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

	// Get the piece on a given square
	getPieceFromCoordinate(coord) {
		return this.boardArray120[this.coordinateToIndex120(coord)]
	}

	// Determine the colour of a piece based on its name.
	getPieceColour(pieceName) {
		return pieceName[0] === pieceName[0].toUpperCase() ? 'white' : 'black'
	}

	// Check if a square index is within the board's valid range
	isValidBoardIndex(squareIndex) {
		return squareIndex >= 21 && squareIndex <= 98 && squareIndex % 10 !== 0 && (squareIndex + 1) % 10 !== 0
	}

	// Check if a square is occupied by an opponent's piece
	isSquareOccupiedByOpponent(squareIndex, colour) {
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && this.getPieceColour(piece) !== colour
	}

	// Check if a square is occupied by an ally's piece
	isSquareOccupiedByAlly(squareIndex, colour) {
		if (!this.isValidBoardIndex(squareIndex)) return false
		const piece = this.boardArray120[squareIndex]
		return piece !== '' && this.getPieceColour(piece) === colour
	}

	// Check if a square is occupied
	isSquareOccupied(squareIndex) {
		return this.boardArray120[squareIndex] !== ''
	}

	// Check if the given squares are empty
	areSquaresEmpty(indices) {
		return indices.every((index) => !this.isSquareOccupied(index))
	}

	// Check if a square is under attack by the opponent
	isSquareUnderAttack(squareIndex, opponentColour) {
		const pieceOffsets = {
			p: [10, 20],
			n: [-21, -19, -12, -8, 8, 12, 19, 21],
			b: [-11, -9, 9, 11],
			r: [-10, -1, 1, 10],
			q: [-10, -1, 1, 10, -11, -9, 9, 11],
			k: [-11, -10, -9, -1, 1, 9, 10, 11]
		}

		// Helper function to check if a square is attacked by a specific piece type
		const isAttackedByPiece = (offsets, pieceType) => {
			for (const offset of offsets) {
				let index = squareIndex + offset
				while (this.isValidBoardIndex(index)) {
					const piece = this.boardArray120[index]
					if (piece) {
						if (this.getPieceColour(piece) === opponentColour && piece.toLowerCase() === pieceType) {
							return true
						}
						if (piece.toLowerCase() !== pieceType) break
					}
					if (pieceType === 'n' || pieceType === 'k') break // Knights and kings don't slide
					index += offset
				}
			}
			return false
		}

		// Check pawn attacks
		const pawnOffsets = opponentColour === 'white' ? [11, 9] : [-11, -9]
		if (
			pawnOffsets.some((offset) => {
				const index = squareIndex + offset
				return this.isValidBoardIndex(index) && this.isSquareOccupiedByOpponent(index, opponentColour === 'white' ? 'black' : 'white')
			})
		) {
			return true
		}

		// Check for knights
		if (isAttackedByPiece(pieceOffsets.n, 'n')) return true

		// Check for bishops, rooks, and queens
		if (isAttackedByPiece(pieceOffsets.b, 'b') || isAttackedByPiece(pieceOffsets.r, 'r') || isAttackedByPiece(pieceOffsets.q, 'q')) return true
		if (isAttackedByPiece(pieceOffsets.k, 'k')) return true

		return false
	}
}
