Players = function(){
	this._players = [];
}

/**
* @param {String} 	id
*/
Players.prototype.createGame = function(id){
	var game = {
		gameId: id, // socket.id zakladajiciho hrace
		timerId: undefined, // id setTimeout
		mapSize: [10, 10],
		firstPlayerId: id, // socket.id zakladajiciho hrace
		secondPlayerId: undefined, // socket.id druheho hrace
		onTheMove: id, // na tahu je
		fleet:[ // tvary jednotlivych lodi
			[[0, 0]]/*,
			[[0, 0], [0, 1], [1, 0], [1, 1]],
			[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]*/
		],
		firstPlayerFleetOnWater: [], // prepocitane pozice lodi na vode
		secondPlayerFleetOnWater: [], // prepocitane pozice lodi na vode
		firstPlayerPosFleet: [[0, 0]/*, [2, 2], [4, 4]*/], // pozice lodi od 0 0
		secondPlayerPosFleet: [[0, 0]/*, [2, 2], [4, 4]*/] // pozice lodi od 0 0
	}

	game.firstPlayerFleetOnWater = this._calcPosFleet(game.fleet, game.firstPlayerPosFleet);
	game.secondPlayerFleetOnWater = this._calcPosFleet(game.fleet, game.secondPlayerPosFleet);

	this._players.push(game);
}

/**
* @param {String} 	id
* @returns {{}}
*/
Players.prototype.getGame = function(id){
	for (var i = 0; i < this._players.length; i++) {
		var game = this._players[i];

		if (game.gameId == id) { return game; };
	}
}

/**
 * @param {String} gameId
 * @returns {Boolean}
 */
Players.prototype.isEndGame = function(gameId){
	var game = this.getGame(gameId);

	return game.firstPlayerFleetOnWater.length == 0 || game.secondPlayerFleetOnWater.length == 0;
}

/**
 * @param {String} gameId
 * @returns {String}
 */
Players.prototype.whoWin = function(gameId){
	var game = this.getGame(gameId);

	if (game.firstPlayerFleetOnWater.length == 0) { return game.secondPlayerId; };
	if (game.secondPlayerFleetOnWater.length == 0) { return game.firstPlayerId; };
}

/**
 * @param {String} gameId
 * @returns {String}
 */
Players.prototype.whoLose = function(gameId){
	return this.getSecondPlayer(this.whoWin(gameId));
}

/**
* @param {String}
* @returns {[[]]}
*/
Players.prototype.getFleet = function(gameId){
	return this.getGame(gameId).fleet;
}

/**
* @param {String}
* @returns {[[]]}
*/
Players.prototype.getFirstPlayerFleetOnWater = function(gameId){
	return this.getGame(gameId).firstPlayerFleetOnWater;
}

/**
* @param {String}
* @returns {[[]]}
*/
Players.prototype.getSecondPlayerFleetOnWater = function(gameId){
	return this.getGame(gameId).secondPlayerFleetOnWater;
}

/**
 * Vraci protihrace pro playerId
 * @param  {String} playerId
 * @return {String}
 */
Players.prototype.getSecondPlayer = function(playerId){
	for (var i = 0; i < this._players.length; i++) {
		if (this._players[i].firstPlayerId == playerId) { return this._players[i].secondPlayerId };
		if (this._players[i].secondPlayerId == playerId) { return this._players[i].firstPlayerId };
	}
}

/**
* @param {String}
* @returns {[]}
*/
Players.prototype.getMapSize = function(gameId){
	return this.getGame(gameId).mapSize;
}

/**
* @param {[[[]]]}
* @param {[[]]}
* @returns {[[]]}
*/
Players.prototype._calcPosFleet = function(fleet, posFleet){
	var fleetOnWater = [];

	for (var j = 0; j < fleet.length; j++) {
		for (var n = 0; n < fleet[j].length; n++) {
			console.log([posFleet[j][1] + fleet[j][n][1], posFleet[j][0] + fleet[j][n][0]]);
			fleetOnWater.push([posFleet[j][1] + fleet[j][n][1], posFleet[j][0] + fleet[j][n][0]]);
		}
	}

	return fleetOnWater;
}

/**
 * @param  {String} gameId
 */
Players.prototype.switchMove = function(gameId){
	var game = this.getGame(gameId);
	game.onTheMove = this.getSecondPlayer(game.onTheMove);
}

/**
* @param {String}	id
* @returns {Boolean}
*/
Players.prototype.existsGameAndIsUnlocked = function(id){
	var game = this.getGame(id);

	if (!game) { return false; };
	if (game.gameId == id && game.secondPlayerId == undefined) { return true }
	else { return false; }
}

/**
* @param {String}	gameId
* @param {String}	playerId
* @param {[]}		posShoot
* @returns {Boolean}
*/
Players.prototype.shoot = function(gameId, playerId, posShoot){
	var posFleet = (gameId == playerId ? this.getSecondPlayerFleetOnWater(gameId) : this.getFirstPlayerFleetOnWater(gameId));
	var remove = undefined;

	for (var i = 0; i < posFleet.length; i++) {
		if (posFleet[i][0] == posShoot[0] && posFleet[i][1] == posShoot[1]) {
			remove = i;
		}
	}

	if (remove != undefined) {
		posFleet.splice(remove, 1);

		return true;
	};

	return false;
}

/**
 * @param {String}	key
 * @param {String} 	secondKey
 */
Players.prototype.addSecondPlayer = function(key, secondKey){
	var game = this.getGame(key);

	game.secondPlayerId = secondKey;
}

