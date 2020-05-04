uniform vec3 light;

uniform sampler2D water;
uniform sampler2D env;

varying vec3 oldPosition;
varying vec3 newPosition;
varying float waterDepth;
varying float depth;

// Air refractive index / Water refractive index
const float eta = 0.7504;

// TODO Make this a uniform
const float EPSILON = 0.02;

// TODO Make this a uniform
// This is the maximum iterations when looking for the ray intersection with the environment,
// if after this number of attempts we did not find the intersection, the result will be wrong.
const int MAX_ITERATIONS = 50;

const vec2 zero = vec2(0.);
const vec2 one = vec2(1.);


void main() {
  vec4 waterInfo = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  // TODO Remove the ugly hardcoded +0.8 for the water position
  vec3 waterPosition = vec3(position.xy, position.z + waterInfo.r + 0.8);
  vec3 waterNormal = normalize(vec3(waterInfo.b, sqrt(1.0 - dot(waterInfo.ba, waterInfo.ba)), waterInfo.a)).xzy;

  // This is the initial position: the ray starting point
  oldPosition = waterPosition;

  // Compute water coordinates in the screen space
  vec4 projectedWaterPosition = projectionMatrix * viewMatrix * vec4(waterPosition, 1.);

  // Compute water depth, from the light POV
  float zDepth = projectedWaterPosition.z / projectedWaterPosition.w;
  waterDepth = 0.5 + zDepth * 0.5;

  vec2 coords = projectedWaterPosition.xy * 0.5 + 0.5;

  vec3 refracted = refract(light, waterNormal, eta);
  vec4 projectedRefractionVector = projectionMatrix * viewMatrix * vec4(refracted, 1.);

  float refractedDepth = 0.5 + 0.5 * projectedRefractionVector.z / projectedRefractionVector.w;
  vec2 refractedDirection = projectedRefractionVector.xy;

  float currentDepth = waterDepth;
  vec4 environment = texture2D(env, coords);

  for (int i = 0; i < MAX_ITERATIONS; i++) {
    // End of loop condition: Either the ray has hit the environment, or we reached the environment texture boundaries
    if (environment.w - currentDepth <= EPSILON ||
        any(lessThan(coords, zero)) || any(greaterThan(coords, one))) {
      break;
    }

    // Move the coords in the direction of the refraction
    // TODO Replace this hardcode value, and compute it in a clever way
    coords += refractedDirection * 0.1;

    // Move the current ray depth in the direction of the refraction
    // TODO Replace this hardcode value, and compute it in a clever way
    currentDepth += refractedDepth * 0.1;

    // TODO prevent rereading the same pixel if the coords did not change?
    // Or find a suitable factor (cleverer than the hardcoded value) for going through the texture
    environment = texture2D(env, coords);
  }

  newPosition = environment.xyz;
  depth = environment.w;

  gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
}
