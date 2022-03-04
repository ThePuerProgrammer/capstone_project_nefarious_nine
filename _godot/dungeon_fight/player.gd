extends KinematicBody2D

var _t = 0.0
var _dodgeTime = 1.0

signal enemy_finished_missing

export (int) var _speed = 1
export (int) var _currentSpeed = 0

# References to positions for places the 
#	character will move to
var _leftPosition
var _middlePosition

var _startPosition
var _endPosition

var _dodging

var _questionManager
var _actionBar


# Called when the node enters the scene tree for the first time.
func _ready():
	_leftPosition = get_node("../LeftPlayerPosition").position
	_middlePosition = get_node("../MiddlePlayerPosition").position
	_questionManager = get_node("../QuestionManager")
	_questionManager.setCurrentAction("attack")
	_actionBar = get_node("../ActionBar")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if !_dodging:
		get_input()


func get_input():
	if Input.is_action_just_pressed("dungeon_dodge"):
		_questionManager.setCurrentAction("dodge")
		_actionBar.updateActionSprite("dodge")
		_t = 0
	if Input.is_action_just_pressed("dungeon_attack"):
		_questionManager.setCurrentAction("attack")
		_actionBar.updateActionSprite("attack")
		pass


func _physics_process(delta):
	if _dodging:
		# When we reach the left position, turn around to return
		#	to the middle position
		if position <= _leftPosition:
			$PlayerAnimatedSprite.play("idle")
			yield(self, "enemy_finished_missing")
			$PlayerAnimatedSprite.play("dodge")
			_startPosition = _leftPosition
			_endPosition = _middlePosition
			_t = 0
			$PlayerAnimatedSprite.flip_h = false
			
		# move player from _startPosition to _endPosition using _t 
		#	to adjust the speed of movement over time.
		_t += delta * _speed
		position = _startPosition.linear_interpolate(_endPosition, _t)
		
		# When we return to the _middlePosition, stop interpolating
		if position == _middlePosition:
			$PlayerAnimatedSprite.play("idle")
			_dodging = false

func cartesian_to_isometric(cartesian):
	var current_pos = Vector2()
	current_pos.x = cartesian.x - cartesian.y
	current_pos.y = (cartesian.x + cartesian.y) / 2
	return current_pos
	
func startDodge():
	_startPosition = _middlePosition
	_endPosition = _leftPosition
	_dodging = true
	_t = 0

func dodgeAction():
	startDodge()
	$PlayerAnimatedSprite.flip_h = true
	$PlayerAnimatedSprite.play("dodge")

func attackAction():
	$PlayerAnimatedSprite.play("attack")
	
func resumeIdleAnimation():
	$PlayerAnimatedSprite.play("idle")


func _on_Effects_player_may_return():
	emit_signal("enemy_finished_missing")

func playAnimation(anim_name):
	$PlayerAnimatedSprite.play(anim_name)


func _on_PlayerAnimatedSprite_animation_finished():
	if $PlayerAnimatedSprite.animation == "die":
		playAnimation("dead")
