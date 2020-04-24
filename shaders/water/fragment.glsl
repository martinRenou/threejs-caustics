uniform vec3 light;

varying vec3 pos;


void main() {
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 normal = normalize(cross(dx, dy));

  float light_intensity = - dot(light, normalize(normal));

  vec3 color = vec3(0.45, 0.64, 0.74);

  gl_FragColor = vec4(color * light_intensity, 0.7);
}
