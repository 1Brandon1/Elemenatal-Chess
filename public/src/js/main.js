const game = new Game()
game.start()

document.addEventListener('keydown', (event) => {
	if (event.key.startsWith('Arrow')) {
		switch (event.key) {
			case 'ArrowLeft':
				game.undoMove()
				break
			case 'ArrowRight':
				game.redoMove()
				break
		}
	}
})

// const bot1 = new Bot(game, 'white')
// const bot2 = new Bot(game, 'black')

// setInterval(() => {
// 	if (game.activePlayer === bot2.colour && !game.gameOver) {
// 		bot2.makeRandomMove()
// 		game.toggleTurn()
// 	}
// }, 1000)

// setInterval(() => {
// 	if (game.activePlayer === bot1.colour && !game.gameOver) {
// 		bot1.makeRandomMove()
// 		game.toggleTurn()
// 	}

// 	if (game.activePlayer === bot2.colour && !game.gameOver) {
// 		bot2.makeRandomMove()
// 		game.toggleTurn()
// 	}
// }, 1000)
