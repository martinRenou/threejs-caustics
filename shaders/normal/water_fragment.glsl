varying vec3 pos;
varying float depth;


void main() {
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 normal = normalize(cross(dx, dy));

  gl_FragColor = vec4(normal.x, normal.y, normal.z, depth);
}
