extends KinematicBody2D

onready var player2 = get_parent().get_node("Player2")
export var move_speed = 300.0
var player = true

func _ready():
	pass

func _physics_process(_delta):
	process_movement()
	process_animation()
	set_z()

func process_movement():
	var horizontal 	= Input.get_axis("ui_left", "ui_right")
	var vertical   	= Input.get_axis("ui_up", "ui_down")
	var velocity	= Vector2()
	velocity.x += horizontal
	velocity.y += vertical
	velocity *= move_speed
	var _v = move_and_slide(velocity)

func process_animation():
	pass

func set_z():
	if player2.position.y < self.position.y:
		z_index = 2
	else:
		z_index = 1
