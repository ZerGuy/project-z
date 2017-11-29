"use strict";
function drawObj(body) {
    body.shapes.forEach(shape => {
        if (shape.sensor)
            return;

        if (shape instanceof p2.Box)
            return drawBox(shape, body.position, body.angle);

        if (shape instanceof p2.Circle)
            return drawCircle(shape, body.position);

        const vertices = shape.vertices;

        if (!vertices)
            return;

        p5.beginShape();
        vertices.forEach(v => p5.vertex(v[0], v[1]));
        p5.endShape(p5.CLOSE);
    });
}

function drawBox(shape, position, angle) {
    p5.push();
    p5.translate(position[0], position[1]);
    p5.rotate(angle);
    p5.translate(shape.position[0], shape.position[1]);
    p5.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
    p5.pop();
}

function drawCircle(shape, position) {
    p5.push();
    p5.translate(position[0], position[1]);
    p5.ellipse(0, 0, 2*shape.radius, 2*shape.radius);
    p5.pop();
}

module.exports = drawObj;