void main() {
  // The alpha channel will be used as a boolean condition:
  // Is there water visible from the light point of view at this pixel?
  // Here the environment is hiding the water, because in front of it.
  gl_FragColor = vec4(0., 0., 0., 0.);
}
