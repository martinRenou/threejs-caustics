varying vec3 pos;


void main() {
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 normal = normalize(cross(dx, dy));

  // The alpha channel will be used as a boolean condition:
  // Is there water visible from the light point of view at this pixel?
  gl_FragColor = vec4(normal.x, normal.y, normal.z, 1.);
}
