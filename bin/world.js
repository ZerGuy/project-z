const _ = require('lodash');
const Matter = require("matter-js");
const Player = require("./player");

const SIZE = {
    x: 2000,
    y: 1500
};

let matterWorld;
let matterEngine;
const obstacles = [];
const boundaries = [];
const players = [];


class World {
    constructor() {
        this.size = SIZE;
        this.obstacles = obstacles;
        this.boundaries = boundaries;
        this.players = players;

        this.createMatterWorld();
        this.createBoundaries();
        this.generateObstacles();
    }

    createMatterWorld() {
        matterEngine = Matter.Engine.create();
        Matter.Engine.run(matterEngine);

        matterWorld = matterEngine.world;
        matterWorld.gravity.y = 0;
        matterWorld.bounds.min.x = 0;
        matterWorld.bounds.min.y = 0;
    }

    createBoundaries() {
        const ax = 0;
        const ay = 0;
        const bx = SIZE.x;
        const by = SIZE.y;

        boundaries.push(this.createObstacle(ax, by / 2, 10, by + 5));
        boundaries.push(this.createObstacle(bx, by / 2, 10, by + 5));
        boundaries.push(this.createObstacle(bx / 2, ay, bx + 5, 10));
        boundaries.push(this.createObstacle(bx / 2, by, bx + 5, 10));
        Matter.World.add(matterWorld, boundaries);
    }

    generateObstacles() {
        obstacles.push(this.createObstacle(500, 100, 50, 100));
        obstacles.push(this.createObstacle(100, 100, 50, 100));
        obstacles.push(this.createObstacle(450, 400, 700, 50));
        Matter.World.add(matterWorld, obstacles);
    }

    createObstacle(x, y, width, height) {
        const body = Matter.Bodies.rectangle(x, y, width, height, {isStatic: true});
        body.width = width;
        body.height = height;
        return body;
    }

    addPlayer(socket) {
        const pos = generateSpawnPosition();
        players.push(new Player(socket, pos, matterEngine));
        return pos;
    }

    updatePlayer(data, id) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id !== id)
                continue;

            Matter.Body.setPosition(players[i].person, {x: data.x, y: data.y});
            Matter.Body.setAngle(players[i].person, data.angle);
            return;
        }
    }

    removePlayer(id) {
        for (let i = 0; i < players.length; i++){
            if (players[i].id === id) {
                players.splice(i, 1);
                break;
            }
        }
    }

    // Getters
    getObstacles() {
        return _.map(obstacles, ob => {
            return {
                x: ob.position.x,
                y: ob.position.y,
                width: ob.width,
                height: ob.height,
            }
        });
    }

    getBoundaries() {
        return _.map(boundaries, ob => {
            return {
                x: ob.position.x,
                y: ob.position.y,
                width: ob.width,
                height: ob.height,
            }
        });
    }
}


function generateSpawnPosition() {
    return {
        x: 200 + players.length * 100,
        y: 250,
    };
}

module.exports = World;