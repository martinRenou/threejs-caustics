uniform sampler2D caustics;

varying float lightIntensity;
varying vec3 lightPosition;


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

  if (causticsDepth <= lightPosition.z) {
    computedLightIntensity += causticsIntensity;
  }

  vec3 color = vec3(computedLightIntensity);
  // vec3 color = vec3(causticsDepth);
  // vec3 color = vec3(lightPosition.z);

  gl_FragColor = vec4(color, 1.);
}
