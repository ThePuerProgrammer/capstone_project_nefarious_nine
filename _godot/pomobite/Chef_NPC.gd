extends Node2D

onready var pos = Vector2(0.0, 0.0)
var frame_count = 0
var animation_switch = false

func _ready():
	pass # Replace with function body.

func _process(_delta):
	frame_count += 1
	if pos.y < global_position.y - 3 && !animation_switch:
		$AnimatedSprite.animation = "down"
		animation_switch = true
	else:
		$AnimatedSprite.animation = "stationary_down"
		
	if frame_count == 25:
		pos = global_position
		frame_count = 0
