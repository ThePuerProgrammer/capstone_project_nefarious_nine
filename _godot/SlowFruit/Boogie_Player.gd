extends RigidBody2D

# Character Demo, written by Juan Linietsky.

const WALK_ACCEL = 500.0
const WALK_DEACCEL = 500.0
const WALK_MAX_VELOCITY = 140.0
const AIR_ACCEL = 100.0
const AIR_DEACCEL = 100.0
const JUMP_VELOCITY = 380
const STOP_JUMP_FORCE = 450.0
const MAX_FLOOR_AIRBORNE_TIME = 0.15




var anim = ""
var siding_left = false
var jumping = false
var walking = false
var idle = true
var stopping_jump = false

var right = true
var left = false

var move_left = Input.is_action_just_pressed("move_left")
var move_right = Input.is_action_just_pressed("move_right")
var jump = Input.is_action_just_pressed("jump")

var floor_h_velocity = 0.0

var airborne_time = 1e20

onready var sound_jump = $SoundJump
onready var sprite = $Sprite
onready var animation_player = $AnimatedSprite


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	change_animation()
	
func change_animation():
	if jumping:
		if right:
			$AnimatedSprite.play("Jump")
		if left:
			$AnimatedSprite.play("JumpLeft")
	elif walking:
		if right:
			$AnimatedSprite.play("Walk")
		elif left:					
			$AnimatedSprite.play("Walk")
	elif idle:
		if right:
			$AnimatedSprite.play("Idle")
		elif left:
			$AnimatedSprite.play("IdleLeft")
	else:
		$AnimatedSprite.play("Idle")
	
func setJumping():
	jumping = true
	idle = false
	walking = false
	
func setWalking():
	walking = true
	jumping = false
	idle = false
	
func setIdle():
	idle = true
	jumping = false
	walking = false
	
	
func pull_for_input():
	if Input.is_action_just_pressed("move_left"):
		setWalking()
		$AnimatedSprite.flip_h = true			
		move_left = true
		left = true
		right = false
	if Input.is_action_just_released("move_left"):
		setIdle()
		move_left = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x -= WALK_DEACCEL
		
	if Input.is_action_just_pressed("move_right"):
		setWalking()
		$AnimatedSprite.flip_h = false
		move_right = true
		right = true
		left = false
	if Input.is_action_just_released("move_right"):
		setIdle()
		move_right = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x -= WALK_DEACCEL
	
	jump = Input.is_action_just_pressed("jump")
	
func set_movement():
	var x = 0
	var y = 0	
	
	if move_left:
		x = -WALK_ACCEL
	elif move_right:
		x = WALK_ACCEL
	if jump:
			y = JUMP_VELOCITY
	applied_force += Vector2(x, y)
	if linear_velocity.x > WALK_MAX_VELOCITY:
		linear_velocity.x = WALK_MAX_VELOCITY
	if linear_velocity.x < -WALK_MAX_VELOCITY:
		linear_velocity.x = -WALK_MAX_VELOCITY
		
func _integrate_forces(s):
		
	pull_for_input()
	set_movement()
	
	

