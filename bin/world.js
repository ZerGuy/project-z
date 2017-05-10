const obstacles  = [];
const boundaries = [];

const SIZE = {
	x: 1500,
	y: 1000
}

class World {
	constructor() {
		this.obstacles  = obstacles;
		this.boundaries = boundaries;

		this.createBoundaries();
		this.generateObstacles();
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
    }

	generateObstacles() {
        obstacles.push(this.createObstacle(500, 100, 50, 100));
        obstacles.push(this.createObstacle(100, 100, 50, 100));
        obstacles.push(this.createObstacle(450, 400, 800, 50));
	}

	createObstacle(x, y, width, height) {
		return {
			x: x,
			y: y,
			width: width,
			height: height
		}
	}
}

module.exports = World;