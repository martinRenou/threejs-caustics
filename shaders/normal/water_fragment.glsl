varying vec4 worldPosition;
varying float depth;


void main() {
  vec3 dx = dFdx(worldPosition.xyz);
  vec3 dy = dFdy(worldPosition.xyz);
  vec3 normal = normalize(cross(dx, dy));

  gl_FragColor = vec4(normal.x, normal.y, normal.z, depth);
}
