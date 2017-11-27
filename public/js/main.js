const p5 = require('p5');
const p2 = require('p2');
const Game = require("./game");

const game = new Game();

const sketch = function (p5) {
    p5.setup = game.setup;
    p5.draw = game.draw;
    window.p5 = p5;
    window.p2 = p2;
};

new p5(sketch);
