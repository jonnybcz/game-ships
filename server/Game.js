Game = function(players, ioSockets){
	this._players = players;
	this._ioSockets = ioSockets;
	this._timerId;
}

Game.prototype.timer = function(gameId, time){
	var lengthOfMove = 10000; // delka tahu
	var game = this._players.getGame(gameId);

	if (this._timerId) { clearTimeout(this._timerId); };

	this._timerId = setTimeout(function(){
		this._players.switchMove(gameId); // druhy hrac bude na tahu
		this._ioSockets.socket(game.firstPlayerId).emit("resetTimer", {onTheMove: game.firstPlayerId == game.onTheMove ? true : false, lengthOfMove: lengthOfMove });
		this._ioSockets.socket(game.secondPlayerId).emit("resetTimer", {onTheMove: game.secondPlayerId == game.onTheMove ? true : false, lengthOfMove: lengthOfMove });
		this.timer(gameId);
	}.bind(this), time || lengthOfMove);
}

/*
	Listeners
*/

Game.prototype.clientWantKey = function (socket){
	this._players.createGame(socket.id);
	socket.emit("serverSendingKey", { key: socket.id });
}

Game.prototype.disconnect = function (socket){
	this._ioSockets.socket(this._players.getSecondPlayer(socket.id)).emit("leftGame");
	this._ioSockets.socket(this._players.getSecondPlayer(socket.id)).emit("gameNotExists", { message: "Hra neexistuje." });
}

Game.prototype.playerHaveAKey = function (socket, data){
	if (this._players.existsGameAndIsUnlocked(data.key)) {
		this._players.addSecondPlayer(data.key, socket.id);

		this._ioSockets.socket(data.key).emit("startGame", { fleetOnWater: this._players.getSecondPlayerFleetOnWater(data.key), mapSize: this._players.getMapSize(data.key), fleet: this._players.getFleet(data.key), gameId: data.key });
		this._ioSockets.socket(socket.id).emit("startGame", { fleetOnWater: this._players.getFirstPlayerFleetOnWater(data.key), mapSize: this._players.getMapSize(data.key), fleet: this._players.getFleet(data.key), gameId: data.key });
		this.timer(data.key, 1000);
	}else{
		this._ioSockets.socket(socket.id).emit("gameNotExists", { message: "Hra neexistuje." });
	}
}

Game.prototype.shoot = function (socket, data){
	if (socket.id != this._players.getGame(data.gameId).onTheMove) { return false; };

	var gameId = data.gameId;
	var shooted = this._players.shoot(gameId, socket.id, data.pos);
	var thrower = socket.id; // strilejici hrac
	var target = this._players.getSecondPlayer(thrower); // hrac ktery bude zasazen, nebo minut

	if (shooted) {
		this._ioSockets.socket(thrower).emit("hit", data);
		this._ioSockets.socket(target).emit("youHaveBeenHit", data);
	}else{
		this._ioSockets.socket(thrower).emit("miss", data);
		this._ioSockets.socket(target).emit("youHaveBeenMiss", data);
	}

	if (this._players.isEndGame(gameId)) {
		this._ioSockets.socket(thrower).emit("endGame", data);
		this._ioSockets.socket(target).emit("endGame", data);

		this._ioSockets.socket(this._players.whoWin(gameId)).emit("youWin", data);
		this._ioSockets.socket(this._players.whoLose(gameId)).emit("youLose", data);
	}

	this.timer(gameId, 20); // 20 ms, okamzite spusteni
}
