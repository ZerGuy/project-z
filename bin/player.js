const Matter  = require('matter-js');
const Body = Matter.Body;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

class Player {
    constructor(socket, pos, engine) {
        this.socket = socket;
        this.id = socket.id;

        this.body = Matter.Bodies.rectangle(pos.x, pos.y, BODY_X, BODY_Y);
        this.head = Matter.Bodies.circle(pos.x, pos.y, HEAD_RADIUS);

        this.person = Body.create({
            parts: [this.body, this.head],
            frictionAir: 0.9,
            angle: 0,
        });

        Matter.World.add(engine.world, [this.person]);

        this.position = this.person.position;
    }
}

module.exports = Player;