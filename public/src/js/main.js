const game = new Game()
game.start()

const bot1 = new Bot(game, 'white')
const bot2 = new Bot(game, 'black')

// setInterval(() => {
// 	if (game.currentTurn === bot2.colour && !game.gameOver) {
// 		bot2.makeRandomMove()
// 		game.switchTurn()
// 	}
// }, 1000)

// setInterval(() => {
// 	if (game.currentTurn === bot1.colour && !game.gameOver) {
// 		bot1.makeRandomMove()
// 		game.switchTurn()
// 	}

// 	if (game.currentTurn === bot2.colour && !game.gameOver) {
// 		bot2.makeRandomMove()
// 		game.switchTurn()
// 	}
// }, 1000)

// game.board.place('s', 'd4')
// game.board.place('c', 'c4')
// game.board.place('d', 'e4')
// game.board.place('w', 'f4')
// game.board.place('A', 'g4')

game.board.place('p', 'd4')
