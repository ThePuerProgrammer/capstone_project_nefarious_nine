extends CanvasLayer

var _questionManager
export (Texture) var _enemyIdle_tex

signal player_lost_game
signal enemy_attack_animation_finished
signal player_may_return

var _enemyAttacking = false
var _enemyAttackingP2
var _playerHpAfterHitReference
var _enemyMissed = false
var _enemy
var _player

var _enemyPermaDead

# Called when the node enters the scene tree for the first time.
func _ready():
	_questionManager = get_node("../QuestionManager")
	$Vignette.hide()
	_enemy = get_node("../Enemy")
	_player = get_node("../Player")
	
func startPlayerHitEffects(newPlayerHp):
	_enemyAttacking = true
	get_node("../Enemy").play("attack_animation_p1")
	yield(self, "enemy_attack_animation_finished")
	_enemyAttacking = false
	
	if newPlayerHp == 0:
		_player.playAnimation("die")
		
	_questionManager.stopQuestionTimer()
	$WhiteOut.show()
	$WhiteOut.white_out()
	
func startEnemyMissEffect():
	_enemyAttacking = true
	_enemyMissed = true
	get_node("../Enemy").play("attack_animation_p1")
	yield(self, "enemy_attack_animation_finished")
	_enemyAttacking = false
	_questionManager.stopQuestionTimer()

#func _on_QuestionTimer_timeout():
	#startPlayerHitEffects(-1)


func _on_WhiteInAnimationPlayer_animation_finished(_anim_name):
	$WhiteOut.hide()


func _on_WhiteOutAnimationPlayer_animation_finished(_anim_name):
	$WhiteIn.show()
	$WhiteOut.hide()
	$WhiteIn.white_in()
	$Vignette.show()
	$Vignette.vignette_animation()


func _on_VignetteAnimationPlayer_animation_finished(_anim_name):
	$Vignette.hide()
	$WhiteOut.hide()
	$WhiteIn.hide()
	
	#print(_playerHpAfterHitReference)

	get_node("../Enemy").play("idle_animation")
	_questionManager.startNextQuestion()
	_questionManager.hideAnswerIndicators()	

func _on_Enemy_animation_finished():
	if _enemy.animation == "die":
		_enemy.play("dead")
		return
	elif _enemy.animation == "hit_effect":
		#print("made it")
		_enemy.play("idle_animation")
		return;

	
	if _enemyAttacking:
		emit_signal("enemy_attack_animation_finished")
		_enemyAttackingP2 = true
		get_node("../Enemy").play("attack_animation_p2")
	elif _enemyAttackingP2:
		_enemyAttackingP2 = false
		if _enemyMissed:
			emit_signal("player_may_return")
			_enemyMissed = false
		get_node("../Enemy").play("attack_lingering")
