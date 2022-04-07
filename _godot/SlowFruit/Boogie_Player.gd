extends RigidBody2D

# Character Demo, written by Juan Linietsky.

const WALK_ACCEL = 650.0
const WALK_DEACCEL = 650.0
const WALK_MAX_VELOCITY = 140.0
const AIR_ACCEL = 900.0
const AIR_DEACCEL = 1100.0
const JUMP_VELOCITY = 780
const STOP_JUMP_FORCE = 850.0
const MAX_FLOOR_AIRBORNE_TIME = 0.15


var anim = ""
var siding_left = false
var jumping = false
var walking = false
var idle = true
var stopping_jump = false
var found_floor = true

var right = true
var left = false

var move_left = Input.is_action_just_pressed("move_left")
var move_right = Input.is_action_just_pressed("move_right")
var jump = Input.is_action_just_pressed("jump")

var floor_h_velocity = 0.0

var airborne_time = 1e20

#onready var sound_jump = $SoundJump
#onready var sprite = $Sprite
onready var animation_player = $AnimatedSprite
#onready var ground_ray = get_node("ground_ray")


# Called when the node enters the scene tree for the first time.
func _ready():
	MenuMusic.get_child(0).stop()


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	change_animation()
	#is_hitting_obstacle()
	#is_grounded = ground_ray.is_colliding()
	#drop_like_a_rock()
	
	
func change_animation():
	if jumping:
		$AnimatedSprite.play("Jump")		
	elif walking:		
		$AnimatedSprite.play("Walk")
	elif idle:		
		$AnimatedSprite.play("Idle")		
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
	
func if_right_in_air():
	if right:
		if linear_velocity.x > -WALK_MAX_VELOCITY:
			linear_velocity.x -= -AIR_ACCEL
		
func if_left_in_air():
	if left:
		if linear_velocity.x < WALK_MAX_VELOCITY:
			linear_velocity.x += AIR_ACCEL
			
func is_found_floor():
	if linear_velocity.y < 10 && jump == false:
		found_floor = true
		setWalking()		
	else:
		found_floor = false
		setJumping()
		 
		
func is_hitting_obstacle():
	if !found_floor:
		if linear_velocity.y == 0 && linear_velocity.x == 0:
			linear_velocity.y += STOP_JUMP_FORCE
			
func drop_like_a_rock():
	if !found_floor && !jumping:
		linear_velocity.y += STOP_JUMP_FORCE
	
func pull_for_input():
	if Input.is_action_just_pressed("move_left"):
		
		if !jumping:
			setWalking()
		#if found_floor:
			#print("found floor")
		$AnimatedSprite.flip_h = true			
		move_left = true
		left = true
		right = false
	if Input.is_action_just_released("move_left"):
		
		if !jumping:
			setIdle()
		move_left = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x = -WALK_DEACCEL
		
	if Input.is_action_just_pressed("move_right"):		
		if !jumping:
			setWalking()
		$AnimatedSprite.flip_h = false
		move_right = true
		right = true
		left = false
	if Input.is_action_just_released("move_right"):
		if !jumping:
			setIdle()
		move_right = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x = WALK_DEACCEL
	
	if Input.is_action_just_pressed("jump"):
		if linear_velocity.y <= 0:	
			#if !found_floor:
			setJumping()
			stopping_jump = false
			applied_force = Vector2(applied_force.y, 0)
			linear_velocity.y = -JUMP_VELOCITY
		
	if Input.is_action_just_released("jump"):
		stopping_jump = true
		if found_floor:
			setIdle()
		applied_force = Vector2(applied_force.y, 0)
		linear_velocity.y = STOP_JUMP_FORCE
	
func set_movement():
	var x = 0
	var y = 0	
	
	if move_left:
		x = -WALK_ACCEL
	elif move_right:
		x = WALK_ACCEL
	if jump:
		y -= AIR_ACCEL
		
	applied_force += Vector2(x, y)
	if linear_velocity.x > WALK_MAX_VELOCITY:
		linear_velocity.x = WALK_MAX_VELOCITY
	if linear_velocity.x < -WALK_MAX_VELOCITY:
		linear_velocity.x = -WALK_MAX_VELOCITY
		
	if linear_velocity.y > JUMP_VELOCITY:
		stopping_jump = true
		linear_velocity.y -= STOP_JUMP_FORCE
	if linear_velocity.y < -JUMP_VELOCITY:
		linear_velocity.y = -JUMP_VELOCITY		
	
		
func _integrate_forces(s):
		
	pull_for_input()
	set_movement()
	
	

