const Matter = require('matter-js');
const Player = require('./player');
const drawObj = require('./drawObj');

class Game {
    constructor() {
        this.draw = this.draw.bind(this);

        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        Matter.Engine.run(this.engine);

        this.bounds = Matter.Bodies.rectangle(0, 400, 600, 100, {isStatic: true});
        Matter.World.add(this.world, [this.bounds]);

        this.players = [new Player(100, 100, this.engine)];
    }

    setup() {
        p5.createCanvas(640, 480);
        p5.frameRate(30);
    }

    draw() {
        p5.background(50);
        this.players.forEach((p) => p.draw());

        drawObj(this.bounds);
    }
}

module.exports = Game;