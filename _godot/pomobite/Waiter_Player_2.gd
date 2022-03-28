extends KinematicBody2D

onready var player2 = get_parent().get_node("Player2")
export var move_speed = 300.0
var player = true
var horizontal = 0
var vertical = 0
var moving_down = true
var moving_sideways = false
var last_pressed_key = Vector2.DOWN

var player_is_controlled = false

var u = "ui_up"
var d = "ui_down"
var l = "ui_left"
var r = "ui_right"

func _ready():
	pass

func _physics_process(_delta):
	if player_is_controlled:
		process_movement()
		process_animation()
		set_z()

func process_movement():
	if Input.is_action_just_pressed(u) or Input.is_action_just_pressed(d):
		last_pressed_key = Vector2.DOWN
	if Input.is_action_just_pressed(l) or Input.is_action_just_pressed(r):
		last_pressed_key = Vector2.LEFT
	if (Input.is_action_just_released(d) or Input.is_action_just_released(u))\
		and (Input.get_axis(l, r) != 0):
		last_pressed_key = Vector2.LEFT
	if (Input.is_action_just_released(l) or Input.is_action_just_released(r))\
		and (Input.get_axis(u, d) != 0):
		last_pressed_key = Vector2.DOWN
	
	horizontal = Input.get_axis("ui_left", "ui_right") if last_pressed_key == Vector2.LEFT else 0.0
	vertical = Input.get_axis("ui_up", "ui_down") if last_pressed_key == Vector2.DOWN else 0.0

	var vel	= Vector2()
	vel.x += horizontal
	vel.y += vertical
	vel *= move_speed
	var _v = move_and_slide(vel)

func process_animation():
	if vertical < 0:
		$AnimatedSprite.animation = "up"
		moving_down = false
		moving_sideways = false
	elif vertical > 0:
		$AnimatedSprite.animation = "down"
		moving_down = true
		moving_sideways = false
	elif !moving_down && !moving_sideways:
		$AnimatedSprite.animation = "stationary_up"
	elif !moving_sideways:
		$AnimatedSprite.animation = "stationary_down"
		
	if horizontal < 0:
		$AnimatedSprite.flip_h = true
		$AnimatedSprite.animation = "side"
		moving_sideways = true
		moving_down = false
	elif horizontal > 0:
		$AnimatedSprite.flip_h = false
		$AnimatedSprite.animation = "side"
		moving_sideways = true
		moving_down = false
	elif !moving_down && moving_sideways:
		$AnimatedSprite.animation = "stationary_side"
	
func set_z():
	if player2.position.y < self.position.y:
		z_index = 2
	else:
		z_index = 1
