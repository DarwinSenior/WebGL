precision mediump float;

varying vec2 texture_coord;
uniform sampler2D sampler;

void main(void){
	gl_FragColor = texture2D(sampler, vec2(texture_coord.s, texture_coord.t));
}