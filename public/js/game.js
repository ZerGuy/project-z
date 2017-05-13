const Matter = require('matter-js');
const Player = require('./player');
const Renderer = require('./renderer');

const io = require('socket.io-client');
const ioMsg = require('./constants/io-messages');

const socket = io();

const Engine = Matter.Engine;

let player;
let enemies = [];
let obstacles = [];
let boundaries = [];
let world;
let engine;
let renderer;

class Game {
    constructor() {
        this.draw = this.draw.bind(this);
        this.setup = this.setup.bind(this);
    }

    setup() {
        p5.createCanvas(p5.windowWidth, p5.windowHeight);
        p5.frameRate(60);

        window.addEventListener('resize', resizeCanvas);

        renderer = new Renderer();

        this.createWorld();
        this.initSocketListeners();
    }

    createWorld() {
        engine = Engine.create();
        Engine.run(engine);

        world = engine.world;
        world.gravity.y = 0;
        world.bounds.min.x = 0;
        world.bounds.min.y = 0;
    }

    initSocketListeners() {
        socket.on(ioMsg.worldSize, this.setWorldSize);
        socket.on(ioMsg.obstacles, this.loadObstacles);
        socket.on(ioMsg.boundaries, this.loadBoundaries);

        socket.on(ioMsg.spawn, this.spawnPlayer);
        socket.on(ioMsg.players, this.updatePlayersPositions);

        socket.on(ioMsg.playerConnected, this.addEnemy);
        socket.on(ioMsg.playerDisconnected, this.removeEnemy);
    }

    setWorldSize(data) {
        renderer.setWorldSize(data);
    }

    loadObstacles(data) {
        data.forEach(ob => obstacles.push(Matter.Bodies.rectangle(ob.x, ob.y, ob.width, ob.height, {isStatic: true})));
        Matter.World.add(world, obstacles);
        renderer.initWalls(obstacles);
    }

    loadBoundaries(data) {
        data.forEach(ob => boundaries.push(Matter.Bodies.rectangle(ob.x, ob.y, ob.width, ob.height, {isStatic: true})));
        Matter.World.add(world, boundaries);
    }

    spawnPlayer(data) {
        player = new Player(data.x, data.y, engine, socket.io.engine.id);
        player.socket = socket;
    }

    updatePlayersPositions(data) {
        data.forEach((p) => {
            if (p.id === player.id) {
                //todo hz chto
                //poka ne vazhno - norm
                return;
            }

            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i].id !== p.id)
                    continue;

                if (p.angle === undefined)
                    return;

                Matter.Body.setPosition(enemies[i].person, {x: p.x, y: p.y});
                Matter.Body.setAngle(enemies[i].person, p.angle);
                return;
            }

            enemies.push(new Player(p.x, p.y, engine, p.id));
        });
    }

    addEnemy(id) {
        console.log('player connected:', id);
        enemies.push(new Player(-100, -100, engine, id));
    }

    removeEnemy(id) {
        console.log('player disconnected:', id);
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].id === id)
                return enemies.splice(i, 1);
        }
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

function resizeCanvas() {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    renderer.resize(p5.windowWidth, p5.windowHeight);
}

module.exports = Game;