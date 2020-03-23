uniform vec3 light;

uniform sampler2D env;
uniform sampler2D waterNormal;

varying vec2 coords;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {
  coords = position.xy * 0.5 + 1.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
