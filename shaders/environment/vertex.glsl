uniform vec3 light;

// Light projection matrix
uniform mat4 lightProjectionMatrix;

varying float vLightIntensity;
varying vec3 vLightPosition;


void main(void){
  vLightIntensity = - dot(light, normalize(normal));

  // Compute position in the light coordinates system, this will be used for
  // comparing fragment depth with the caustics texture
  vec4 lightPosition = lightProjectionMatrix * vec4(position, 1.);
  vLightPosition = 0.5 + lightPosition.xyz / lightPosition.w * 0.5;

  // The position of the vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
