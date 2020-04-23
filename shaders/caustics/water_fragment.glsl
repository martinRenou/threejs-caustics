// TODO Make it a uniform
const float causticsFactor = 0.5;

varying vec3 oldPosition;
varying vec3 newPosition;
varying vec3 color;


void main() {
  float oldArea = length(dFdx(oldPosition)) * length(dFdy(oldPosition));
  float newArea = length(dFdx(newPosition)) * length(dFdy(newPosition));

  float causticsIntensity = causticsFactor * oldArea / newArea;

  // gl_FragColor = vec4(causticsIntensity, causticsIntensity, causticsIntensity, 1.);
  gl_FragColor = vec4(color, 1.);
}
