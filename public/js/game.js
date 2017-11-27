const Matter = require('matter-js');
const Player = require('./player');
const Renderer = require('./renderer');
const Bullet = require('./bullet');

const io = require('socket.io-client');
const ioMsg = require('./constants/io-messages');

const socket = io();

let player;
let enemies = [];
let obstacles = [];
let boundaries = [];
let bullets = [];

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

        Player.addBullet = this.addBullet;
        Bullet.mWorld = world;
        Bullet.bullets = bullets;
    }

    createWorld() {
        world = new p2.World({
            gravity: [0, 0]
        });
    }

    initSocketListeners() {
        socket.on(ioMsg.worldSize, this.setWorldSize);
        // socket.on(ioMsg.obstacles, this.loadObstacles);
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
        console.log('loadObstacles', data);
        data.forEach(ob => {
            const shape = new p2.Box({width: ob.width, height: ob.height});
            const body = new p2.Body({
                mass: 0,
                position: [ob.x, ob.y]
            });
            body.addShape(shape);
            world.addBody(body);
            obstacles.push(body);
        });
        renderer.initWalls(obstacles);
    }

    loadBoundaries(data) {
        console.log('loadBoundaries', data);
        data.forEach(ob => {
            const shape = new p2.Box({width: ob.width, height: ob.height});
            const body = new p2.Body({
                mass: 0,
                position: [ob.x, ob.y]
            });
            body.addShape(shape);
            world.addBody(body);
            boundaries.push(body);
            console.log(shape);
        });
    }

    spawnPlayer(data) {
        player = new Player(data.x, data.y, socket.io.engine.id, world);
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

    addBullet(bullet) {
        bullets.push(bullet);
        world.addBody(bullet.body);
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
            bullets,
        });
    }
}

function resizeCanvas() {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    renderer.resize(p5.windowWidth, p5.windowHeight);
}

module.exports = Game;