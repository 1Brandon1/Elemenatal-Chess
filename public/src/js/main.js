const game = new Game()
game.start()

// game.board.place('p', 'D4')
// game.board.place('P', 'D5')

// const bot1 = new Bot(game, 'white')
// const bot2 = new Bot(game, 'black')

// setInterval(() => {
// 	if (game.currentTurn === bot2.colour && !game.gameOver) {
// 		bot2.makeRandomMove()
// 		game.switchTurn()
// 	}
// }, 1000)

// setInterval(() => {
// if (game.currentTurn === bot1.colour && !game.gameOver) {
// 	bot1.makeRandomMove()
// 	game.switchTurn()
// }

// if (game.currentTurn === bot2.colour && !game.gameOver) {
// 	bot2.makeRandomMove()
// 	game.switchTurn()
// }
// }, 1000)

// game.board.place('S', 'd4')
// game.board.place('C', 'c4')
// game.board.place('D', 'e4')
// game.board.place('W', 'g4')

game.board.place('A', 'e4')
