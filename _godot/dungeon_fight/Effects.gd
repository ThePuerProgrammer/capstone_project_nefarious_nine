extends CanvasLayer

var _questionTimer

# Called when the node enters the scene tree for the first time.
func _ready():
	_questionTimer = get_node("../QuestionManager/QuestionTimer")
	$Vignette.hide()


func _on_QuestionTimer_timeout():
	_questionTimer.stop()
	$WhiteOut.show()
	$WhiteOut.white_out()


func _on_WhiteInAnimationPlayer_animation_finished(anim_name):
	$WhiteOut.hide()


func _on_WhiteOutAnimationPlayer_animation_finished(anim_name):
	$WhiteIn.show()
	$WhiteOut.hide()
	$WhiteIn.white_in()
	$Vignette.show()
	$Vignette.vignette_animation()


func _on_VignetteAnimationPlayer_animation_finished(anim_name):
	print("giving next question! finished!")
	$Vignette.hide()
	_questionTimer.start()
