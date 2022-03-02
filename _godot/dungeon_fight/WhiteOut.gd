extends ColorRect

func _ready():
	hide()

func white_out():
	$WhiteOutAnimationPlayer.play("white_out")
