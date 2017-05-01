const Matter = require('matter-js');
const Player = require('./player');
const drawObj = require('./drawObj');
const sal = require('./sight-and-light');
const io = require('socket.io-client');

const socket = io();

const Engine = Matter.Engine;
const Vector = Matter.Vector;
const VISIBILITY_DISTANCE = 300;

class Game {
    constructor() {
        this.draw = this.draw.bind(this);
        this.setup = this.setup.bind(this);
    }

    setup() {
        p5.createCanvas(p5.windowWidth - 50, p5.windowHeight - 50);
        p5.frameRate(60);
        this.bounds = {
            minX: 0,
            minY: 0,
            maxX: p5.windowWidth - 50,
            maxY: p5.windowHeight - 50
        }

        this.createWorld();
        this.loadObstacles();
        this.createBoundaries();
        this.loadPlayers();
    }

    createWorld() {
        this.engine = Engine.create();
        Engine.run(this.engine);

        this.world = this.engine.world;
        this.world.gravity.y = 0;
    }

    loadObstacles() {
        this.obstacles = [];

        socket.on('obstacles', function(data) {
            data.forEach((ob) => {
                this.obstacles.push(Matter.Bodies.rectangle(ob.x, ob.y, ob.width, ob.height, {isStatic: true}));
            });
            Matter.World.add(this.world, this.obstacles);
        }.bind(this));
    }

    createBoundaries() {
        this.boundaries = [];
        const ax = this.bounds.minX;
        const ay = this.bounds.minY;
        const bx = this.bounds.maxX;
        const by = this.bounds.maxY;
        
        this.boundaries.push(Matter.Bodies.rectangle(ax, by / 2, 10, by + 5, {isStatic: true}));      
        this.boundaries.push(Matter.Bodies.rectangle(bx, by / 2, 10, by + 5, {isStatic: true}));      
        this.boundaries.push(Matter.Bodies.rectangle(bx / 2, ay, bx + 5, 10, {isStatic: true}));      
        this.boundaries.push(Matter.Bodies.rectangle(bx / 2, by, bx + 5, 10, {isStatic: true}));      
        
        Matter.World.add(this.world, this.boundaries);
    }

    loadPlayers() {
        this.players = [new Player(250, 200, this.engine)];
    }

    draw() {
        p5.background(100);

        p5.stroke(0);
        p5.ellipse(400, 600, 100, 100);
        this.drawVisibilityArea();

        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        this.boundaries.forEach((b) => drawObj(b));
        this.obstacles.forEach((ob) => drawObj(ob));
        this.players.forEach((p) => p.draw());
    }

    drawVisibilityArea() {
        const playerPosition = this.players[0].person.position;
        const obstacles = this.obstacles;

        const walls = [];

        walls.push({
            ax: this.bounds.minX,
            ay: this.bounds.minY,
            bx: this.bounds.maxX,
            by: this.bounds.minY,
        });

        walls.push({
            ax: this.bounds.maxX,
            ay: this.bounds.minY,
            bx: this.bounds.maxX,
            by: this.bounds.maxY,
        });

        walls.push({
            ax: this.bounds.minX,
            ay: this.bounds.maxY,
            bx: this.bounds.maxX,
            by: this.bounds.maxY,
        });

        walls.push({
            ax: this.bounds.minX,
            ay: this.bounds.minY,
            bx: this.bounds.minX,
            by: this.bounds.maxY,
        });

        obstacles.forEach((a) => {
            for (let i = 0; i < a.vertices.length - 1; i++) {
                walls.push({
                    ax: a.vertices[i].x,
                    ay: a.vertices[i].y,
                    bx: a.vertices[i + 1].x,
                    by: a.vertices[i + 1].y,
                });
            }

            walls.push({
                ax: a.vertices[0].x,
                ay: a.vertices[0].y,
                bx: a.vertices[a.vertices.length - 1].x,
                by: a.vertices[a.vertices.length - 1].y,
            });
        });

        let res = sal.compute(playerPosition, walls);

        p5.stroke(0, 150, 20);
        p5.strokeWeight(1);
        p5.fill(10);
        p5.beginShape();
        p5.vertex(0, 0);
        p5.vertex(0, this.bounds.maxY);
        p5.vertex(this.bounds.maxX, this.bounds.maxY);
        p5.vertex(this.bounds.maxX, 0);
        p5.beginContour();
        res.forEach((a) => {
            p5.vertex(a.x, a.y);
        });
        p5.endContour();
        p5.endShape(p5.CLOSE);
    }
}

module.exports = Game;