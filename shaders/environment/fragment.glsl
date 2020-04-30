uniform sampler2D caustics;

varying float lightIntensity;
varying vec3 lightPosition;

const float bias = 0.005;

const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);


void main() {
  // Retrieve the caustics intensity

  // Compute the color given the light intensity

  // Set the frag color
  float computedLightIntensity = 0.5;

  computedLightIntensity += 0.2 * lightIntensity;

  // Retrieve caustics information
  vec2 causticsInfo = texture2D(caustics, lightPosition.xy).zw;
  float causticsIntensity = causticsInfo.x;
  float causticsDepth = causticsInfo.y;

  if (causticsDepth > lightPosition.z - bias) {
    computedLightIntensity += causticsIntensity;
  }

  gl_FragColor = vec4(underwaterColor * computedLightIntensity, 1.);
}
