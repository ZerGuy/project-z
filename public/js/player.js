const Matter = require('matter-js');
const drawObj = require('./drawObj');
const keyCodes = require('./constants/keyCodes');
const ioMsg = require('./constants/io-messages');
const Bullet = require('./bullet');
const Renderer = require('./renderer');

const Vec = Matter.Vector;

const HEAD_RADIUS = 15;
const BODY_X = 60;
const BODY_Y = 20;

const SPEED = 50;

let mouseWasPressed = false;

class Player {
    constructor(x, y, id, world) {
        this.draw = this.draw.bind(this);
        this.checkControls = this.checkControls.bind(this);

        this.body = new p2.Box({width: BODY_X, height: BODY_Y});
        this.head = new p2.Circle({radius: HEAD_RADIUS});
        this.nose = new p2.Box({width: 5, height: 10});
        this.shootFromPoint = new p2.Box({sensor: true});

        this.person = new p2.Body({
            position: [x, y],
            damping: 0.99,
            mass: 1
        });

        this.person.addShape(this.body);
        this.person.addShape(this.head);
        this.person.addShape(this.nose, [0, -10]);
        this.person.addShape(this.shootFromPoint, [BODY_X / 2, -BODY_Y / 2 - 15]);

        world.addBody(this.person);

        this.position = this.person.position;
        this.id = id;
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

        const dx = x - this.shootFromPoint.position[0]; //todo calculate correctly
        const dy = y - this.shootFromPoint.position[1];
        console.log(this.shootFromPoint);

        //todo get rid of matter
        const angle = Vec.angle(Vec.create(0, -1), Vec.create(dx, dy)) + Math.PI / 2;
        this.person.angle = angle;
    }

    checkControls() {
        let force = Vec.create(0, 0);

        force = addForce(force, keyCodes.w, 0, -1);
        force = addForce(force, keyCodes.s, 0, 1);
        force = addForce(force, keyCodes.d, 1, 0);
        force = addForce(force, keyCodes.a, -1, 0);

        force = Vec.normalise(force);
        force = Vec.mult(force, SPEED);

        if (force.x === 0 && force.y === 0)
            return;

        this.person.applyImpulse([force.x, force.y]);
    }

    checkMouse() {
        return; //todo
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
            x: this.person.position[0],
            y: this.person.position[1],
            angle: this.person.angle,
        };

        this.socket.emit(ioMsg.playerPosition, msg);
    }

    draw() {
        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);

        drawObj(this.person);
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
