import { clInit } from "./cloth-init.js";
import { clIntegrator } from "./cloth-integrator.js";
import { clSolve } from "./cloth-constraints.js";
import { perspective, rotateX, rotateY, multiply, tr } from "/gpu/matricesOp.js";

const center_amplitude = 0.1;

export function clInitG() {
    const N = 24;
    const SIZE = 2.0;

    const {
        positions,
        prev,
        invMass,
        spacing,
        half
    } = clInit(N, SIZE);

    //жёстко закреплённые вершины
    const pinned = [0, N - 1, (N - 1)*N, N*N - 1];
    pinned.forEach(i => (invMass[i] = 0));

    const centerI = (N - 1) / 2 | 0;
    const centerJ = (N - 1) / 2 | 0;
    const movingIdx = centerI + centerJ*N;

    //Таблица с данными по рёбрам и точкам
    const edges = [];
    const lines = [];

    function add(a, b) {
        const ax = positions[a*3], ay = positions[a*3+1], az = positions[a*3+2];
        const bx = positions[b*3], by = positions[b*3+1], bz = positions[b*3+2];
        const d = Math.hypot(ax-bx, ay-by, az-bz);
        edges.push({ a, b, rest: d });
        lines.push(a, b);
    }

    //
    for (let j = 0; j < N; j++)
        for (let i = 0; i < N; i++) {
            const id = i + j*N;
            if (i < N - 1) add(id, id + 1);
            if (j < N - 1) add(id, id + N);
            if (i < N - 1 && j < N - 1) add(id, id + N + 1);
            if (i < N - 1 && j > 0)     add(id, id - N + 1);
        }

    return {
        N,
        positions,
        prev,
        invMass,
        edges,
        indicesLines: new Uint32Array(lines),
        spacing,
        half,
        pinned,
        movingIdx,
        size: SIZE,
        t: 0
    };
}

export function simulateCloth(device, context, gpu, state, settings) {

    const {
        N, positions, prev, invMass,
        edges, pinned, spacing, half,
        movingIdx, size
    } = state;

    // Анимированный центр
    state.t += 1/60;
    const freq = 2.5;
    const z = Math.sin(state.t * freq * Math.PI * 2) * center_amplitude;

    const ci = movingIdx % N;
    const cj = Math.floor(movingIdx / N);
    const cx = ci * spacing - half;
    const cy = cj * spacing - half;

    positions[movingIdx*3]   = cx;
    positions[movingIdx*3+1] = cy;
    positions[movingIdx*3+2] = z;

    prev[movingIdx*3]   = cx;
    prev[movingIdx*3+1] = cy;
    prev[movingIdx*3+2] = z;

    //Предсказываем
    const gravity = settings.gravity ? [0,0,-9.81] : [0,0,0]; //если чекбокс гравы активен
    clIntegrator(positions, prev, invMass, 1/60, gravity);

    positions[movingIdx*3+2] = z;

    //Решаем
    clSolve(edges, positions, invMass, pinned, N, spacing, half);

    //Вывод в рендер
    device.queue.writeBuffer(gpu.vertexBuffer, 0, positions);
    const aspect = settings.canvasWidth / settings.canvasHeight;
    const proj = perspective(Math.PI/4, aspect, 0.1, 100);
    let model = rotateX(-0.6);
    model = multiply(rotateY(0.6), model);
    model = tr(model, [0, 0, -2.3]);
    const mvp = multiply(proj, model);
    device.queue.writeBuffer(gpu.uniformBuffer, 0, mvp);
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: "clear",
            storeOp: "store",
            clearValue: { r:0.12, g:0.12, b:0.12, a:0 } //Фон
        }]
    });
    pass.setPipeline(gpu.pipeline);
    pass.setBindGroup(0, gpu.bindGroup);
    pass.setVertexBuffer(0, gpu.vertexBuffer);
    pass.setIndexBuffer(gpu.indexBuffer, "uint32");
    pass.drawIndexed(state.indicesLines.length);
    pass.end();

    //Рендер
    device.queue.submit([encoder.finish()]);
}
