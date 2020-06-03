uniform vec3 light;
uniform sampler2D caustics;
uniform sampler2D texture;
uniform sampler2D normalTexture;

varying vec3 lightPosition;
varying vec2 vUv;

const float bias = 0.005;

const vec3 underwaterColor = vec3(0.4, 0.9, 1.0);


void main() {
  // Retrieve fragment normal from the normal texture
  vec3 normal = texture2D(normalTexture, vUv).xyz;

  // Compute the light intensity
  // TODO Take the refracted light as input instead?
  float lightIntensity = - dot(light, normalize(normal));

  // Retrieve the texture color
  vec3 color = texture2D(texture, vUv).xyz;

  // Retrieve caustics information
  vec2 causticsInfo = texture2D(caustics, lightPosition.xy).zw;
  float causticsIntensity = causticsInfo.x;
  float causticsDepth = causticsInfo.y;

  if (causticsDepth > lightPosition.z - bias) {
    lightIntensity += causticsIntensity;
  }

  gl_FragColor = vec4(underwaterColor * color * lightIntensity, 1.);
}
