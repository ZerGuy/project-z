const Matter = require('matter-js');
const drawObj = require('./drawObj');
const keyCodes = require('./constants/keyCodes');
const ioMsg = require('./constants/io-messages');
const Knife = require('./knife');

const Body = Matter.Body;
const Vec = Matter.Vector;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

const SPEED = 0.05;

let mouseWasPressed = false;
let mEngine;
let knife;

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
        mEngine = engine;
    }

    update() {
        this.checkControls();
        this.checkMouse();
        this.notifyServer();
    }

    checkControls() {
        let force = Vec.create(0, 0);

        force = addForce(force, keyCodes.w, 0, -SPEED);
        force = addForce(force, keyCodes.s, 0, SPEED);
        force = addForce(force, keyCodes.d, SPEED, 0);
        force = addForce(force, keyCodes.a, -SPEED, 0);

        force = Vec.normalise(force);
        force = Vec.mult(force, SPEED);

        let angle = Vec.angle(Vec.create(0, 0), force) - Math.PI / 2;

        if (force.x === 0 && force.y === 0)
            return;

        Body.applyForce(this.person, this.person.position, force);
        Body.setAngle(this.person, angle);
    }

    checkMouse() {
        if (!p5.mouseIsPressed){
            mouseWasPressed = false;
            return;
        }

        if (mouseWasPressed)
            return;

        console.log('do');
        mouseWasPressed = true;
        knife = new Knife(mEngine, this.position.x + 50, this.position.y + 50);
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
        if (knife)
            knife.draw();
    }
}


function addForce(force, key, x, y) {
    if (p5.keyIsDown(key))
        return Vec.add(force, Vec.create(x, y));

    return force;
}

module.exports = Player;
