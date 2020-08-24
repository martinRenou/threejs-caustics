uniform sampler2D water;

varying vec3 pos;
varying vec3 norm;
varying vec3 cameraVector;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  pos = vec3(position.xy, position.z + info.r);
  norm = normalize(vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a)).xzy;

  cameraVector = normalize(pos - cameraPosition);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
