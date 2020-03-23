uniform vec3 light;

varying vec3 pos;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {
  vec3 dx = dFdx(pos);
  vec3 dy = dFdy(pos);
  vec3 normal = normalize(cross(dx, dy));

  vec3 refracted = refract(light, normal, eta);

  // The alpha channel will be used as a boolean condition:
  // Is there water visible from the light point of view at this pixel?
  gl_FragColor = vec4(refracted.x, refracted.y, refracted.z, 1.);
}
