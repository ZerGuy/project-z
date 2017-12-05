const p2 = require('p2');

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

class Player {
    constructor(socket, pos, world) {
        this.socket = socket;
        this.id = socket.id;

        this.bodyShape = new p2.Box({width: BODY_X, height: BODY_Y});

        this.person = new p2.Body({
            position: pos,
            damping: 0.99,
            mass: 1
        });

        this.person.addShape(this.bodyShape);

        world.addBody(this.person);
    }
}

module.exports = Player;