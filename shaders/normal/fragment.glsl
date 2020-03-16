varying vec3 pos;


void main() {
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 normal = normalize(cross(dx, dy));

  gl_FragColor = vec4(1., 0., 0., 0.0);
}
