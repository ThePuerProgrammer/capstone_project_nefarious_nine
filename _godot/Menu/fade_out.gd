extends ColorRect

signal fade_out_finished

func fade_out():
	$AnimationPlayer.play("fade_out")

func _on_AnimationPlayer_animation_finished(_anim_name):
	emit_signal("fade_out_finished")
