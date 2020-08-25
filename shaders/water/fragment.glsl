uniform vec3 light;
uniform samplerCube envMap;

varying vec3 texCoord;


void main() {
  // Refract ray and get the refracted color
  vec3 color = textureCube(envMap, texCoord).xyz;
  // vec3 color = textureCube(envMap, reflect(cameraVector, norm)).xyz;

  gl_FragColor = vec4(color, 1);
}
