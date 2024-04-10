const game = new Game()
game.start()

const bot1 = new Bot(game, 'white')
const bot2 = new Bot(game, 'black')

// setInterval(() => {
// 	// if (game.currentTurn === bot1.colour && !game.gameOver) {
// 	bot1.makeRandomMove()
// 	game.switchTurn()
// 	// }

// 	// if (game.currentTurn === bot2.colour && !game.gameOver) {
// 	bot2.makeRandomMove()
// 	game.switchTurn()
// 	// }
// }, 10)
