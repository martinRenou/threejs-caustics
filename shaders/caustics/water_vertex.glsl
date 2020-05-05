uniform vec3 light;

uniform sampler2D water;
uniform sampler2D env;

varying vec3 color;

varying vec3 oldPosition;
varying vec3 newPosition;
varying float waterDepth;
varying float depth;

// Air refractive index / Water refractive index
const float eta = 0.7504;

// TODO Make this a uniform
const float EPSILON = 0.001;

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
  vec3 waterProjected = projectedWaterPosition.xyz / projectedWaterPosition.w;
  waterDepth = waterProjected.z;

  vec2 coords = 0.5 + 0.5 * waterProjected.xy;

  vec3 refracted = refract(light, waterNormal, eta);
  vec4 projectedRefractionVector = projectionMatrix * viewMatrix * vec4(refracted, 1.);

  vec3 refractedDirection = projectedRefractionVector.xyz / projectedRefractionVector.w;

  float currentDepth = waterDepth;
  vec4 environment = texture2D(env, coords);

  float wasted = 0.;
  color = vec3(0., 0., 0.);

  // // If there is a refraction
  if (!all(equal(refractedDirection.xy, zero))) {
    // Hard-coded for now (1. / envTextureWidth = 1. / 256)
    const float deltaTexture = 0.04;
    // float factor = deltaTexture / min(refractedDirection.x, refractedDirection.y);
    // float factor = deltaTexture / length(refractedDirection.xy);
    float factor = deltaTexture;

    vec2 deltaDirection = refractedDirection.xy * factor;
    float deltaDepth = refractedDirection.z * factor;

    for (int i = 0; i < MAX_ITERATIONS; i++) {
      wasted += 0.02;
      // End of loop condition: Either the ray has hit the environment, or we reached the environment texture boundaries
      if (environment.w - currentDepth <= EPSILON ||
          any(lessThan(coords, zero)) || any(greaterThan(coords, one))) {
        break;
      }

      // Move the coords in the direction of the refraction
      // TODO Replace this hardcode value, and compute it in a clever way
      coords += 0.5 * deltaDirection;

      // Move the current ray depth in the direction of the refraction
      // TODO Replace this hardcode value, and compute it in a clever way
      currentDepth += deltaDepth;

      // TODO prevent rereading the same pixel if the coords did not change?
      // Or find a suitable factor (cleverer than the hardcoded value) for going through the texture
      environment = texture2D(env, coords);
    }
    color = vec3(refractedDirection.z, 0., 0.);
  }

  // color = vec3(environment.xyz);

  newPosition = environment.xyz;
  depth = environment.w;

  gl_Position = projectionMatrix * viewMatrix * vec4(oldPosition, 1.0);
  // gl_Position = projectionMatrix * viewMatrix * vec4(newPosition, 1.0);
}
