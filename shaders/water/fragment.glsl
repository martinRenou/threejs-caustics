uniform sampler2D envMap;

varying vec2 projectedRefraction;
varying vec2 projectedPosition;

const float refractionFactor = 0.2;


void main() {
  vec3 color = texture2D(envMap, (projectedPosition + refractionFactor * projectedRefraction) * 0.5 + 0.5).xyz;

  gl_FragColor = vec4(color, 1.);
}
