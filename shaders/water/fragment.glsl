uniform vec3 light;

varying vec3 pos;
varying vec3 norm;


void main() {
  float light_intensity = - dot(light, norm);

  vec3 color = vec3(0.45, 0.64, 0.74);

  gl_FragColor = vec4(color * light_intensity, 0.7);
}
