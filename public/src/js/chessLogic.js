function getValidMoves(piece, currentPosition) {
	const colour = piece === piece.toUpperCase() ? 'white' : 'black'
	const pieceType = piece.toLowerCase()

	switch (pieceType) {
		case 'p':
			return getPawnMoves(currentPosition, colour)
		case 'n':
			return getKnightOrKingMoves(currentPosition, colour, [-21, -19, -12, -8, 8, 12, 19, 21])
		case 'b':
			return getSlidingMoves(currentPosition, colour, [-11, -9, 9, 11])
		case 'r':
			return getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10])
		case 'q':
			return getSlidingMoves(currentPosition, colour, [-10, -1, 1, 10, -11, -9, 9, 11])
		case 'k':
			return getKnightOrKingMoves(currentPosition, colour, [-11, -10, -9, -1, 1, 9, 10, 11])
		default:
			return [] // No valid moves for unknown pieces
	}
}

function getKnightOrKingMoves(currentPosition, colour, offsets) {
	let validMoves = []
	for (let offset of offsets) {
		const newPosition = currentPosition + offset
		if (isValidPosition(newPosition) && !isOccupiedByAlly(newPosition, colour)) {
			validMoves.push(newPosition)
		}
	}
	return validMoves
}

function getPawnMoves(currentPosition, colour) {
	const dir = colour === 'white' ? -1 : 1
	const startingRank = colour === 'white' ? 8 : 3
	const offsets = [10 * dir]
	let validMoves = []

	if (Math.floor(currentPosition / 10) === startingRank) {
		offsets.push(20 * dir)
	}

	for (let offset of offsets) {
		const newPosition = currentPosition + offset
		if (isValidPosition(newPosition) && !isOccupied(newPosition)) {
			validMoves.push(newPosition)
		}
	}

	const captureOffsets = [9 * dir, 11 * dir]
	for (let offset of captureOffsets) {
		const newPosition = currentPosition + offset
		if (isValidPosition(newPosition) && isOccupiedByOpponent(newPosition, colour)) {
			validMoves.push(newPosition)
		}
	}

	return validMoves
}

function getSlidingMoves(currentPosition, colour, offsets) {
	let validMoves = []
	for (let offset of offsets) {
		let newPosition = currentPosition + offset
		while (isValidPosition(newPosition) && !isOccupiedByAlly(newPosition, colour)) {
			validMoves.push(newPosition)
			if (isOccupiedByOpponent(newPosition, colour)) break
			newPosition += offset
		}
	}
	return validMoves
}

function isValidPosition(squareIndex) {
	return squareIndex >= 21 && squareIndex <= 98 && squareIndex % 10 !== 0 && (squareIndex + 1) % 10 !== 0
}

function isOccupied(squareIndex) {
	const piece = game.chessboard.boardArray120[squareIndex]
	return piece !== ''
}

// Check if a square is occupied by an opponent piece
function isOccupiedByOpponent(squareIndex, colour) {
	const piece = game.chessboard.boardArray120[squareIndex]
	return piece !== '' && piece.colour !== colour
}

// Check if a square is occupied by an ally piece
function isOccupiedByAlly(squareIndex, colour) {
	const piece = game.chessboard.boardArray120[squareIndex]
	return piece !== '' && piece.colour === colour
}
