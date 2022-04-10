extends RigidBody2D

# Character Demo, written by Juan Linietsky.

const WALK_ACCEL = 650.0
const WALK_DEACCEL = 650.0
const WALK_MAX_VELOCITY = 140.0
const AIR_ACCEL = 900.0
const AIR_DEACCEL = 1100.0
const JUMP_VELOCITY = 780
const STOP_JUMP_FORCE = 550.0
const MAX_FLOOR_AIRBORNE_TIME = 0.15


var anim = ""
var siding_left = false
var jumping = false
var walking = false
var idle = true
var stopping_jump = false

onready var found_floor = get_node("../TileMap").get_found_floor()


var walk_sound_has_played = false;
var jump_sound_has_played = false;

onready var walkSound = $WalkSound
onready var pickupSound = $PickupSound
onready var jumpSound = $JumpSound


var right = true
var left = false

var move_left = Input.is_action_just_pressed("move_left")
var move_right = Input.is_action_just_pressed("move_right")
var jump = Input.is_action_just_pressed("jump")

var floor_h_velocity = 0.0

var airborne_time = 1e20


# Called when the node enters the scene tree for the first time.
func _ready():
	MenuMusic.get_child(0).stop()
	


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	check_floor()
	change_animation()
	
func change_animation():
	if jumping:
		$AnimatedSprite.play("Jump")		
	elif walking:		
		$AnimatedSprite.play("Walk")
	elif idle:		
		$AnimatedSprite.play("Idle")		
	else:
		$AnimatedSprite.play("Idle")
	
func check_floor():
	found_floor = get_node("../TileMap").get_found_floor()
	print(found_floor)
	if found_floor:
		jumping = false	
		if walking:
			setWalking()
		else:
			setIdle()	
	if !found_floor:
		setJumping()
		stopWalkSound()

func setJumping():
	jumping = true
	idle = false
	walking = false
	stopWalkSound()
	
func setWalking():
	walking = true
	jumping = false
	idle = false
	
func setIdle():
	idle = true
	jumping = false
	walking = false
	stopWalkSound()
	
func if_right_in_air():
	if right :
		if linear_velocity.x > -WALK_MAX_VELOCITY:
			linear_velocity.x -= -AIR_ACCEL
		
func if_left_in_air():
	if left:
		if linear_velocity.x < WALK_MAX_VELOCITY:
			linear_velocity.x += AIR_ACCEL
			
		
func playJumpSound():
	if !jump_sound_has_played:
		jump_sound_has_played = true
		jumpSound.play()
		
func stopJumpSound():
	if jump_sound_has_played:
		jump_sound_has_played = false
		jumpSound.stop()
		
func playWalkSound():
	if !walk_sound_has_played:
		walk_sound_has_played = true
		walkSound.play()
		
func stopWalkSound():
	if walk_sound_has_played:
		walk_sound_has_played = false
		walkSound.stop()
		
	
func pull_for_input():
	if Input.is_action_just_pressed("move_left"):		
		check_floor()
		if !jumping && found_floor:
			setWalking()
			playWalkSound()
		elif !found_floor:
			stopWalkSound()
		$AnimatedSprite.flip_h = true
		move_left = true
		left = true
		right = false
		
	if Input.is_action_just_released("move_left"):
		stopWalkSound()
		if !jumping && found_floor:
			setIdle()
		move_left = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x = -WALK_DEACCEL
		
	if Input.is_action_just_pressed("move_right"):		
		check_floor()
		if !jumping && found_floor:
			setWalking()
			playWalkSound()
		elif !found_floor:
			stopWalkSound()
		$AnimatedSprite.flip_h = false
		move_right = true
		right = true
		left = false
		
	if Input.is_action_just_released("move_right"):
		stopWalkSound()
		if !jumping && found_floor:			
			setIdle()		
		move_right = false
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x = WALK_DEACCEL
	
	if Input.is_action_just_pressed("jump"):
		stopWalkSound()
		if linear_velocity.y <= 0 && found_floor && !jumping:
			setJumping()
			stopping_jump = false
			linear_velocity.y = -JUMP_VELOCITY
			applied_force = Vector2(applied_force.y, 0)
			playJumpSound()
		
	if Input.is_action_just_released("jump"):
		stopWalkSound()
		stopping_jump = true
		if !walking:
			setIdle()
		elif walking:
			setWalking()		
		stopJumpSound()				
		applied_force = Vector2(applied_force.y, 0)
		linear_velocity.y += STOP_JUMP_FORCE
		
		
	
func set_movement():
	var x = 0
	var y = 0	
	
	if move_left:
		#heck_floor() 
		x = -WALK_ACCEL
	elif move_right:
		#check_floor()
		x = WALK_ACCEL
	if jump:
		#check_floor()
		y -= AIR_ACCEL
		
	applied_force += Vector2(x, y)
	if linear_velocity.x > WALK_MAX_VELOCITY:
		linear_velocity.x = WALK_MAX_VELOCITY
	if linear_velocity.x < -WALK_MAX_VELOCITY:
		linear_velocity.x = -WALK_MAX_VELOCITY
		
	if linear_velocity.y > JUMP_VELOCITY:
		stopping_jump = true
		linear_velocity.y += STOP_JUMP_FORCE
	if linear_velocity.y < -JUMP_VELOCITY:
		linear_velocity.y = -JUMP_VELOCITY
		
func _integrate_forces(s):
	pull_for_input()
	set_movement()

func _on_JumpSound_finished():
	stopJumpSound()

