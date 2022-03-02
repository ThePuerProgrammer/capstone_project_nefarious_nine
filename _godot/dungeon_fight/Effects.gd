extends CanvasLayer

var _questionManager
export (Texture) var _enemyIdle_tex

# Called when the node enters the scene tree for the first time.
func _ready():
	_questionManager = get_node("../QuestionManager")
	$Vignette.hide()
	
func startPlayerHitEffects():
	_questionManager.stopQuestionTimer()
	$WhiteOut.show()
	$WhiteOut.white_out()

func _on_QuestionTimer_timeout():
	startPlayerHitEffects()


func _on_WhiteInAnimationPlayer_animation_finished(anim_name):
	$WhiteOut.hide()


func _on_WhiteOutAnimationPlayer_animation_finished(anim_name):
	get_node("../Enemy").texture = _enemyIdle_tex
	$WhiteIn.show()
	$WhiteOut.hide()
	$WhiteIn.white_in()
	$Vignette.show()
	$Vignette.vignette_animation()


func _on_VignetteAnimationPlayer_animation_finished(anim_name):
	$Vignette.hide()
	$WhiteOut.hide()
	$WhiteIn.hide()
	print("giving next question! finished!")
	_questionManager.startNextQuestion()
