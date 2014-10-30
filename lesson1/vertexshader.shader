attribute vec3 v;

uniform mat4 MV;
uniform mat4 P;

void main(void){
	gl_Position = P*MV*vec4(v, 1.0);
}