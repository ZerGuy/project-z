const Matter = require('matter-js');
const Player = require('./player');
const Renderer = require('./renderer');

const io = require('socket.io-client');
const ioMsg = require('./io-messages');

const socket = io();

const Engine = Matter.Engine;
const Vector = Matter.Vector;
const VISIBILITY_DISTANCE = 300;

let player;
let enemies = [];
let obstacles = [];
let boundaries = [];
let world;
let engine;
let renderer;

class Game {
    constructor() {
        this.draw  = this.draw.bind(this);
        this.setup = this.setup.bind(this);
    }

    setup() {
        p5.createCanvas(p5.windowWidth - 50, p5.windowHeight - 50);
        p5.frameRate(60);

        renderer = new Renderer();

        this.createWorld();
        this.loadObstacles();
        this.loadBoundaries();
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
            renderer.initWalls(obstacles);
        });
    }

    loadBoundaries() {
        socket.on(ioMsg.boundaries, function(data) {
            data.forEach((ob) => {
                boundaries.push(Matter.Bodies.rectangle(ob.x, ob.y, ob.width, ob.height, {isStatic: true}));
            });
            Matter.World.add(world, boundaries);
        });
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

                    Matter.Body.setPosition(enemies[i].person, {x:p.x, y:p.y});
                    return;
                }

                enemies.push(new Player(p.x, p.y, engine, p.id));
            });
        });
    }

    draw() {
        if (player) 
            player.update();

        renderer.draw({
            player,
            enemies,
            obstacles,
            boundaries,
        });
    }
}

module.exports = Game;