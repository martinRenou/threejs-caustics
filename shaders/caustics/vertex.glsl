uniform vec3 light;

uniform sampler2D env;
uniform sampler2D waterNormal;

varying vec3 oldPosition;
varying vec3 newPosition;

// Air refractive index / Water refractive index
const float eta = 0.7504;

// Threshold for which rays are considered parallel. If you increase this number,
// the shader will take less time to compute, but the caustics quality will be reduced.
const float threshold = 0.001;


void main() {
  oldPosition = position;

  vec3 pos = position;
  vec2 coords = pos.xy * 0.5 + 0.5;

  vec4 water = texture2D(waterNormal, coords);
  vec3 normal = water.xyz;
  float depth = water.w;

  vec3 refracted = refract(light, normal, eta);

  if (length(light - refracted) > threshold) {
    // do {
    //   pos += refracted.xy; // This is .xy because the light is on the z axis for now. But we should generalize it.
    //   coords = pos * 0.5 + 0.5;

    // } while ()
    coords += 2.;
  }

  newPosition = texture2D(env, coords).xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
