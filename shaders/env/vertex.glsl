varying vec4 worldPosition;
varying float depth;


void main() {
  // Compute world position
  worldPosition = modelMatrix * vec4(position, 1.);

  // Project vertex in the screen coordinates
  vec4 projectedPosition = projectionMatrix * viewMatrix * worldPosition;

  // Store vertex depth
  float zDepth = projectedPosition.z / projectedPosition.w;
  depth = 0.5 + zDepth * 0.5;

  gl_Position = projectedPosition;
}
