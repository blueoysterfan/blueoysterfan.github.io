import { initWebGPU } from "./gpu/webgpu-init.js";
import { createPipeline } from "./gpu/pipelines.js";
import { simulateCloth, clInitG } from "./cloth/cloth-simulation.js";

const canvas = document.getElementById("gpuCanvas");
const gravityCheckbox  = document.getElementById("gravityCheckbox");



//Ресайзим канву
canvas.width  = Math.max(800, window.innerWidth);
canvas.height = Math.max(600, window.innerHeight);

let device, context, pipelineInfo, clothState;

async function start() {
    ({ device, context } = await initWebGPU(canvas));
    clothState = clInitG();
    pipelineInfo = await createPipeline(device, context, clothState.indicesLines);
    requestAnimationFrame(update);
}

function update() {
    simulateCloth(device, context, pipelineInfo, clothState, {
        gravity: gravityCheckbox.checked,
        iterations: 5,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height
    });


    requestAnimationFrame(update);
}

start();
