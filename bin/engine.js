const _ = require('lodash');
const ioMsg = require('../public/js/io-messages');
const World = require('./world');

const TICK_RATE = 60;

var io;
var players = [];
var world = {};


class Engine {
	constructor(_io) {
		io = _io;
		this.onConnect = this.onConnect.bind(this);

		this.init();
	}

	init() {
		world = new World();

		io.on('connection', this.onConnect);
		setInterval(this.sendPlayersPositions, 1000 / TICK_RATE);
	}

	onConnect(socket) {
		this.addPlayer(socket);

		console.log('Player connected', socket.id);
  		console.log('Playes total: ', players.length);

  		socket.emit(ioMsg.obstacles,  world.obstacles);
  		socket.emit(ioMsg.boundaries, world.boundaries);

  		socket.on(ioMsg.playerPosition, function(data) {
  			for (var i = 0; i < players.length; i++) {
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