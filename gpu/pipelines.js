import { perspective, rotateX, rotateY, multiply, tr } from "./matricesOp.js";

export async function createPipeline(device, context, indicesLines) {
    const wgslVertex = await fetch("./shaders/vertex.wgsl").then(r => r.text());
    const wgslFragment = await fetch("./shaders/fragment.wgsl").then(r => r.text());

    const _wgslVertex = device.createShaderModule({ code: wgslVertex });
    const _wgslFragment = device.createShaderModule({ code: wgslFragment });

    const vertexBuffer = device.createBuffer({
        size: 4 * 3 * 24 * 24,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    const indexBuffer = device.createBuffer({
        size: indicesLines.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    });

    new Uint32Array(indexBuffer.getMappedRange()).set(indicesLines);
    indexBuffer.unmap();

    const uniformBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
            module: _wgslVertex,
            buffers: [{
                arrayStride: 12,
                attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }]
            }]
        },
        fragment: {
            module: _wgslFragment,
            targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
        },
        primitive: { topology: "line-list" }
    });

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }]
    });

    return {
        pipeline,
        vertexBuffer,
        indexBuffer,
        uniformBuffer,
        bindGroup
    };
}
