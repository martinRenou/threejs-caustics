uniform sampler2D water;

varying vec4 worldPosition;
varying float depth;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);

  // The water position is the vertex position on which we apply the height-map
  vec3 actualPosition = vec3(position.xy, position.z + info.r);

  // Compute world position
  worldPosition = modelMatrix * vec4(actualPosition, 1.);

  // Project vertex in the screen coordinates
  vec4 projectedPosition = projectionMatrix * viewMatrix * worldPosition;

  // Store vertex depth
  float zDepth = projectedPosition.z / projectedPosition.w;
  depth = 0.5 + zDepth * 0.5;

  gl_Position = projectedPosition;
}
