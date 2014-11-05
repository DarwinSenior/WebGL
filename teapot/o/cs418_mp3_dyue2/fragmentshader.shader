precision mediump float;

varying vec3 light_weight;
varying vec3 view_normals;
varying vec3 view_vertices;
varying vec3 m_v;

uniform samplerCube envSampler;
uniform sampler2D sampler;

void main(void){

	vec3 lookup = reflect(normalize(view_vertices), normalize(-view_normals));
	vec4 reflect_color = textureCube(envSampler, -lookup);
	reflect_color = vec4(reflect_color.rgb*light_weight, reflect_color.a);
	//color = vec4(1.0, 1.0, 1.0, 1.0);
	vec2 texture_coord = vec2( m_v.z-floor(m_v.z), atan(m_v.x/m_v.y)-floor(atan(m_v.x/m_v.y)));
	vec4 texture_color = texture2D(sampler, texture_coord);
	texture_color = vec4(texture_color.rgb*light_weight, texture_color.a);
	gl_FragColor = texture_color*0.7+reflect_color*3.0;
}