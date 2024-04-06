const game = new Game()
game.start()

const bot1 = new Bot(game, 'white')
const bot2 = new Bot(game, 'black')

setInterval(() => {
	bot1.makeRandomMove()
	game.switchTurn()
	bot2.makeRandomMove()
	game.switchTurn()
}, 1000)
