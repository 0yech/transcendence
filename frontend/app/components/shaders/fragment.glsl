uniform float uFrequency;
uniform float uTime;
uniform float uAmplitude;
uniform vec4 uColors[5];
varying vec2 vUv;

vec3 mixColor(vec4 colors[5], float d) {
	vec3 ret = vec3(0.0,0.0,0.0);
	d = clamp(d, 0.0, 1.0);
	for (int i = 0; i < 4; ++i) {
		ret += mix(colors[i].rgb, colors[i + 1].rgb, smoothstep(colors[i].a, colors[i + 1].a, d));
	}
	return (ret);
}

void	main() {
	float d = sin(length(vUv - vec2(0.5,0.5)) * 30. * uFrequency + uTime) * 0.5 + 0.5;
	gl_FragColor = vec4(mixColor(uColors, d),1.0);
}