attribute vec3 position;
varying vec2 coord;


void main() {
  coord = position.xy;

  gl_Position = vec4(position.xyz + 0.5, 1.0);
}
