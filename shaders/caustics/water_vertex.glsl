uniform vec3 light;

uniform sampler2D water;
uniform sampler2D env;

varying vec3 oldPosition;
varying vec3 newPosition;

// Air refractive index / Water refractive index
const float eta = 0.7504;

// Threshold for which rays are considered parallel. If you increase this number,
// the shader will take less time to compute, but the caustics quality will be reduced.
const float threshold = 0.001;


void main() {
  vec4 waterInfo = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 waterPosition = vec3(position.xy, position.z + waterInfo.r);
  vec3 waterNormal = vec3(waterInfo.b, sqrt(1.0 - dot(waterInfo.ba, waterInfo.ba)), waterInfo.a);

  // This is the initial position: the ray starting point
  oldPosition = waterPosition;

  vec3 pos = position;
  vec2 coords = pos.xy * 0.5 + 0.5;

  vec3 refracted = refract(light, waterNormal, eta);

  if (length(light - refracted) > threshold) {
    // do {
    //   pos += refracted.xy; // This is .xy because the light is on the z axis for now. But we should generalize it.
    //   coords = pos * 0.5 + 0.5;

    // } while ()
    coords += 0.01;
  }

  newPosition = texture2D(env, coords).xyz;

  gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
}
