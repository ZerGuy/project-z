"use strict";
function drawObj(body) {
    body.shapes.forEach(shape => {
        const vertices = shape.vertices;

        if (!vertices)
            return;

        p5.beginShape();
        vertices.forEach(v => p5.vertex(v[0], v[1]));
        p5.endShape(p5.CLOSE);
    });
}

module.exports = drawObj;