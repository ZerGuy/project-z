const Matter = require('matter-js');
const drawObj = require('./drawObj');

const SPEED = 3;

class Bullet {
    constructor(x, y, dx, dy) {
        this.dx = dx / 100 * SPEED;
        this.dy = dy / 100 * SPEED;

        const angle = 2 * Matter.Vector.angle(Matter.Vector.create(0, -1), Matter.Vector.create(dx, dy)); //WTF

        const config = {
            angle: angle,
            restitution: 0.9,
            frictionAir: 0.001,
        };

        this.body = Matter.Bodies.rectangle(x, y, 10, 20, config);

        Matter.Body.applyForce(this.body, this.body.position, Matter.Vector.create(this.dx, this.dy));
    }

    update() {

    }

    draw() {
        if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0){
            const angle = Matter.Vector.angle(Matter.Vector.create(0, -1), this.body.velocity) + Math.PI / 2;
            Matter.Body.setAngle(this.body, angle);
        }

        p5.stroke(0);
        p5.fill(10, 200, 100);
        p5.strokeWeight(1);
        drawObj(this.body);
    }
}

module.exports = Bullet;