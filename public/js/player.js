const Matter  = require('matter-js');
const drawObj = require('./drawObj');

const Body = Matter.Body;
const Vec  = Matter.Vector;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

class Player {
    constructor(x, y, engine) {
        this.draw = this.draw.bind(this);
        this.checkControls = this.checkControls.bind(this);

        this.body = Matter.Bodies.rectangle(x, y, BODY_X, BODY_Y);
        this.head = Matter.Bodies.circle(x, y, HEAD_RADIUS);

        this.person = Matter.Body.create({
            parts: [this.body, this.head],
            frictionAir: 0.9
        });

        Matter.World.add(engine.world, [this.person]);

        this.x = this.person.position.x;
        this.y = this.person.position.y;
        this.angle = 0;
    }

    draw() {
        this.checkControls();

        p5.stroke(0);
        drawObj(this.body);
        drawObj(this.head);
    }

    checkControls() {
        let force = Vec.create(0, 0);

        force = addForce(force, p5.UP_ARROW,    0,     -0.03);
        force = addForce(force, p5.DOWN_ARROW,  0,     0.03 );
        force = addForce(force, p5.RIGHT_ARROW, 0.03,  0    );
        force = addForce(force, p5.LEFT_ARROW,  -0.03, 0    );

        force = Vec.normalise(force);
        force = Vec.mult(force, 0.03);

        let angle = Vec.angle(Vec.create(0, 0), force) - Math.PI / 2;

        if (force.x === 0 && force.y === 0)
            return;

        Body.applyForce(this.person, this.person.position, force);
        Body.setAngle(this.person, angle);
    }
}


function addForce(force, key, x, y) {
    if (p5.keyIsDown(key))
        return Vec.add(force, Vec.create(x, y));
    
    return force;
}

module.exports = Player;
