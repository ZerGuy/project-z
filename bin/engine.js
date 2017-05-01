const ioMsg = require('../public/js/io-messages');
const _ = require('lodash');

var io;
var players = [];
var obstacles = [];

class Engine {
	constructor(_io) {
		io = _io;

		this.onConnect = this.onConnect.bind(this);

		this.init();
	}

	init() {
		this.generateObstacles();

		io.on('connection', this.onConnect);

		setInterval(this.sendPlayersPositions, 500);
	}

	generateObstacles() {
        obstacles.push(this.createObstacle(500, 100, 50, 100));
        obstacles.push(this.createObstacle(100, 100, 50, 100));
        obstacles.push(this.createObstacle(450, 400, 800, 50));
	}

	createObstacle(x, y, width, height) {
		return {
			x: x,
			y: y,
			width: width,
			height: height
		}
	}

	onConnect(socket) {
		this.addPlayer(socket);

		console.log('Player connected', socket.id);
  		console.log('Playes total: ', players.length);

  		socket.emit(ioMsg.obstacles, obstacles);

  		socket.on(ioMsg.playerPosition, function(data) {
  			for (var i = players.length - 1; i >= 0; i--) {
  				if (players[i].id !== socket.id)
  					continue;

  				players[i].x = data.x;
  				players[i].y = data.y;
  				return;
  			}
  		});

  		socket.on('disconnect', function() {
  			console.log('Player disconnected', socket.id);

  			for (var i = 0; i < players.length; i++){
  				if (players[i].id === socket.id) {
  					players.splice(i, 1);
  					break;
  				}
  			}

  			console.log('Playes total: ', players.length);
  		});
	}

	addPlayer(socket) {
		const pos = {
			x: 200 + players.length * 100,
			y: 200 + players.length * 100,
		};

		players.push({
  			id: socket.id,
  			x: pos.x,
  			y: pos.y,
  			socket: socket
  		});

  		socket.emit(ioMsg.spawn, {x: pos.x, y: pos.y});
	}

	onDisconnect(socket) {
		console.log('Player disconnected', some);
  			console.log('Player disconnected', socket.id);

  			for (var i = 0; i < players.length; i++){
  				if (players[i].id === socket.id) {
  					players.splice(i, 1);
  					break;
  				}
  			}

  			console.log('Playes total: ', players.length);
	}

	sendPlayersPositions() {
		function createPositionsArray(players) {
			return _.map(players, function(p) { 
				return {
					id: p.id,
					x : p.x, 
					y : p.y
				} 
			});
		}

		const positions = createPositionsArray(players);
		io.emit(ioMsg.players, positions)
	}
}

module.exports = Engine; 