const _ = require('lodash');
const ioMsg = require('../public/js/constants/io-messages');
const World = require('./world');

const TICK_RATE = 60;

let io;
let world = {};
window = {}; // Without `window` Matter.js fails to start on nodejs

class Engine {
    constructor(_io) {
        io = _io;
        this.onConnect = this.onConnect.bind(this);

        this.init();
    }

    init() {
        world = new World();

        io.on('connection', this.onConnect);
        setInterval(this.update.bind(this), 1000 / TICK_RATE);
    }

    onConnect(socket) {
        this.addPlayer(socket);

        socket.broadcast.emit(ioMsg.playerConnected, socket.id);
        socket.emit(ioMsg.obstacles, world.getObstacles());
        socket.emit(ioMsg.boundaries, world.getBoundaries());
        socket.emit(ioMsg.worldSize, world.size);

        socket.on(ioMsg.playerPosition, data => world.updatePlayer(data, socket.id));

        socket.on(ioMsg.addBullet, this.registerNewBullet.bind(this, socket));
        socket.on(ioMsg.removeBullet, data => world.removeBullet(data, socket.id));

        socket.on('disconnect', function () {
            world.removePlayer(socket.id);
            io.emit(ioMsg.playerDisconnected, socket.id);
        });
    }

    addPlayer(socket) {
        const spawnPos = world.addPlayer(socket);
        socket.emit(ioMsg.spawn, spawnPos);

        console.log('Player connected', socket.id);
        console.log('Playes total: ', world.players.length);
    }

    registerNewBullet(socket, data) {
        world.addBullet(data);
        socket.broadcast.emit(ioMsg.addBullet, data);
    }

    sendPlayersPositions() {
        function createPositionsArray(players) {
            return _.map(players, function (p) {
                return {
                    id: p.id,
                    position: [p.person.position[0], p.person.position[1]],
                    angle: p.person.angle,
                }
            });
        }

        const positions = createPositionsArray(world.players);
        io.emit(ioMsg.players, positions)
    }

    update() {
        world.update(1/ TICK_RATE);
        this.sendPlayersPositions();
    }
}

module.exports = Engine; 