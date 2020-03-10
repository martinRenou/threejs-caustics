uniform sampler2D water;
varying vec3 eye;
varying vec3 pos;


void main() {
  vec4 info = texture2D(water, position.xy * 0.5 + 0.5);
  pos = position.xzy;
  pos.y += info.r;

  vec3 axis_x = vec3(modelViewMatrix[0].x, modelViewMatrix[1].x, modelViewMatrix[2].x);
  vec3 axis_y = vec3(modelViewMatrix[0].y, modelViewMatrix[1].y, modelViewMatrix[2].y);
  vec3 axis_z = vec3(modelViewMatrix[0].z, modelViewMatrix[1].z, modelViewMatrix[2].z);
  vec3 offset = vec3(- modelViewMatrix[0].w, - modelViewMatrix[1].w, - modelViewMatrix[2].w);

  eye = vec3(dot(offset, axis_x), dot(offset, axis_y), dot(offset, axis_z));

  gl_Position = modelViewMatrix * projectionMatrix * vec4(pos, 1.0);
}
