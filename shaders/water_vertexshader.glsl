varying vec2 coord;


void main() {
  coord = gl_Vertex.xy;

  gl_Position = vec4(gl_Vertex.xyz + 0.5, 1.0);
}
