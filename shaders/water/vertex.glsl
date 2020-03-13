uniform sampler2D water;

varying vec3 pos;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  pos = vec3(position.xy, position.z + info.r);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
