const Matter = require('matter-js');
const drawObj = require('./drawObj');
const keyCodes = require('./constants/keyCodes');
const ioMsg = require('./constants/io-messages');
const Bullet = require('./bullet');
const Renderer = require('./renderer');

const Body = Matter.Body;
const Vec = Matter.Vector;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

const SPEED = 0.05;

let mouseWasPressed = false;
let mEngine;

class Player {
    constructor(x, y, engine, id) {
        this.draw = this.draw.bind(this);
        this.checkControls = this.checkControls.bind(this);

        this.body = Matter.Bodies.rectangle(x, y, BODY_X, BODY_Y);
        this.head = Matter.Bodies.circle(x, y, HEAD_RADIUS);
        this.nose = Matter.Bodies.rectangle(x, y - 10, 5, 10);
        this.shootFromPoint = Matter.Bodies.rectangle(x + BODY_X / 2, y - BODY_Y / 2 - 15, 1, 1, {isSensor: true});

        this.person = Body.create({
            parts: [this.body, this.head, this.nose, this.shootFromPoint],
            frictionAir: 0.9,
            angle: 0,
        });

        Matter.World.add(engine.world, [this.person]);

        this.position = this.person.position;
        this.id = id;
        mEngine = engine;
    }

    update() {
        this.updateAngle();
        this.checkControls();
        this.checkMouse();
        this.notifyServer();
    }

    updateAngle() {
        const x = p5.mouseX - Renderer.translateVector.x;
        const y = p5.mouseY - Renderer.translateVector.y;

        const dx = x - this.shootFromPoint.position.x;
        const dy = y - this.shootFromPoint.position.y;

        const angle = Vec.angle(Vec.create(0, -1), Vec.create(dx, dy)) + Math.PI / 2;
        Matter.Body.setAngle(this.person, angle);
    }

    checkControls() {
        let force = Vec.create(0, 0);

        force = addForce(force, keyCodes.w, 0, -SPEED);
        force = addForce(force, keyCodes.s, 0, SPEED);
        force = addForce(force, keyCodes.d, SPEED, 0);
        force = addForce(force, keyCodes.a, -SPEED, 0);

        force = Vec.normalise(force);
        force = Vec.mult(force, SPEED);

        if (force.x === 0 && force.y === 0)
            return;

        Body.applyForce(this.person, this.person.position, force);
    }

    checkMouse() {
        if (!p5.mouseIsPressed){
            mouseWasPressed = false;
            return;
        }

        if (mouseWasPressed)
            return;

        mouseWasPressed = true;

        const x = p5.mouseX - Renderer.translateVector.x;
        const y = p5.mouseY - Renderer.translateVector.y;

        const dx = Math.cos(this.person.angle - Math.PI / 2);
        const dy = Math.sin(this.person.angle - Math.PI / 2);

        Player.addBullet(new Bullet(this.shootFromPoint.position.x, this.shootFromPoint.position.y, dx, dy));
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
        drawObj(this.nose);
    }

    static addBullet(bullet) {
        console.log('nope');
    }
}


function addForce(force, key, x, y) {
    if (p5.keyIsDown(key))
        return Vec.add(force, Vec.create(x, y));

    return force;
}

module.exports = Player;
