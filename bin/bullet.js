const p2 = require('p2');

class Bullet {
    constructor({position, velocity, id}) {
        this.id = id;

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

    getPosition() {
        return [this.body.position[0], this.body.position[1]];
    }

    getVelocity() {
        return [this.body.velocity[0], this.body.velocity[1]];
    }
}

module.exports = Bullet;