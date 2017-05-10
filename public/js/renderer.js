const drawObj = require('./drawObj');
const sal = require('./sight-and-light');

const walls = [];
const bounds = {
	ax: 0,
	ay: 0,
};

class Renderer {
	constructor() {
        bounds.bx = p5.windowWidth  - 50;
        bounds.by = p5.windowHeight - 50;

        addWindowBordersToWalls();
	}

	draw(params) {
		this.drawBackground();
		this.drawEnemies(params.enemies);

		this.fillInvisibleArea(params.player);

		this.drawObstacles(params.obstacles);
		this.drawBoundaries(params.boundaries);

		this.drawPlayer(params.player);
	}

	drawBackground() {
        p5.background(100);
	}

	drawEnemies(enemies) {
		enemies.forEach((p) => p.draw());
	}

	drawPlayer(player) {
		if (player)
			player.draw();
	}

	drawObstacles(obstacles) {
		p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        obstacles.forEach((ob) => drawObj(ob));
	}

	drawBoundaries(boundaries) {
		p5.stroke(0);
        p5.fill(255);
        p5.strokeWeight(1);
        boundaries.forEach((b) => drawObj(b));
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
        	p5.vertex(bounds.ax, bounds.ay);
        	p5.vertex(bounds.ax, bounds.by);
        	p5.vertex(bounds.bx, bounds.by);
        	p5.vertex(bounds.bx, bounds.ay);
        
        	p5.beginContour();
		        res.forEach((a) => {
		            p5.vertex(a.x, a.y);
		        });
	        p5.endContour();
        p5.endShape(p5.CLOSE);
    }
}

function addWindowBordersToWalls() {
	walls.push(createWall(bounds.ax, bounds.ay, bounds.bx, bounds.ay));
	walls.push(createWall(bounds.bx, bounds.ay, bounds.bx, bounds.by));
	walls.push(createWall(bounds.ax, bounds.by, bounds.bx, bounds.by));
	walls.push(createWall(bounds.ax, bounds.ay, bounds.ax, bounds.by));
}

function createWall(ax, ay, bx, by) {
	return { ax, ay, bx, by };
}

module.exports = Renderer;