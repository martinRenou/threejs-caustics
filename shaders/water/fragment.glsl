precision highp float;
precision highp int;

uniform vec3 light;
uniform sampler2D water;

varying vec3 pos;


void main() {
  vec2 coord = pos.xz * 0.5 + 0.5;
  vec4 info = texture2D(water, coord);

  vec3 normal = vec3(info.b, sqrt(1.0 - dot(info.ba, info.ba)), info.a);

  float light_intensity = - dot(light, normalize(normal)) + 1.;

  vec3 color = vec3(0.45, 0.64, 0.74);

  gl_FragColor = vec4(color * light_intensity + 0.4, 1.0);
}
