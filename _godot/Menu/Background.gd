################################################################################
# This code was written by Jesse. I did not write this code, only borrowed from
# an existing background to maintain fluidity of the Main Menu. 
################################################################################
tool
extends Sprite

func _on_Background_item_rect_changed():
	material.set_shader_param("aspect_ratio", scale.y/scale.x);
