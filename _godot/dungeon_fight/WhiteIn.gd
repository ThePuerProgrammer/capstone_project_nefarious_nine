extends ColorRect

func _ready():
	hide()

func white_in():
	$WhiteInAnimationPlayer.play("white_in")
