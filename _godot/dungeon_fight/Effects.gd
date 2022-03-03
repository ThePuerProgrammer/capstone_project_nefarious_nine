extends CanvasLayer

var _questionManager
export (Texture) var _enemyIdle_tex

signal player_lost_game
var _playerHpAfterHitReference

# Called when the node enters the scene tree for the first time.
func _ready():
	_questionManager = get_node("../QuestionManager")
	$Vignette.hide()
	
func startPlayerHitEffects(newPlayerHp):
	print("newPlayerHp", newPlayerHp)
	_playerHpAfterHitReference = newPlayerHp
	_questionManager.stopQuestionTimer()
	$WhiteOut.show()
	$WhiteOut.white_out()

func _on_QuestionTimer_timeout():
	startPlayerHitEffects(-1)


func _on_WhiteInAnimationPlayer_animation_finished(_anim_name):
	$WhiteOut.hide()


func _on_WhiteOutAnimationPlayer_animation_finished(_anim_name):
	get_node("../Enemy").texture = _enemyIdle_tex
	$WhiteIn.show()
	$WhiteOut.hide()
	$WhiteIn.white_in()
	$Vignette.show()
	$Vignette.vignette_animation()


func _on_VignetteAnimationPlayer_animation_finished(_anim_name):
	$Vignette.hide()
	$WhiteOut.hide()
	$WhiteIn.hide()
	
	print("before check")
	print(_playerHpAfterHitReference)
	
	if _playerHpAfterHitReference == 0:
		print("in check")
		emit_signal("player_lost_game")
		return

	_questionManager.startNextQuestion()
