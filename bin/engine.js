var io;
var players = [];
var obstacles = [];

class Engine {
	constructor(_io) {
		io = _io;

		this.init();
	}

	init() {
		this.generateObstacles();

		io.on('connection', this.onConnect);
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
		console.log('Player connected', socket.id);

  		players.push({
  			id: socket.id,
  			x: 100,
  			y: 100,
  			socket: socket
  		});

  		console.log('Playes total: ', players.length);

  		socket.emit('obstacles', obstacles);

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

	
}

function onDisconnect(id) {
    
}

module.exports = Engine; 