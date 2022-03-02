extends ColorRect

func _ready():
	hide()

func vignette_animation():
	$VignetteAnimationPlayer.play("vignette_animation")
