//инициализация поверхности
export function clInit(N, size) {
    const half = size / 2;
    const spacing = size / (N - 1);

    const positions = new Float32Array(N*N*3);
    const prev      = new Float32Array(N*N*3);
    const invMass   = new Float32Array(N*N);

    for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
            const id = i + j*N;
            const x = i * spacing - half;
            const y = j * spacing - half;

            positions[id*3]   = x;
            positions[id*3+1] = y;
            positions[id*3+2] = 0;

            prev.set(positions.slice(id*3, id*3+3), id*3);
            invMass[id] = 1;
        }

    return { positions, prev, invMass, spacing, half };
}
