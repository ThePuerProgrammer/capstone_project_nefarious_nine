extends KinematicBody2D


# Declare member variables here. Examples:
# var a = 2
# var b = "text"
var _t = 0.0
var _dodgeTime = 1.0

export (int) var _speed = 1
export (int) var _currentSpeed = 0

# References to positions for places the 
#	character will move to
var _leftPosition
var _middlePosition
var _rightPosition

var _startPosition
var _endPosition

var _dodgingLeft
var _dodgingRight

var _questionManager


# Called when the node enters the scene tree for the first time.
func _ready():
	_leftPosition = get_node("../LeftPlayerPosition").position
	_middlePosition = get_node("../MiddlePlayerPosition").position
	_rightPosition = get_node("../RightPlayerPosition").position
	_questionManager = get_node("../QuestionManager")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if !_dodgingLeft and !_dodgingRight:
		get_input()


func get_input():
	if Input.is_action_just_pressed("dungeon_dodge_left"):
		_startPosition = _middlePosition
		_endPosition = _leftPosition
		_dodgingLeft = true
		_questionManager.setCurrentAction("dodge_left")
		_t = 0
	if Input.is_action_just_pressed("dungeon_dodge_right"):
		_startPosition = _middlePosition
		_endPosition = _rightPosition
		_dodgingRight = true
		_questionManager.setCurrentAction("dodge_right")
		_t = 0
	if Input.is_action_just_pressed("dungeon_attack"):
		_questionManager.setCurrentAction("attack")
		pass
	if Input.is_action_just_pressed("dungeon_block"):
		_questionManager.setCurrentAction("block")
		pass


func _physics_process(delta):	
	if _dodgingLeft:
		# When we reach the left position, turn around to return
		#	to the middle position
		if position == _leftPosition:
			_startPosition = _leftPosition
			_endPosition = _middlePosition
			_t = 0
			
		# move player from _startPosition to _endPosition using _t 
		#	to adjust the speed of movement over time.
		_t += delta * _speed
		position = _startPosition.linear_interpolate(_endPosition, _t)
		
		# When we return to the _middlePosition, stop interpolating
		if position == _middlePosition:
			_dodgingLeft = false
	elif _dodgingRight:
		# When we reach the left position, turn around to return
		#	to the middle position
		if position == _rightPosition:
			_startPosition = _rightPosition
			_endPosition = _middlePosition
			_t = 0
			
		# move player from _startPosition to _endPosition using _t 
		#	to adjust the speed of movement over time.
		_t += delta * _speed
		position = _startPosition.linear_interpolate(_endPosition, _t)
		
		# When we return to the _middlePosition, stop interpolating
		if position == _middlePosition:
			_dodgingRight = false

func cartesian_to_isometric(cartesian):
	var current_pos = Vector2()
	current_pos.x = cartesian.x - cartesian.y
	current_pos.y = (cartesian.x + cartesian.y) / 2
	return current_pos
