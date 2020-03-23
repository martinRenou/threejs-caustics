uniform sampler2D tiles;

varying vec2 coords;


void main() {
  gl_FragColor = texture2D(tiles, coords);
}
