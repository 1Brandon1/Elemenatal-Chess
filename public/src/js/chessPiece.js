class Piece {
	constructor(folder, colour, name, value) {
		// Initialize chess piece properties
		this.assetFolder = folder
		this.name = colour === 'white' ? name.toUpperCase() : name.toLowerCase()
		this.colour = colour
		this.value = value
		this.pieceHtml = null
	}

	// Generate HTML representation of the piece
	getPieceHtml() {
		if (!this.name) return ''
		const piececolour = this.colour === 'white' ? 'w' : 'b'
		const pieceImgSrc = `/assets/${this.assetFolder}/${piececolour}${this.name}.svg`
		this.pieceHtml = `<div class="piece ${this.colour}" id="${this.name}"><img src="${pieceImgSrc}" alt=""></div>`
		return this.pieceHtml
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

// Fire Mage piece class
class Fire extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'f', 600)
	}
}

// Water Mage piece class
class Water extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'w', 800)
	}
}

// Earth Golem piece class
class Earth extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'e', 550)
	}
}

// Air Spirit piece class
class Air extends Piece {
	constructor(colour) {
		super('specialPieces', colour, 'a', 900)
	}
}
