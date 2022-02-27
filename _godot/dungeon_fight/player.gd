extends KinematicBody2D


# Declare member variables here. Examples:
# var a = 2
# var b = "text"

export (int) var _speed = 20
var _velocity = Vector2()


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass

func get_input():
	if Input.is_action_just_pressed("dungeon_dodge_left"):
		_velocity.x -= 1
	if Input.is_action_just_pressed("dungeon_dodge_right"):
		_velocity.x += 1
	if Input.is_action_just_pressed("dungeon_attack"):
		pass
	if Input.is_action_just_pressed("dungeon_block"):
		pass
		
	_velocity = _velocity.normalized() * _speed
		
func _physics_process(delta):
	get_input()
	_velocity = move_and_slide(_velocity)
	
func cartesian_to_isometric(cartesian):
	var current_pos = Vector2()
	current_pos.x = cartesian.x - cartesian.y
	current_pos.y = (cartesian.x + cartesian.y) / 2
	return current_pos
	
	
