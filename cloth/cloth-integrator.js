//Предсказание позиций
export function clIntegrator(positions, prev, invMass, dt, gravity) {
    const dt2 = dt * dt;

    for (let i = 0; i < invMass.length; i++) {
        if (invMass[i] === 0) continue;

        const px = positions[i*3];
        const py = positions[i*3+1];
        const pz = positions[i*3+2];

        const vx = px - prev[i*3];
        const vy = py - prev[i*3+1];
        const vz = pz - prev[i*3+2];

        prev[i*3]   = px;
        prev[i*3+1] = py;
        prev[i*3+2] = pz;

        positions[i*3]   = px + vx + gravity[0] * dt2;
        positions[i*3+1] = py + vy + gravity[1] * dt2;
        positions[i*3+2] = pz + vz + gravity[2] * dt2;
    }
}
