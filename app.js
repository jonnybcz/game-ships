var app = require('http').createServer(handler)
var io = require('socket.io').listen(app)
var fs = require('fs')
var url = require('url')

require('./server/Players.js');
require('./server/Game.js');
require('./server/ShipGenerator.js');

app.listen(3000);

function returnFile(row, res, statusCode){
	var file = fs.readFileSync(__dirname + "/client" + (row.file || row.action));
	res.writeHead(statusCode, {"Content-Type": row.contentType });
	res.end(file, row.type);
}

function handler (req, res) {
	var request = url.parse(req.url, true);
	var action = request.pathname;
	var files = [
		{action: "/", contentType: "text/html", type: "text", file: "/index.html"},
		{action: "/js/Timer.js", contentType: "text/javascript", type: "text"},
		{action: "/js/Map.js", contentType: "text/javascript", type: "text"},
		{action: "/js/Message.js", contentType: "text/javascript", type: "text"},
		{action: "/js/Game.js", contentType: "text/javascript", type: "text"},
		{action: "/js/Sound.js", contentType: "text/javascript", type: "text"},
		{action: "/sound/explosion.mp3", contentType: "audio/mpeg", type: "text"},
		{action: "/sound/sonar.mp3", contentType: "audio/mpeg", type: "text"},
		{action: "/sound/miss.mp3", contentType: "audio/mpeg", type: "text"},
		{action: "/img/water.png", contentType: "image/png", type: "binary"},
		{action: "/img/logo.png", contentType: "image/png", type: "binary"},
		{action: "/css/screen.css", contentType: "text/css", type: "text"},
		{action: "/error.html", contentType: "text/html", type: "text"}
	];

	for (var i = 0; i < files.length; i++) {
		if (files[i].action == action) { returnFile(files[i], res, 200); break; };
		if (i == files.length - 1) { returnFile(files[i], res, 404); };
	}
}

var players = new Players();
var game = new Game(players, io.sockets);
var shipGenerator = new ShipGenerator(players);

io.sockets.on("connection", function (socket) {
	socket.on("clientWantKey", game.clientWantKey.bind(game, socket));
	socket.on("disconnect", game.disconnect.bind(game, socket));
	socket.on("playerHaveAKey", game.playerHaveAKey.bind(game, socket));
	socket.on("shoot", game.shoot.bind(game, socket));
});
