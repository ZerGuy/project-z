const Matter = require("matter-js");
const p5 = require('p5');
const Game = require("./game");

const game = new Game();

const sketch = (p5) => {
    p5.setup = game.setup;
    p5.draw  = game.draw;
    window.p5 = p5;
};

new p5(sketch);
