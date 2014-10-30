attribute vec3 v;
attribute vec4 c;

uniform mat4 MV;
uniform mat4 P;

varying vec4 vertex_color;

void main(void){
	gl_Position = P*MV*vec4(v, 1.0);
	vertex_color = c;
}