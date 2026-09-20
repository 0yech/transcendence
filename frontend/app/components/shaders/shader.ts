export const vertex =
  /* glsl */
  `
uniform float uFrequency;
uniform float uTime;
uniform float uAmplitude;
uniform vec4 uOndes[4];

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
    float d = 0.0;
	float amp[4];
	amp[0] = 1.000;
	amp[1] = 0.71;
	amp[2] = 0.45;
	amp[3] = 0.38;
	float orb[4];
	orb[0] = 1.371;
	orb[1] = 1.71;
	orb[2] = 0.45;
	orb[3] = 0.87;
	float orbFreq[4];
	orbFreq[0] = 0.123;
	orbFreq[1] = 0.145;
	orbFreq[2] = 0.167;
	orbFreq[3] = 0.156;
	for (int i = 0; i < 4; ++i)
		d += circle(vUv, uOndes[i].xy + vec2(sin(uTime * orbFreq[i]), cos(uTime * orbFreq[i] * orb[i])) * 0.5, uOndes[i].z, uOndes[i].w) * amp[i];
	d /= (amp[0] + amp[1] + amp[2] + amp[3]);
	d *= uAmplitude;
	// d += sin(uv.y * 3.14159) * sin(uv.x * 3.14159);
    newPosition.z = position.z + d;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;
export const fragment =
  /* glsl */
  `
uniform float uFrequency;
uniform float uTime;
uniform vec2 uCursor;
uniform vec4 uColors[5];
uniform vec4 uOndes[4];

varying vec2 vUv;

vec3 mixColor(vec4 colors[5], float d) {
	vec3 ret = colors[0].rgb;
	d = clamp(d, 0.0, 1.0);
	for (int i = 0; i < 4; ++i)
		ret = mix(ret, colors[i + 1].rgb, smoothstep(colors[i].a, colors[i + 1].a, d));
	return (ret);
}

float circle(vec2 uv, vec2 pos, float freq, float speed) {
	return (sin(length(uv - pos) * (freq * uFrequency) + (uTime * speed)) * 0.5 + 0.5);
}

void	main() {
	float d = 0.0;
	float amp[4];
	amp[0] = 1.000;
	amp[1] = 0.71;
	amp[2] = 0.45;
	amp[3] = 0.38;
	float orb[4];
	orb[0] = 1.371;
	orb[1] = 1.71;
	orb[2] = 0.45;
	orb[3] = 0.87;
	float orbFreq[4];
	orbFreq[0] = 0.123;
	orbFreq[1] = 0.145;
	orbFreq[2] = 0.167;
	orbFreq[3] = 0.156;
	for (int i = 0; i < 4; ++i)
		d += circle(vUv, uOndes[i].xy + vec2(sin(uTime * orbFreq[i]), cos(uTime * orbFreq[i] * orb[i])) * 0.5, uOndes[i].z, uOndes[i].w) * amp[i];
	d /= (amp[0] + amp[1] + amp[2] + amp[3]);
	d *= 0.8;
	d += pow(smoothstep(0.9, 1.0, clamp((1.0 - length(uCursor - vUv)), 0.0, 1.0)), 1.4) * 0.2;
	gl_FragColor = vec4(mixColor(uColors, d),1.0);
}
`;
