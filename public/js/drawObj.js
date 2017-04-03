function drawObj(obj) {
    const vertices = obj.vertices;

    p5.beginShape();
        vertices.forEach((v) => p5.vertex(v.x, v.y));
    p5.endShape();
}

module.exports = drawObj;