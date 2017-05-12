const drawObj = require('./drawObj');
const sal = require('./sight-and-light');

const walls = [];
const screenSize = {
    ax: 0,
    ay: 0,
};

const worldSize = {
    ax: 0,
    ay: 0,
};

let translateVector = {
    x: 0,
    y: 0,
};

class Renderer {
    constructor() {
        screenSize.bx = p5.windowWidth;
        screenSize.by = p5.windowHeight;

        addWindowBordersToWalls();
    }

    draw(params) {
        this.drawBackground();
        this.translate(params.player);

        this.drawFloor(params.worldSize);
        this.drawEnemies(params.enemies);
        this.fillInvisibleArea(params.player);
        this.drawObstacles(params.obstacles);
        this.drawBoundaries(params.boundaries);
        this.drawPlayer(params.player);
        //this.drawAim(params.player);
    }

    translate(player) {
        if (!player)
            return;

        const offset = {
            x: (screenSize.bx / 2 - p5.mouseX) / 3,
            y: (screenSize.by / 2 - p5.mouseY) / 3
        };

        const t = {
            x: p5.lerp(translateVector.x, screenSize.bx / 2 - player.person.position.x + offset.x, 0.2),
            y: p5.lerp(translateVector.y, screenSize.by / 2 - player.person.position.y + offset.y, 0.2)
        };

        translateVector = {
            x: t.x,
            y: t.y
        };

        p5.translate(t.x, t.y);
    }

    drawBackground() {
        p5.background(0);
    }

    drawFloor(size) {
        p5.fill(100);
        p5.rect(0, 0, size.x, size.y);
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

    drawAim(player) {
        if (!player)
            return;

        const from = player.person.position;
        const to = {x: p5.mouseX, y: p5.mouseY};
        p5.line(from.x, from.y, to.x, to.y);
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

        p5.stroke(0, 150, 20);
        p5.strokeWeight(1);
        p5.fill(10);

        p5.beginShape();
        p5.vertex(screenSize.ax, screenSize.ay);
        p5.vertex(screenSize.ax, screenSize.by);
        p5.vertex(screenSize.bx, screenSize.by);
        p5.vertex(screenSize.bx, screenSize.ay);

        p5.beginContour();
        res.forEach(a => p5.vertex(a.x, a.y));
        p5.endContour();
        p5.endShape(p5.CLOSE);
    }

    resize(width, height) {
        screenSize.bx = width;
        screenSize.by = height;

        walls[0].bx = screenSize.bx;
        walls[1].ax = screenSize.bx + translateVector.x;
        walls[1].bx = screenSize.bx;
        walls[1].by = screenSize.by;
        walls[2].ay = screenSize.by;
        walls[2].bx = screenSize.bx;
        walls[2].by = screenSize.by;
        walls[3].by = screenSize.by;
    }
}

function addWindowBordersToWalls() {
    walls.push(createWall(screenSize.ax, screenSize.ay, screenSize.bx, screenSize.ay));
    walls.push(createWall(screenSize.bx + translateVector.x, screenSize.ay, screenSize.bx, screenSize.by));
    walls.push(createWall(screenSize.ax, screenSize.by, screenSize.bx, screenSize.by));
    walls.push(createWall(screenSize.ax, screenSize.ay, screenSize.ax, screenSize.by));
}

function createWall(ax, ay, bx, by) {
    return {ax, ay, bx, by};
}

module.exports = Renderer;