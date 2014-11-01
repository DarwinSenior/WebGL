precision mediump float;

varying vec2 texture_coord;
varying vec3 light_weight;
uniform sampler2D sampler;

void main(void){
	vec4 texture_color = texture2D(sampler, vec2(texture_coord.s, texture_coord.t));
	gl_FragColor = vec4(texture_color.rgb * light_weight, texture_color.a);
}