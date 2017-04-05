const Matter = require('matter-js');
const Player = require('./player');
const drawObj = require('./drawObj');
const raycast = require('./raycast');

const Engine = Matter.Engine;
const Vector = Matter.Vector;
const VISIBILITY_DISTANCE = 300;

class Game {
    constructor() {
        this.draw = this.draw.bind(this);

        this.createWorld();
        this.createObstacles();

        this.players = [new Player(250, 200, this.engine)];
    }

    createWorld() {
        this.engine = Engine.create();
        Engine.run(this.engine);

        this.world = this.engine.world;
        this.world.gravity.y = 0;
    }

    createObstacles() {
        this.obstacles = [];

        this.obstacles.push(Matter.Bodies.rectangle(500, 100, 50, 100, {isStatic: true}));
        this.obstacles.push(Matter.Bodies.rectangle(100, 100, 50, 100, {isStatic: true}));
        this.obstacles.push(Matter.Bodies.rectangle(450, 400, 800, 50, {isStatic: true}));

        Matter.World.add(this.world, this.obstacles);
    }

    setup() {
        p5.createCanvas(p5.windowWidth - 50, p5.windowHeight - 50);
        p5.frameRate(60);
    }

    draw() {
        p5.background(10);

        p5.stroke(0);
        this.players.forEach((p) => p.draw());
        this.obstacles.forEach((ob) => drawObj(ob));
        this.drawVisibilityArea();
    }

    drawVisibilityArea() {
        const playerPosition = this.players[0].person.position;
        const obstacles = this.obstacles;

        p5.stroke(100);

        for (const ob of this.obstacles) {
            let vert = ob.vertices;

            for (let i = 0; i < vert.length; i++) {
                p5.beginShape(p5.LINES);
                p5.vertex(playerPosition.x, playerPosition.y);
                p5.vertex(vert[i].x, vert[i].y);
                p5.endShape();

                let ray = {
                    x: vert[i].x - playerPosition.x,
                    y: vert[i].y - playerPosition.y
                };

                let endPoint;
                let raycasted = raycast(obstacles, playerPosition, ray, VISIBILITY_DISTANCE);
                if (raycasted.success) {
                    endPoint = raycasted.point;
                }
                else {
                    if (Vector.magnitude(ray) > VISIBILITY_DISTANCE)
                        endPoint = raycasted.point;
                    else
                        endPoint = vert[i];
                }

                p5.ellipse(endPoint.x, endPoint.y, 5, 5);

            }

        }
    }
}

module.exports = Game;