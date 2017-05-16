const Matter = require('matter-js');
const drawObj = require('./drawObj');

class Bullet {
    constructor(x, y, dx, dy) {
        this.body = Matter.Bodies.rectangle(x, y, 10, 20);
        this.dx = dx;
        this.dy = dy;
    }

    update() {

    }

    draw() {
        p5.stroke(0);
        p5.fill(10, 200, 100);
        p5.strokeWeight(1);
        drawObj(this.body);
    }
}

module.exports = Bullet;