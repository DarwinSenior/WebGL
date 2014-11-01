attribute vec2 t;
attribute vec3 v;

uniform mat4 MV;
uniform mat4 P;

varying vec2 texture_coord;

void main(void){
	gl_Position = P*MV*vec4(v, 1.0);
	texture_coord = t;
}