// Import Express framework
var express = require('express')
var app = express()
app.use(express.static('public'))
var http = require('http').Server(app)
var port = process.env.PORT || 3000 // Define port to listen on

// Define route for the root URL '/'
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/src/html/index.html')
})

// Listen on the specified port for incoming connections
http.listen(port, function () {
	console.log('listening on *:' + port)
})
