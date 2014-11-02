precision mediump float;

varying vec3 light_weight;
varying vec3 view_normals;
varying vec3 view_vertices;

uniform samplerCube envSampler;

void main(void){

	vec3 lookup = reflect(normalize(view_vertices), normalize(-view_normals));
	vec4 color = textureCube(envSampler, -lookup);
	//color = vec4(1.0, 1.0, 1.0, 1.0);
	gl_FragColor = vec4(color.rgb*light_weight, color.a);
}