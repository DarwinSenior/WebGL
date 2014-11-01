attribute vec2 t;
attribute vec3 v;
attribute vec3 n;

uniform mat4 MV;
uniform mat4 P;
uniform mat3 N;

uniform vec3 ambient;
uniform vec3 reflect;
uniform vec3 light_direction;

varying vec2 texture_coord;
varying vec3 light_weight;

void main(void){
	gl_Position = P*MV*vec4(v, 1.0);
	texture_coord = t;
	vec3 specular = max(dot(N*n, light_direction), 0.0)*reflect;
	light_weight = ambient + specular;
}