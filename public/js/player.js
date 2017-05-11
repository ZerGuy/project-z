const Matter  = require('matter-js');
const drawObj = require('./drawObj');
const keyCodes = require('./keyCodes');
const ioMsg = require('./io-messages');

const Body = Matter.Body;
const Vec  = Matter.Vector;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

class Player {
    constructor(x, y, engine, id) {
        this.draw = this.draw.bind(this);
        this.checkControls = this.checkControls.bind(this);

        this.body = Matter.Bodies.rectangle(x, y, BODY_X, BODY_Y);
        this.head = Matter.Bodies.circle(x, y, HEAD_RADIUS);

        this.person = Body.create({
            parts: [this.body, this.head],
            frictionAir: 0.9,
            angle: 0,
        });

        Matter.World.add(engine.world, [this.person]);

        this.position = this.person.position;
        this.id = id;
    }

    update() {
        this.checkControls();
        this.notifyServer();
    }

    checkControls() {
        let force = Vec.create(0, 0);

        force = addForce(force, keyCodes.w, 0,     -0.03);
        force = addForce(force, keyCodes.s, 0,     0.03 );
        force = addForce(force, keyCodes.d, 0.03,  0    );
        force = addForce(force, keyCodes.a, -0.03, 0    );

        force = Vec.normalise(force);
        force = Vec.mult(force, 0.03);

        let angle = Vec.angle(Vec.create(0, 0), force) - Math.PI / 2;

        if (force.x === 0 && force.y === 0)
            return;

        Body.applyForce(this.person, this.person.position, force);
        Body.setAngle(this.person, angle);
    }

    notifyServer() {
        const msg = {
            x: this.person.position.x,
            y: this.person.position.y,
            angle: this.person.angle,
        };

        this.socket.emit(ioMsg.playerPosition, msg);
    }

    draw() {
        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        drawObj(this.body);
        drawObj(this.head);
    }
}


function addForce(force, key, x, y) {
    if (p5.keyIsDown(key))
        return Vec.add(force, Vec.create(x, y));
    
    return force;
}

module.exports = Player;
