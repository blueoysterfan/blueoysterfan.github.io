//проекция ограничений позиций PBD
const iters = 5;
export function clSolve(edges, positions, invMass, pinned, N, spacing, half) {
    for (let iter = 0; iter < iters; iter++) {
        for (const e of edges) {
            const { a, b, rest } = e;

            const ax = positions[a*3], ay = positions[a*3+1], az = positions[a*3+2];
            const bx = positions[b*3], by = positions[b*3+1], bz = positions[b*3+2];

            const dx = ax - bx, dy = ay - by, dz = az - bz;
            const len = Math.hypot(dx, dy, dz);
            if (len === 0) continue;

            const diff = (len - rest) / len;

            const w1 = invMass[a], w2 = invMass[b];
            const wsum = w1 + w2;
            if (wsum === 0) continue;

            const cx = dx * diff * 0.5;
            const cy = dy * diff * 0.5;
            const cz = dz * diff * 0.5;

            if (w1 > 0) {
                const s = w1 / wsum;
                positions[a*3]   -= cx * s;
                positions[a*3+1] -= cy * s;
                positions[a*3+2] -= cz * s;
            }
            if (w2 > 0) {
                const s = w2 / wsum;
                positions[b*3]   += cx * s;
                positions[b*3+1] += cy * s;
                positions[b*3+2] += cz * s;
            }
        }

        // закреплённые вершины
        for (const p of pinned) {
            const i = p % N;
            const j = Math.floor(p / N);
            positions[p*3]   = i * spacing - half;
            positions[p*3+1] = j * spacing - half;
            positions[p*3+2] = 0;
        }
    }
}
