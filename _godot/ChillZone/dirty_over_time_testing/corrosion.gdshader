shader_type canvas_item;

uniform sampler2D noise_texture;
uniform float fade_scale: hint_range(0, 1);
uniform sampler2D end_texture : hint_albedo;

void fragment() {
// Input:2
	vec3 n_out2p0 = vec3(UV, 0.0);

// Input:35
	vec3 n_out35p0 = vec3(UV, 0.0);

// Texture:30
	vec4 tex_frg_30_read = texture(noise_texture, n_out35p0.xy);
	vec3 n_out30p0 = tex_frg_30_read.rgb;
	float n_out30p1 = tex_frg_30_read.a;

// ScalarUniform:36
	float n_out36p0 = fade_scale;

// ScalarClamp:44
	float n_in44p1 = 0.00000;
	float n_in44p2 = 1.00000;
	float n_out44p0 = clamp(n_out36p0, n_in44p1, n_in44p2);

// ScalarMix:33
	float n_in33p2 = 0.50000;
	float n_out33p0 = mix(n_out44p0, dot(n_out30p0, vec3(0.333333, 0.333333, 0.333333)), n_in33p2);

// ScalarFunc:34
	float n_out34p0 = round(n_out33p0);

// TextureUniform:37
	vec3 n_out37p0;
	float n_out37p1;
	{
		vec4 n_tex_read = texture(end_texture, UV.xy);
		n_out37p0 = n_tex_read.rgb;
		n_out37p1 = n_tex_read.a;
	}

// TextureUniform:38
	vec3 n_out38p0;
	float n_out38p1;
	{
		vec4 n_tex_read = texture(TEXTURE, UV);
		n_out38p0 = n_tex_read.rgb;
		n_out38p1 = n_tex_read.a;
	}

// If:29
	vec3 n_out29p0;
	if(abs(dot(n_out2p0, vec3(0.333333, 0.333333, 0.333333)) - dot(n_out30p0, vec3(0.333333, 0.333333, 0.333333))) < n_out34p0)
	{
		n_out29p0 = n_out37p0;
	}
	else if(dot(n_out2p0, vec3(0.333333, 0.333333, 0.333333)) < dot(n_out30p0, vec3(0.333333, 0.333333, 0.333333)))
	{
		n_out29p0 = n_out38p0;
	}
	else
	{
		n_out29p0 = n_out38p0;
	}
	
	COLOR.rgb = mix(COLOR.rgb, n_out29p0.rgb, 1);
	//color.rgb = mix(color.rgb, flash_color.rgb, flash_modifier); // first 2 args: what we want to mix, last arg is how much to apply the second value to the first value
	//COLOR.rgb = n_out29p0;

// Output:0
	//ALBEDO = n_out29p0;

}