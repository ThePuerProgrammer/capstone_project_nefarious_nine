shader_type canvas_item;

uniform vec4 flash_color: hint_color = vec4(1.0);
uniform float flash_modifier: hint_range(0.0, 1.0) = 1;

// UV essentially means the coordinates of the sprite

void fragment() { // runs for every pixel in a sprite and determines what color it should be
	vec4 color = texture(TEXTURE, UV); // takes the UV from our texture 
	color.rgb = mix(color.rgb, flash_color.rgb, flash_modifier); // first 2 args: what we want to mix, last arg is how much to apply the second value to the first value
	COLOR = color;
}