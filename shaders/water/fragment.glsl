uniform sampler2D envMap;
uniform samplerCube skybox;

varying vec2 refractedPosition;
varying vec3 reflected;
varying float reflectionFactor;


void main() {
  vec3 refractedColor = texture2D(envMap, refractedPosition * 0.5 + 0.5).xyz;
  vec3 reflectedColor = textureCube(skybox, reflected).xyz;

  gl_FragColor = vec4(mix(refractedColor, reflectedColor, clamp(reflectionFactor, 0., 1.)), 1.);
}
