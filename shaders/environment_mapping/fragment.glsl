varying vec4 worldPosition;
varying float depth;


void main() {
  gl_FragColor = vec4(worldPosition.xyz, depth);
}
