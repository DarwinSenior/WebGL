
attribute vec3 v;
attribute vec3 n;

uniform mat4 MV;
uniform mat4 P;
uniform mat3 N;

uniform vec3 ambient;
uniform vec3 reflect;
uniform vec3 light_direction;

varying vec3 light_weight;
varying vec3 view_normals;
varying vec3 view_vertices;
varying vec3 m_v;

void main(void){
	m_v = v;
	gl_Position = P*MV*vec4(v, 1.0);
	view_vertices = (MV*vec4(v, 1.0)).xyz;
	view_normals = N*n;

	vec3 specular = max(dot(N*n, light_direction), 0.0)*reflect;
	light_weight = ambient + specular;
}