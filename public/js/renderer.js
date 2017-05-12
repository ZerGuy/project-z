const _ = require('lodash');
const drawObj = require('./drawObj');
const sal = require('./sight-and-light');

const BACKGROUND_COLOR = 0;
const NOT_SEEN_COLOR = 30;
const FLOOR_COLOR = 120;

const CAMERA_STIFFNESS = 4;
const CAMERA_LERP = 0.5;

const walls = [];
const screenSize = {
    x: 0,
    y: 0,
};

const worldSize = {
    x: 0,
    y: 0,
};

let translateVector = {
    x: 0,
    y: 0,
};

class Renderer {
    constructor() {
        screenSize.x = p5.windowWidth;
        screenSize.y = p5.windowHeight;

        p5.mouseX = screenSize.x / 2;
        p5.mouseY = screenSize.y / 2;

        p5.noCursor();
    }

    draw(params) {
        this.drawBackground();
        this.translate(params.player);

        this.drawFloor();
        this.drawEnemies(params.enemies);
        this.fillInvisibleArea(params.player);
        this.drawObstacles(params.obstacles);
        this.drawBoundaries(params.boundaries);
        this.drawPlayer(params.player);
        this.drawAim();
    }

    translate(player) {
        if (!player)
            return;

        const cameraOffset = {
            x: (screenSize.x / 2 - p5.mouseX) / CAMERA_STIFFNESS,
            y: (screenSize.y / 2 - p5.mouseY) / CAMERA_STIFFNESS
        };

        const newTranslateVector = {
            x: p5.lerp(translateVector.x, screenSize.x / 2 - player.person.position.x + cameraOffset.x, CAMERA_LERP),
            y: p5.lerp(translateVector.y, screenSize.y / 2 - player.person.position.y + cameraOffset.y, CAMERA_LERP)
        };

        translateVector = {
            x: newTranslateVector.x,
            y: newTranslateVector.y
        };

        p5.translate(translateVector.x, translateVector.y);
    }

    drawBackground() {
        p5.background(BACKGROUND_COLOR);
    }

    drawFloor() {
        p5.fill(FLOOR_COLOR);
        p5.rect(0, 0, worldSize.x, worldSize.y);
    }

    drawEnemies(enemies) {
        enemies.forEach(p => p.draw());
    }

    drawPlayer(player) {
        if (player)
            player.draw();
    }

    drawObstacles(obstacles) {
        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        obstacles.forEach(ob => drawObj(ob));
    }

    drawBoundaries(boundaries) {
        p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        boundaries.forEach(b => drawObj(b));
    }

    drawAim() {
        const x = p5.mouseX - translateVector.x;
        const y = p5.mouseY - translateVector.y;

        p5.fill(250);
        p5.stroke(0);
        p5.strokeWeight(1);

        p5.beginShape();
        p5.vertex(x - 1, y - 5); // top left
        p5.vertex(x + 1, y - 5);
        p5.vertex(x + 1, y - 1);
        p5.vertex(x + 5, y - 1); // right top
        p5.vertex(x + 5, y + 1);
        p5.vertex(x + 1, y + 1);
        p5.vertex(x + 1, y + 5); // bottom right
        p5.vertex(x - 1, y + 5);
        p5.vertex(x - 1, y + 1);
        p5.vertex(x - 5, y + 1); // left bottom
        p5.vertex(x - 5, y - 1);
        p5.vertex(x - 1, y - 1);
        p5.endShape(p5.CLOSE);
    }

    initWalls(obstacles) {
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
    }

    fillInvisibleArea(player) {
        if (!player)
            return;

        const playerPosition = player.person.position;
        const res = sal.compute(playerPosition, walls);

        p5.stroke(NOT_SEEN_COLOR + 50);
        p5.strokeWeight(1);
        p5.fill(NOT_SEEN_COLOR);

        p5.beginShape();
        p5.vertex(0, 0);
        p5.vertex(0, worldSize.y);
        p5.vertex(worldSize.x, worldSize.y);
        p5.vertex(worldSize.x, 0);

        p5.beginContour();
        res.forEach(a => p5.vertex(a.x, a.y));
        p5.endContour();
        p5.endShape(p5.CLOSE);
    }

    resize(width, height) {
        screenSize.x = width;
        screenSize.y = height;
    }

    setWorldSize(size) {
        worldSize.x = size.x;
        worldSize.y = size.y;
        addMapBoundsToWalls();
    }
}


function addMapBoundsToWalls() {
    walls.push(createWall(0, 0, worldSize.x, 0));
    walls.push(createWall(worldSize.x, 0, worldSize.x, worldSize.y));
    walls.push(createWall(0, worldSize.y, worldSize.x, worldSize.y));
    walls.push(createWall(0, 0, 0, worldSize.y));
}

function createWall(ax, ay, bx, by) {
    return {ax, ay, bx, by};
}

module.exports = Renderer;