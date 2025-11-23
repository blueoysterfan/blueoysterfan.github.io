// Операции над матрицами;
export function perspective(fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);

    const out = new Float32Array(16);
    out[0]  = f / aspect;
    out[5]  = f;
    out[10] = (far + near) / (near - far);
    out[11] = -1;
    out[14] = (2 * far * near) / (near - far);
    return out;
}

export function rotateX(t) {
    const c = Math.cos(t), s = Math.sin(t);
    return new Float32Array([
        1,0,0,0,
        0,c,s,0,
        0,-s,c,0,
        0,0,0,1
    ]);
}

export function rotateY(t) {
    const c = Math.cos(t), s = Math.sin(t);
    return new Float32Array([
        c,0,-s,0,
        0,1,0,0,
        s,0,c,0,
        0,0,0,1
    ]);
}

export function multiply(a, b) {
    const o = new Float32Array(16);
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++) {
            let sum = 0;
            for (let k = 0; k < 4; k++)
                sum += a[k*4+j] * b[i*4+k];
            o[i*4+j] = sum;
        }
    return o;
}

export function tr(m, v) {
    const o = m.slice();
    o[12] += v[0];
    o[13] += v[1];
    o[14] += v[2];
    return o;
}
