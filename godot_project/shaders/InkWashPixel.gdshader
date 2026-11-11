shader_type canvas_item;

// 16-Bit 国风像素水墨粒子着色器 (Pixel Ink-Wash Particle Shader)
uniform vec4 ink_color : source_color = vec4(0.08, 0.12, 0.14, 1.0);
uniform float pixel_size : hint_range(1.0, 16.0, 1.0) = 4.0;
uniform float ink_bleed : hint_range(0.0, 1.0) = 0.35;
uniform float threshold : hint_range(0.0, 1.0) = 0.2;

// 简易偽随机哈希函数
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

void fragment() {
    // 1. 强制像素栅格化量化
    vec2 screen_grid = floor(UV / (pixel_size * TEXTURE_PIXEL_SIZE)) * (pixel_size * TEXTURE_PIXEL_SIZE);
    vec4 tex = texture(TEXTURE, screen_grid);
    
    // 2. 水墨晕染颗粒噪点计算
    float noise = hash21(screen_grid * 100.0);
    float alpha = tex.a * COLOR.a;
    
    // 边缘墨点消融
    if (alpha < threshold + noise * ink_bleed) {
        discard;
    }
    
    // 3. 混合本体色与水墨宣纸色
    vec3 mixed_rgb = mix(COLOR.rgb, ink_color.rgb, 0.35);
    COLOR = vec4(mixed_rgb, 1.0);
}
