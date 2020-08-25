uniform sampler2D envMap;

varying vec2 refractedPosition;


void main() {
  vec3 color = texture2D(envMap, refractedPosition * 0.5 + 0.5).xyz;

  gl_FragColor = vec4(color, 1.);
}
