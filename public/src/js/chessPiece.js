class Piece {
	constructor(folder, colour, name, value) {
		// Initialize chess piece properties
		this.assetFolder = folder
		this.name = colour === 'white' ? name.toUpperCase() : name.toLowerCase()
		this.colour = colour
		this.value = value
		this.piecesTaken = 0
	}

	// Generate HTML representation of the piece
	getPieceHtml() {
		if (!this.name) return ''
		const piececolour = this.colour === 'white' ? 'w' : 'b'
		const pieceImgSrc = `/assets/${this.assetFolder}/${piececolour}${this.name}.svg`
		return `<div class="piece ${this.colour}" id="${this.name}"><img src="${pieceImgSrc}" alt=""></div>`
	}
}

//!-------------- Normal Pieces --------------

// Pawn piece class
class Pawn extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'p', 100)
		this.dir = colour === 'white' ? -1 : 1
	}
}

// Knight piece class
class Knight extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'n', 300)
	}
}

// Bishop piece class
class Bishop extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'b', 300)
	}
}

// Rook piece class
class Rook extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'r', 500)
	}
}

// Queen piece class
class Queen extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'q', 900)
	}
}

// King piece class
class King extends Piece {
	constructor(colour) {
		super('chessPieces', colour, 'k', 100000)
	}
}

//!-------------- Special Pieces --------------

// Squire piece class (upgraded pawn)
class Squire extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 's', 150)
	}
}

// Cardinal piece class (upgraded bishop)
class Cardinal extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'c', 425)
	}
}

// Dragon piece class (upgraded knight)
class Dragon extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'd', 425)
	}
}

// Warden piece class (upgraded rook)
class Warden extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'w', 700)
	}
}

// Archon piece class (upgraded queen)
class Archon extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'a', 1100)
	}
}
