tool
extends Sprite

func resized_screen():
	material.set_shader_param("aspect_ratio", scale.y/scale.x);
