varying vec4 worldPosition;
varying float depth;


void main() {
  gl_FragColor = vec4(worldPosition.xyz, depth);
  // gl_FragColor = vec4(-depth, 0., 0., 0.);
}
