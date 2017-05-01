const Matter = require('matter-js');
const Player = require('./player');
const drawObj = require('./drawObj');
const sal = require('./sight-and-light');
const io = require('socket.io-client');
const ioMsg = require('./io-messages');

const socket = io();

const Engine = Matter.Engine;
const Vector = Matter.Vector;
const VISIBILITY_DISTANCE = 300;

let player;
let enemies = [];
let obstacles = [];
let world;
let engine;

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
        engine = Engine.create();
        Engine.run(engine);

        world = engine.world;
        world.gravity.y = 0;
    }

    loadObstacles() {
        socket.on(ioMsg.obstacles, function(data) {
            data.forEach((ob) => {
                obstacles.push(Matter.Bodies.rectangle(ob.x, ob.y, ob.width, ob.height, {isStatic: true}));
            });
            Matter.World.add(world, obstacles);

        });
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
        
        Matter.World.add(world, this.boundaries);
    }

    loadPlayers() {
        socket.on(ioMsg.spawn, function(data) {
            console.log('spawn', data);
            player = new Player(data.x, data.y, engine, socket.io.engine.id);
            player.socket = socket;
            console.log(player);
        });

        socket.on(ioMsg.players, function(data) {
            data.forEach((p) => {
                if (p.id === player.id) {
                    player.x = p.x;
                    player.y = p.y;
                    return;
                }

                for (var i = 0; i < enemies.length; i++) {
                    if (enemies[i].id !== p.id)
                        continue;

                    enemies[i].setPosition(p.x, p.y);
                    return;
                }

                enemies.push(new Player(p.x, p.y, engine, p.id));

            });
            console.log(enemies[0]);
            console.log(data);
        });
    }

    draw() {
        p5.background(100);

        p5.stroke(0);
        p5.ellipse(400, 600, 100, 100);
        this.fillInvisibleArea();

        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        this.boundaries.forEach((b) => drawObj(b));
        obstacles.forEach((ob) => drawObj(ob));
        
        if (player) 
            player.updateAndDraw();
        
        enemies.forEach((p) => p.draw());
    }

    fillInvisibleArea() {
        if (!player)
            return;

        const playerPosition = player.person.position;
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