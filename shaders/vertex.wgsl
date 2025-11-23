struct Uniforms {
    mvp : mat4x4<f32>,
};

@group(0) @binding(0)
var<uniform> uniforms : Uniforms;

struct VSOut {
    @builtin(position) Position : vec4<f32>,
    @location(0) color : vec3<f32>,
};

@vertex  // опционально - окраска по высоте
fn main(@location(0) pos : vec3<f32>) -> VSOut {
    var out : VSOut;

    out.Position = uniforms.mvp * vec4<f32>(pos, 1.0);

   
    let h = clamp((pos.z + 0.5) * 2.0, 0.0, 1.0);
    out.color = vec3<f32>(
        0.2 + h * 0.1,
        0.2 + h * 0.6,
        0.8
    );

    return out;
}
