uniform vec3 light;
uniform samplerCube envMap;

varying vec3 pos;
varying vec3 norm;
varying vec3 cameraVector;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {
  // Refract ray and get the refracted color
  vec3 color = textureCube(envMap, refract(cameraVector, norm, eta)).xyz;
  // vec3 color = textureCube(envMap, reflect(cameraVector, norm)).xyz;

  gl_FragColor = vec4(color, 1);
}
