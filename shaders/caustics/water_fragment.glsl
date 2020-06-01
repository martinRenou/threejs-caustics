// TODO Make it a uniform
const float causticsFactor = 0.2;

varying vec3 oldPosition;
varying vec3 newPosition;
varying float waterDepth;
varying float depth;


void main() {
  float causticsIntensity = 0.;

  if (depth >= waterDepth) {
    float oldArea = length(dFdx(oldPosition)) * length(dFdy(oldPosition));
    float newArea = length(dFdx(newPosition)) * length(dFdy(newPosition));

    causticsIntensity = causticsFactor * oldArea / newArea;
  }

  gl_FragColor = vec4(causticsIntensity, causticsIntensity, causticsIntensity, depth);
}
