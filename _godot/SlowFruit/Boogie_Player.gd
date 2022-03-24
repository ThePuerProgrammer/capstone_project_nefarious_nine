extends RigidBody2D

const UP = Vector2(0, -1)
const GRAVITY = 20
const MAXFALLSPEED = 200
const MAXSPEED = 70


var jumping = false
var floor_h_velocity = 0.0


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _integrate_forces(state):
	
	
	var move_left = Input.is_action_just_pressed("move_left")
	var move_right = Input.is_action_just_pressed("move_right")
	var jump = Input.is_action_just_pressed("jump")
