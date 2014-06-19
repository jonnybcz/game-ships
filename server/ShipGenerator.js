/**
 * @param {Players} players
 */
ShipGenerator = function(players){
	this._players = players;
	this._fleet = [ // tvary jednotlivych lodi
			[[0, 0]],
			[[0, 0], [0, 1], [1, 0], [1, 1]],
			[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]
			];
	this._fleetPosition = []; // [[0,0], [5,6]] pozice lodi, od boodu 0,0
	this._countShips = this._fleet.length - 1;
}

ShipGenerator.prototype.generateFleetPosition = function(){
	for (var i = 0; i < this._fleet.length; i++) {
		var tryIt = 50;
		var ship = this._fleet[i];

		while (tryIt > 0){
			var generatedPosition = this._generateRandomPosition();

			if (!this._isOnPositionAnyShip(generatedPosition, ship)) {
				this._fleetPosition.push(generatedPosition);

				continue;
			}

			tryIt--;
		}

		//@todo // zacni rucne prochazet mapu a hledat misto kam zaparkujes lod !!!
	}
}

/**
 * @param  {Number} maxX
 * @param  {Number} maxY
 * @return {[x, y]}
 */
ShipGenerator.prototype._generateRandomPosition = function(maxX, maxY){
	return [Math.round(Math.random() * maxX), Math.round(Math.random() * maxY)];
}

/**
 * @param  {[x, y]}  position
 * @param  {[]}  ship
 * @return {Boolean}
 */
ShipGenerator.prototype._isOnPositionAnyShip = function(position, ship){
	var shipSize = this._getShipWidthAndHeight(ship);


}

/**
 * vrati delku a sirku lode vc prazdnych policek
 * @param  {[]} ship
 * @return {{}}
 */
ShipGenerator.prototype._getShipWidthAndHeight = function(ship){
	var xy = {x: [], y: []};

	for (var i = 0; i < ship.length; i++) {
		xy.x.push(ship[i][0]); // posbirame si vsechny cisla z osy x
		xy.y.push(ship[i][0]); // posbirame si vsechny cisla z osy y
	}

	xy.x = xy.x.sort(function(a, b){ return a - b; })
	xy.y = xy.y.sort(function(a, b){ return a - b; })

	xy.width = xy.x[xy.x.length - 1] - xy.x[0] + 1;
	xy.height = xy.y[xy.y.length - 1] - xy.y[0] + 1;

	return xy;
}
