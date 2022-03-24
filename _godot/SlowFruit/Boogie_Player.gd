extends RigidBody2D

const WALK_ACCEL = 500.0
const WALK_DEACCEL = 500.0
const WALK_MAX_VELOCITY = 140.0
const AIR_ACCEL = 100.0
const AIR_DEACCEL = 100.0
const JUMP_VELOCITY = 380
const STOP_JUMP_FORCE = 450.0


var jumping = false
var stopping_jump = false
var floor_h_velocity = 0.0

var airborne_time = 1e20


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
	
func _integrate_forces(s):
	var lv = s.get_linear_velocity()
	var step = s.get_step()
	
	var move_left = Input.is_action_just_pressed("move_left")
	var move_right = Input.is_action_just_pressed("move_right")
	var jump = Input.is_action_just_pressed("jump")
