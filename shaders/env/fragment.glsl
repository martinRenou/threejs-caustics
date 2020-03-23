varying vec3 pos;
varying float depth;


void main() {
  gl_FragColor = vec4(pos, depth);
}
