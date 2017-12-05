const drawObj = require('./drawObj');

const SPEED = 1000;

class Bullet {
    constructor({position, direction, id, velocity}) {
        this.id = id;

        if (!velocity) {
            let dx = direction[0] * SPEED;
            let dy = direction[1] * SPEED;
            velocity = [dx, dy]
        }

        const angle = Math.atan2(velocity[0], -velocity[1]);

        const shape = new p2.Box({
            width: 5,
            height: 10
        });

        this.body = new p2.Body({
            angle: angle,
            position: position,
            mass: 0.01,
            velocity: velocity,
            ccdSpeedThreshold: 1
        });

        this.body.addShape(shape);
    }

    update() {

    }

    draw() {
        p5.stroke(0);
        p5.fill(10, 200, 100);
        p5.strokeWeight(1);
        drawObj(this.body);
    }

    getPosition() {
        return [this.body.position[0], this.body.position[1]];
    }

    getVelocity() {
        return [this.body.velocity[0], this.body.velocity[1]];
    }
}

module.exports = Bullet;