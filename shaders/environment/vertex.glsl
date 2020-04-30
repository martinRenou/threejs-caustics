uniform vec3 light;

// Light projection matrix
uniform mat4 lightProjectionMatrix;
uniform mat4 lightViewMatrix;

varying float lightIntensity;
varying vec3 lightPosition;


void main(void){
  lightIntensity = - dot(light, normalize(normal));

  // Compute position in the light coordinates system, this will be used for
  // comparing fragment depth with the caustics texture
  vec4 lightRelativePosition = lightProjectionMatrix * lightViewMatrix * modelMatrix * vec4(position, 1.);
  lightPosition = 0.5 + lightRelativePosition.xyz / lightRelativePosition.w * 0.5;

  // The position of the vertex
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
