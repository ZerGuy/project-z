const Matter = require('matter-js');
const Player = require('./player');
const drawObj = require('./drawObj');

class Game {
    constructor() {
        this.draw = this.draw.bind(this);

        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        Matter.Engine.run(this.engine);
        this.world.gravity.y = 0; 

        this.bounds = Matter.Bodies.rectangle(300, 400, 800, 50, {isStatic: true});
        Matter.World.add(this.world, [this.bounds]);

        this.players = [new Player(100, 100, this.engine)];
    }

    setup() {
        p5.createCanvas(p5.windowWidth - 50, p5.windowHeight - 50);
        p5.frameRate(60);
    }

    draw() {
        p5.background(10);
        this.players.forEach((p) => p.draw());

        drawObj(this.bounds);
    }
}

module.exports = Game;