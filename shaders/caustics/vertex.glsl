uniform vec3 light;

uniform sampler2D env;
uniform sampler2D waterNormal;

varying vec3 oldPosition;
varying vec3 newPosition;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {
  vec4 water = texture2D(waterNormal, position.xy * 0.5 + 0.5);
  vec3 normal = water.xyz;
  float depth = water.w;

  vec3 refracted = refract(light, normal, eta);

  // TODO Project the ray onto the environment map, and retrieve the
  // newPosition according to the projection result

  oldPosition = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
