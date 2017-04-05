const Matter = require('matter-js');

function raycast(bodies, start, r, dist) {
    const normRay = Matter.Vector.normalise(r);
    let ray = normRay;
    const point = Matter.Vector.add(ray, start);

    let success = false;

    for (let i = 0; i < dist; i++) {
        ray = Matter.Vector.mult(normRay, i);
        ray = Matter.Vector.add(start, ray);
        const bod = Matter.Query.point(bodies, ray)[0];

        if (bod) {
            success = true;
            break;
        }
    }

    return {
        success : success,
        point: ray
    };
}

module.exports = raycast;