export const vertex =
  /* glsl */
  `
uniform float uFrequency;
uniform float uTime;
uniform float uAmplitude;
varying vec2 vUv;

float line(vec2 uv, vec2 dir, float freq, float speed) {
	return (sin(dot(uv, dir) * (freq * uFrequency) + (uTime * speed)) * 0.5);
}

float circle(vec2 uv, vec2 pos, float freq, float speed) {
	return (sin(length(uv - pos) * (freq * uFrequency) + (uTime * speed)) * 0.5);
}

void main() {
	vUv = uv;
    vec3 newPosition = position;
    float wave = circle(uv, vec2(-1.0,0.23), 1.0, 1.234);
	wave += circle(uv, vec2(12.0,5.664), 1.0, 0.998);
	wave += line(uv, vec2(0.5,0.6523), 1.4298, 0.496);
	wave /= 3.0;
	wave *= uAmplitude;
    newPosition.z = position.z + wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;
export const fragment =
  /* glsl */
  `
uniform float uFrequency;
uniform float uTime;
uniform float uAmplitude;
uniform float uNoise;
uniform vec2 uCursor;
uniform vec4 uColors[5];

varying vec2 vUv;

float remap(float mn, float mx, float value) {
	return (clamp((value - mn) * (1.0 / (mx - mn)), 0.0, 1.0));
}

vec3 mixColor(vec4 colors[5], float d) {
	vec3 ret = colors[0].rgb;
	d = clamp(d, 0.0, 1.0);
	for (int i = 0; i < 4; ++i)
		ret = mix(ret, colors[i + 1].rgb, smoothstep(colors[i].a, colors[i + 1].a, d));
	float grain = fract(sin(dot(floor(gl_FragCoord.xy / 1.5) + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453);
	ret += (grain - 0.5) * uNoise;
	return (ret);
}

float line(vec2 uv, vec2 dir, float freq, float speed) {
	return (sin(dot(uv, dir) * (freq * uFrequency) + (uTime * speed)) * 0.5 + 0.5);
}

float circle(vec2 uv, vec2 pos, float freq, float speed) {
	return (sin(length(uv - pos) * (freq * uFrequency) + (uTime * speed)) * 0.5 + 0.5);
}

void	main() {
	float d = circle(vUv, vec2(-1.0,0.23), 1.0, 1.234);
	d += circle(vUv, vec2(12.0,5.664), 1.0, 0.998);
	d += line(vUv, vec2(0.5,0.6523), 1.4298, 0.496);
	d /= 3.0;
	d *= 0.8;
	d += pow(smoothstep(0.9, 1.0, clamp((1.0 - length(uCursor - vUv)), 0.0, 1.0)), 1.4) * 0.2;
	gl_FragColor = vec4(mixColor(uColors, d),1.0);
}
`;
