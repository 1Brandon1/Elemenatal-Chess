class Chessboard {
	constructor() {
		this.boardElement = document.getElementById('Board')
		this.boardArray120 = new Array(120).fill('off')
		this.orientation = 'white'
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
		let index = 0
		fenParts.forEach((rowFen) => {
			for (let char of rowFen) {
				if (/[1-8]/.test(char)) {
					index += parseInt(char, 10)
				} else {
					boardArray[index++] = char
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
		boardArray.forEach((pieceCode, index) => {
			const index120 = this.mailbox64[index]
			const square = document.createElement('div')
			square.classList.add('square')
			square.classList.add(((index % 8) + Math.floor(index / 8)) % 2 === 1 ? 'darkSquare' : 'lightSquare')
			square.setAttribute('coordinate', this.index120ToCoordinate(index120))
			square.setAttribute('index120', index120)
			const piece = pieceCode ? this.createPiece(pieceCode) : ''
			square.innerHTML = piece ? piece.getPieceHtml() : ''
			square.addEventListener('click', (event) => game.squareClicked(event))
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

	// place a piece on a given square
	place(pieceName, coordinate) {
		const piece = this.createPiece(pieceName)
		if (!piece) throw new Error('Invalid piece name')
		const index = this.coordinateToIndex120(coordinate)
		const square = this.getSquareFromIndex120(index)
		this.boardArray120[index] = piece
		square.innerHTML = piece.getPieceHtml()
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

	//!-------------- Helper Methods --------------

	// Convert coordinate to index
	coordinateToIndex120(coordinate) {
		if (typeof coordinate !== 'string' || coordinate.length !== 2) throw new Error('Invalid coordinate format')
		const file = coordinate.toLowerCase().charCodeAt(0) - 97
		const rank = 8 - parseInt(coordinate[1])
		if (file < 0 || file > 7 || rank < 0 || rank > 7) throw new Error('Invalid coordinate')
		return this.mailbox64[rank * 8 + file]
	}

	// Convert index to coordinate
	index120ToCoordinate(index) {
		index = this.mailbox120[index]
		if (index === undefined || index < 0 || index > 63) throw new Error('Invalid index')
		const file = String.fromCharCode(97 + (index % 8))
		const rank = 8 - Math.floor(index / 8)
		return file + rank
	}

	// Gets the square element from index
	getSquareFromIndex120(index) {
		if (!this.boardElement) throw new Error('Board element not found')
		const square = this.boardElement.querySelector(`.square[index120="${index}"]`)
		if (!square) throw new Error('Square not found')
		return square
	}

	getSquarePieceObj(coord) {
		const index = this.coordinateToIndex120(coord)
		return this.boardArray120[index].name
	}

	// Gets the html piece element on a square
	getSquarePieceHtml(coord) {
		const index = this.coordinateToIndex120(coord)
		const square = this.getSquareFromIndex120(index)
		return square.querySelector('.piece')
	}
}
