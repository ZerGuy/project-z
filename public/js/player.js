const Matter = require('matter-js');
const drawObj = require('./drawObj');

const HEAD_RADIUS = 15;
const BODY_X = 50;
const BODY_Y = 20;

class Player {
    constructor(x, y, engine) {
        this.x = x;
        this.y = y;
        this.angle = 0;

        this.draw = this.draw.bind(this);

        this.body = Matter.Bodies.rectangle(x, y, BODY_X, BODY_Y);
        this.head = Matter.Bodies.circle(x, y, HEAD_RADIUS);
        Matter.World.add(engine.world, [this.body, this.head]);

        this.composite = Matter.Composite.create();
        Matter.Composite.add(this.composite, this.body);
        Matter.Composite.add(this.composite, this.head);
    }

    draw() {
        drawObj(this.body);
        drawObj(this.head);
    }
}

module.exports = Player;
