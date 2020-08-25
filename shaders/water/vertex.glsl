uniform sampler2D water;

varying vec2 refractedPosition;

const float refractionFactor = 1.;

// Air refractive index / Water refractive index
const float eta = 0.7504;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 pos = vec3(position.xy, position.z + info.r);
  vec3 norm = normalize(vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a)).xzy;

  vec3 cameraVector = pos - cameraPosition;
  vec3 refracted = normalize(refract(cameraVector, norm, eta));

  vec4 projectedRefractedPosition = projectionMatrix * modelViewMatrix * vec4(pos + refractionFactor * refracted, 1.0);
  refractedPosition = projectedRefractedPosition.xy / projectedRefractedPosition.w;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
