function getValidMoves(piece, currentPosition) {
	// Determine valid moves based on the piece type
	switch (piece.toLowerCase()) {
		case 'p':
			return getPawnMoves(currentPosition, piece)
		case 'n':
			return getKnightMoves(currentPosition)
		case 'b':
			return getBishopMoves(currentPosition)
		case 'r':
			return getRookMoves(currentPosition)
		case 'q':
			return getQueenMoves(currentPosition)
		case 'k':
			return getKingMoves(currentPosition)
		default:
			return [] // No valid moves for unknown pieces
	}
}

//!-------------- Normal Piece Moves --------------

// Valid moves for a pawn
function getPawnMoves(currentPosition, piece) {
	const dir = piece === 'P' ? -1 : 1
	const offsets = [10, 20]

	let validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset * dir
		validMoves.push(newPosition)
	})
	return validMoves
}

// Valid moves for a knight
function getKnightMoves(currentPosition) {
	const offsets = [-21, -19, -12, -8, 8, 12, 19, 21]
	const validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset
		validMoves.push(newPosition)
	})
	return validMoves
}

// Valid moves for a bishop
function getBishopMoves(currentPosition) {
	const offsets = [-11, -9, 9, 11]
	let validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset
		validMoves.push(newPosition)
	})
	return validMoves
}

// Valid moves for a rook
function getRookMoves(currentPosition) {
	const offsets = [-10, -1, 1, 10]
	let validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset
		validMoves.push(newPosition)
	})
	return validMoves
}

// Valid moves for a queen
function getQueenMoves(currentPosition) {
	const offsets = [-11, -10, -9, -1, 1, 9, 10, 11]
	let validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset
		validMoves.push(newPosition)
	})
	return validMoves
}

// Valid moves for a king
function getKingMoves(currentPosition) {
	const offsets = [-11, -10, -9, -1, 1, 9, 10, 11]
	const validMoves = []
	offsets.forEach((offset) => {
		const newPosition = currentPosition + offset
		validMoves.push(newPosition)
	})
	return validMoves
}

//!-------------- Special Piece Moves --------------
