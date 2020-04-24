uniform vec3 light;

uniform sampler2D water;
uniform sampler2D env;

varying vec3 oldPosition;
varying vec3 newPosition;
varying vec3 color;

// Air refractive index / Water refractive index
const float eta = 0.7504;

// TODO Make this a uniform
// Threshold for which rays are considered parallel. If you increase this number,
// the shader will take less time to compute, but the caustics quality might be reduced.
const float EPSILON = 0.01;

// TODO Make this a uniform
// This is the maximum iterations when looking for the ray intersection with the environment,
// if after this number of attempts we did not find the intersection, the result will be off.
const int MAX_ITERATIONS = 80;


void main() {
  vec4 waterInfo = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 waterPosition = vec3(position.xy, position.z + waterInfo.r);
  vec3 waterNormal = normalize(vec3(waterInfo.b, sqrt(1.0 - dot(waterInfo.ba, waterInfo.ba)), waterInfo.a));

  // This is the initial position: the ray starting point
  oldPosition = waterPosition;

  // Compute water coordinates in the screen space
  vec4 projectedWaterPosition = projectionMatrix * viewMatrix * vec4(waterPosition, 1.);

  // Compute water depth, from the light POV
  float zDepth = projectedWaterPosition.z / projectedWaterPosition.w;
  float waterDepth = 0.5 + zDepth * 0.5;

  vec2 coords = projectedWaterPosition.xy;

  vec3 refracted = refract(light, waterNormal, eta);
  vec4 projectedRefractionVector = projectionMatrix * viewMatrix * vec4(refracted, 1.);

  float refractedDepth = 0.5 + 0.5 * projectedRefractionVector.z / projectedRefractionVector.w;
  vec2 refractedDirection = normalize(projectedRefractionVector.xy);

  color = vec3(0., 1., 0.);

  if (all(greaterThan(abs(light - refracted), vec3(EPSILON)))) {
    float currentDepth = waterDepth;

    for (int i = 0; i < MAX_ITERATIONS; i++) {
      color = vec3(1., 0., 0.);
      // TODO Add condition on the texture size, the coords should not got out of the texture boundaries
      if (currentDepth > texture2D(env, coords * 0.5 + 0.5).w) {
        color = vec3(0., 0., 1.);
        break;
      }

      // Move the coords by one pixel in the direction of the refraction
      coords += refractedDirection * 0.004;

      // Move the current ray depth in the direction of the refraction
      currentDepth += refractedDepth * 0.004;
    }
  }

  newPosition = texture2D(env, coords).xyz;

  // gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
  gl_Position = projectionMatrix * viewMatrix * vec4(oldPosition, 1.0);
}
