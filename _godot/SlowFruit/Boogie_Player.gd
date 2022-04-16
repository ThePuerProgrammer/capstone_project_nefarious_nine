extends RigidBody2D

# reference: https://github.com/godotengine/godot-demo-projects/blob/3.4-585455e/2d/physics_platformer/player/player.gd
#Character Demo, written by Juan Linietsky.
#reference for animations: https://www.youtube.com/watch?v=0bq2OIjHxk4

const WALK_ACCEL = 650.0
const WALK_DEACCEL = 650.0
const WALK_MAX_VELOCITY = 140.0
const AIR_ACCEL = 900.0
const AIR_DEACCEL = 1100.0
const JUMP_VELOCITY = 780
const STOP_JUMP_FORCE = 550.0
const MAX_FLOOR_AIRBORNE_TIME = 0.15


var state_machine

var anim = ""
var siding_left = false
var jumping = false
var walking = false
var idle = true
var stopping_jump = false

onready var found_floor = get_node("../TileMap").get_found_floor()


var walk_sound_has_played = false;
var jump_sound_has_played = false;

var g_delta = 0.01
var w_delta = 0.05

onready var walkSound = $WalkSound
onready var pickupSound = $PickupSound
onready var jumpSound = $JumpSound


var right = true
var left = false

var move_left = Input.is_action_just_pressed("move_left")
var move_right = Input.is_action_just_pressed("move_right")
var jump = Input.is_action_just_pressed("jump")


# Called when the node enters the scene tree for the first time.
func _ready():
	MenuMusic.get_child(0).stop()
	state_machine = $AnimationTree.get("parameters/playback")
	


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	check_floor()
	checkWalking()
	
func check_floor():
	found_floor = get_node("../TileMap").get_found_floor()	
	if found_floor:
		gravity_scale = 6
		jumping = false	
		if walking:
			setWalking()
		elif !walking:
			setIdle()	
	if !found_floor:
		stopWalkSound()
		add_gravity()
		setJumping()
		

func setJumping():
	state_machine.travel("Jump") # Animations are capitalized
	jumping = true
	idle = false
	walking = false
	stopWalkSound()
	add_gravity()
	
	
func setWalking():
	state_machine.travel("Run") 
	walking = true
	jumping = false
	idle = false
	
func setIdle():
	state_machine.travel("Idle2")
	idle = true
	jumping = false
	walking = false
	stopWalkSound()
	
func add_gravity():
	if linear_velocity.y !=0 && linear_velocity.y > -780 && linear_velocity.y < 62:
			gravity_scale += g_delta
	
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
		
func checkWalking():
	if !walking:
		stopWalkSound()
		
func pull_for_input():
	var current = state_machine.get_current_node()
	if Input.is_action_just_pressed("move_left"):
		move_left = true
		left = true
		right = false
		$Sprite.flip_h = true
		#check_floor()
		if !jumping && found_floor:
			setWalking()
			playWalkSound()
		elif !found_floor:
			stopWalkSound()
		#
		#$AnimatedSprite.flip_h = true
		
		
	if Input.is_action_just_released("move_left"):
		move_left = false
		stopWalkSound()
		if !jumping && found_floor:
			setIdle()		
		applied_force = Vector2(0, applied_force.y)
		linear_velocity.x = -WALK_DEACCEL
		
	if Input.is_action_just_pressed("move_right"):	
		move_right = true
		right = true
		left = false
		$Sprite.flip_h = false
		#check_floor()
		if !jumping && found_floor:
			setWalking()
			playWalkSound()
		elif !found_floor:
			stopWalkSound()
		#$AnimatedSprite.flip_h = false
		
		
	if Input.is_action_just_released("move_right"):		
		move_right = false
		stopWalkSound()
		if !jumping && found_floor:
			setIdle()				
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
		if !walking && found_floor:
			setIdle()
		elif walking && found_floor:
			setWalking()		
		stopJumpSound()				
		applied_force = Vector2(applied_force.y, 0)
		linear_velocity.y = STOP_JUMP_FORCE
		
	if linear_velocity.x == 0 && linear_velocity.y == 0:
		state_machine.travel("Idle2")
		
	if !found_floor:
		state_machine.travel("Jump")
		
	if found_floor && linear_velocity.x > 0:
		state_machine.travel("Run")
		
		
	
func set_movement():
	var x = 0
	var y = 0	
	
	if move_left:
		#heck_floor() 
		x = -WALK_ACCEL
		x -= WALK_ACCEL * w_delta
	elif move_right:
		#check_floor()
		x = WALK_ACCEL
		x += WALK_ACCEL * w_delta
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
		
func _integrate_forces(_s):
	pull_for_input()
	set_movement()

func _on_JumpSound_finished():
	stopJumpSound()

