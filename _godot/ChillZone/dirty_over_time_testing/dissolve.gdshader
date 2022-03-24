shader_type canvas_item;

uniform sampler2D dissolve_texture;
uniform sampler2D base_texture;
uniform sampler2D to_dissolve_texture;
uniform vec4 burn_color : hint_color = vec4(1);
uniform float burn_size : hint_range(0, 2);
uniform float dissolve_amount : hint_range(0, 1);
uniform float emission_amount;

void fragment() {
	vec4 out_color = texture(to_dissolve_texture, UV);
	vec4 base_color = texture(base_texture, UV);
 
	float sample = texture(dissolve_texture, UV).r;
	float emission_value = 1.0 - smoothstep(dissolve_amount, dissolve_amount + burn_size, sample);
	vec3 emission = burn_color.rgb * emission_value * emission_amount;
	
	
	vec4 dissolved_texture = vec4(
			max(out_color.rgb, emission), 
			smoothstep(dissolve_amount - burn_size, dissolve_amount, sample) * out_color.a);
	
	
	vec4 color = texture(TEXTURE, UV); // takes the UV from our texture 
	//color.rgb = mix(color.rgb, dissolved_texture.rgb, 1); // first 2 args: what we want to mix, last arg is how much to apply the second value to the first value
	//color.rgb = mix(color.rgb, flash_color.rgb, flash_modifier); // first 2 args: what we want to mix, last arg is how much to apply the second value to the first value
	//COLOR = color;
	
	
	if (dissolved_texture.a == 0f) {
		color = base_color;
	}
	else {
		color.rgb = dissolved_texture.rgb
	}
	
	COLOR = color;
	//COLOR = dissolved_texture;
	
}