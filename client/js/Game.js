var Game = function(){
	this._elementKey = document.querySelector("#key");
	this._elementGame = document.querySelector("#game");
	this._gameId = undefined;
	this._elementForMessages = document.querySelector("#messages");

	this.showErrors();

	if (!window.location.hash.match("key")) {
		// prvni hrac
		this.getKeyFromServer();

		socket.on("serverSendingKey", this.serverSentKey.bind(this));
	}else {
		// druhy hrac
		this.putKeyOnServer();
	}

	socket.on("startGame", this.start.bind(this));
	socket.on("gameNotExists", this._gameNotExists.bind(this));
};

/**
* @param {String}	gameId
* @returns {String}
*/
Game.prototype.setGameId = function(gameId){
	return this._gameId = gameId;
}

// pro prvniho hrace
Game.prototype.getKeyFromServer = function(){
	socket.emit('clientWantKey');
}

// pro druheho hrace
Game.prototype.putKeyOnServer = function(){
	socket.emit("playerHaveAKey", {key: this.setGameId(window.location.hash.split("=")[1])});
}

Game.prototype.resetTimer = function(data){
	if (data.onTheMove) {
		document.querySelector("#map2").style.backgroundColor = "white";
	}else {
		document.querySelector("#map2").style.backgroundColor = "grey";
	}

	this._timer.reset((data.lengthOfMove / 1000) - 1);
}

/**
* @param {{}} 	data ... {key: "xxxx"}
*/
Game.prototype.serverSentKey = function(data){
	var anchor = "<p class='code'>" + window.location.origin + "/#key=" + this.setGameId(data.key) + "</p>";

	this._elementKey.insertAdjacentHTML("beforeend", anchor);
}

/**
* @param {{}}	data ... {ships: [], mapSize: {cols: n, rows: n}, gameId: "sds"}
*/
Game.prototype.start = function(data){
	this._elementGame.innerHTML = "";

	this._map = new Map(data.mapSize, data.gameId, this);
	this._map.render(document.querySelector("#map1"));
	this._map.renderFleet(document.querySelector("#map1"), data.fleetOnWater);
	this._map.render(document.querySelector("#map2"));
	this._map.addListenersOnTd(document.querySelector("#map2"));

	this._timer = new Timer(this._map.renderTimer);

	socket.on("hit", this._map.renderHit);
	socket.on("youHaveBeenHit", this._map.renderYouHaveBeenHit);
	socket.on("miss", this._map.renderMiss);
	socket.on("youHaveBeenMiss", this._map.renderYouHaveBeenMiss);
	socket.on("resetTimer", game.resetTimer.bind(this));
	socket.on("endGame", this._map.renderEndGame);
	socket.on("leftGame", this._gameNotExists.bind(this, true));
	socket.on("youWin", this._map.renderYouWin.bind(this._map));
	socket.on("youLose", this._map.renderYouLose.bind(this._map));

	sound.play("sonar");
	message.add("------- START -------");
}

Game.prototype._gameNotExists = function(playerLeftGame){
	document.querySelector("#screen2").classList.add("hide");
	this._elementGame.innerHTML = "Hra neexistuje. " + (playerLeftGame ? "<br> Druhý hráč opustil hru." : "");
	this._elementGame.insertAdjacentHTML("beforeend", "<br/><br/><a href='/' class='btn'>Založit novou hru</a>")
}

Game.prototype.showErrors = function(){
	socket.on("error", function (data) {
		message.add(data.message);
	});
}