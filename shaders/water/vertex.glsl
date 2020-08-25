uniform sampler2D water;

varying vec3 texCoord;

// Air refractive index / Water refractive index
const vec3 cubemapCenter = vec3(0., 0., 0.7);
const float eta = 0.7504;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 pos = vec3(position.xy, position.z + info.r);
  vec3 norm = normalize(vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a)).xzy;

  vec3 cameraVector = pos - cameraPosition;
  vec3 refracted = refract(cameraVector, norm, eta);

  texCoord = (pos - cubemapCenter) + refracted;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
