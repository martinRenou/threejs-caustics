uniform vec3 light;

uniform sampler2D env;
uniform sampler2D waterNormal;

varying vec2 coords;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {

  vec3 normal =
  vec3 refracted = refract(light, normal, eta);

  gl_FragColor = vec4(pos, depth);
}
