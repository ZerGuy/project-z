const _ = require('lodash');
const p2 = require("p2");
const Player = require("./player");
const Bullet = require("./bullet");

const SIZE = {
    x: 2000,
    y: 1500
};

let p2World;
const obstacles = [];
const boundaries = [];
const players = [];
const bullets = [];


class World {
    constructor(options) {
        this.size = SIZE;
        this.obstacles = obstacles;
        this.boundaries = boundaries;
        this.players = players;

        this.notifyPlayerWasHit = options.notifyPlayerWasHit;

        this.createP2World();
        this.createBoundaries();
        this.generateObstacles();
    }

    createP2World() {
        p2World = new p2.World({
            gravity: [0, 0]
        });
        p2World.on('beginContact', this.handleContact.bind(this));
    }

    createBoundaries() {
        const ax = 0;
        const ay = 0;
        const bx = SIZE.x;
        const by = SIZE.y;

        boundaries.push(World.createObstacleOptions(ax, by / 2, 10, by + 5));
        boundaries.push(World.createObstacleOptions(bx, by / 2, 10, by + 5));
        boundaries.push(World.createObstacleOptions(bx / 2, ay, bx + 5, 10));
        boundaries.push(World.createObstacleOptions(bx / 2, by, bx + 5, 10));

        obstacles.forEach(obstacle => {
            p2World.addBody(World.createObstacleBody(obstacle));
        });
    }

    generateObstacles() {
        obstacles.push(World.createObstacleOptions(500, 100, 50, 100));
        obstacles.push(World.createObstacleOptions(100, 100, 50, 100));
        obstacles.push(World.createObstacleOptions(350, 400, 500, 50));
        obstacles.push(World.createObstacleOptions(800, 200, 70, 300));
        obstacles.push(World.createObstacleOptions(300, 600, 100, 200));
        obstacles.push(World.createObstacleOptions(700, 670, 300, 20));
        obstacles.push(World.createObstacleOptions(1000, 1070, 100, 220));
        obstacles.push(World.createObstacleOptions(1100, 500, 200, 120));
        obstacles.push(World.createObstacleOptions(1300, 200, 50, 50));
        obstacles.push(World.createObstacleOptions(500, 1000, 70, 150));
        obstacles.push(World.createObstacleOptions(100, 700, 70, 150));
        obstacles.push(World.createObstacleOptions(1100, 200, 100, 200));

        obstacles.forEach(obstacle => {
            p2World.addBody(World.createObstacleBody(obstacle));
        });
    }


    addPlayer(socket) {
        const pos = World.generateSpawnPosition();
        players.push(new Player(socket, pos, p2World));
        return pos;
    }

    updatePlayer(data, id) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id !== id)
                continue;

            players[i].p2Body.position = data.position;
            players[i].p2Body.angle = data.angle;
            return;
        }
    }

    removePlayer(id) {
        for (let i = 0; i < players.length; i++) {
            if (players[i].id !== id) {
                continue;
            }

            const removedPlayer = players.splice(i, 1);
            if (removedPlayer.length > 0)
                p2World.removeBody(removedPlayer[0].p2Body);

            break;
        }
    }

    addBullet(data) {
        const bullet = new Bullet(data);
        bullets.push(bullet);
        p2World.addBody(bullet.body);
    }

    removeBullet(data) {
        console.log(data);
    }

    update(delta) {
        p2World.step(delta);
    }

    handleContact(event) {
        const bulletToRemove = getBulletParticipatedInEvent(event);
        if (!bulletToRemove)
            return;

        const i = bullets.findIndex(b => b.body === bulletToRemove);
        bullets.splice(i, 1);
        p2World.removeBody(bulletToRemove);

        const playerWhoWasHit = getPlayerParticipatedInEvent(event);
        if (playerWhoWasHit) {
            playerWhoWasHit.p2Body.position = World.generateSpawnPosition();
            this.notifyPlayerWasHit(playerWhoWasHit);
        }

        function getBulletParticipatedInEvent(event) {
            return bullets.find(bullet => event.bodyA === bullet.body) || bullets.find(bullet => event.bodyB === bullet.body);
        }

        function getPlayerParticipatedInEvent(event) {
            return players.find(player => event.bodyA === player.p2Body) || players.find(player => event.bodyB === player.p2Body);
        }
    }

    static createObstacleBody({x, y, width, height}) {
        const shape = new p2.Box({
            width: width,
            height: height
        });
        const body = new p2.Body({position: [x, y]});
        body.addShape(shape);

        return body;
    }

    static createObstacleOptions(x, y, width, height) {
        return {
            x, y, width, height
        }
    }

    // Getters
    getObstacles() {
        return obstacles;

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
        return boundaries;

        return _.map(boundaries, ob => {
            return {
                x: ob.position.x,
                y: ob.position.y,
                width: ob.width,
                height: ob.height,
            }
        });
    }

    static generateSpawnPosition() {
        return [200 + players.length * 100, 250];
    }
}


module.exports = World;