varying vec2 coords;


void main() {
  coords = position.xy * 0.25 + 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
