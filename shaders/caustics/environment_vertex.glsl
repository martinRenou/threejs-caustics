varying float depth;


void main() {
  // Project vertex in the screen coordinates
  vec4 projectedPosition = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.);

  // Store vertex depth
  float zDepth = projectedPosition.z / projectedPosition.w;
  depth = 0.5 + zDepth * 0.5;

  gl_Position = projectedPosition;
}
