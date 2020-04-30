uniform sampler2D caustics;

varying float vLightIntensity;
varying vec3 vLightPosition;


void main() {
  // Retrieve the caustics intensity

  // Compute the color given the light intensity

  // Set the frag color
  // vec3 color = vec3(0.9) * vLightIntensity;
  float causticsIntensity = texture2D(caustics, vLightPosition.xy).x;
  // vec3 color = vec3(vLightPosition, 0.);

  gl_FragColor = vec4(color, 1.);
}
