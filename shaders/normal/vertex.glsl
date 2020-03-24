uniform sampler2D water;

varying vec3 pos;
varying float depth;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  pos = vec3(position.xy, position.z + info.r);

  // Project vertex in the screen coordinates
  vec4 projectedPosition = projectionMatrix * modelViewMatrix * vec4(pos, 1.);

  // Store vertex depth
  float zDepth = projectedPosition.z / projectedPosition.w;
  depth = 0.5 + zDepth * 0.5;

  gl_Position = projectedPosition;
}
