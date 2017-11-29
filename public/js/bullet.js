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

        const shape = new p2.Box({
            width: 5,
            height: 10
        });

        this.body = new p2.Body({
            position: [x,y],
            mass: 0.01,
            velocity: [dx, dy],
        });

        this.body.addShape(shape);
    }

    update() {

    }

    draw() {
        //todo
        // if (this.body.velocity[0] !== 0 && this.body.velocity[1] !== 0){
        //     const angle = Matter.Vector.angle(Matter.Vector.create(0, -1), this.body.velocity) + Math.PI / 2;
        //     this.body.angle = angle;
        // }

        p5.stroke(0);
        p5.fill(10, 200, 100);
        p5.strokeWeight(1);
        drawObj(this.body);
    }
}

module.exports = Bullet;