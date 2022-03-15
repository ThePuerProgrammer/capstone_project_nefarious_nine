extends Node2D

var _h
var _v

onready var pause_movement = false

func _ready():
	_h = int(global_position.x)
	_v = int(global_position.y)

func _process(_delta):
	if pause_movement:
		if $AnimatedSprite.animation == "down":
			$AnimatedSprite.animation = "stationary_down"
		elif $AnimatedSprite.animation == "up":
			$AnimatedSprite.animation = "stationary_up"
		elif $AnimatedSprite.animation == "side":
			$AnimatedSprite.animation = "stationary_side"
		return
	
	if _v < int(global_position.y - 0.1) && $AnimatedSprite.animation != "down":
		$AnimatedSprite.animation = "down"
	elif _v > int(global_position.y + 0.1) && $AnimatedSprite.animation != "up":
		$AnimatedSprite.animation = "up"
	elif _h < int(global_position.x - 0.1) && ($AnimatedSprite.flip_h or $AnimatedSprite.animation != "side"):
		$AnimatedSprite.flip_h = false
		$AnimatedSprite.animation = "side"
	elif _h > int(global_position.x + 0.1) && (not $AnimatedSprite.flip_h or $AnimatedSprite.animation != "side"):
		$AnimatedSprite.flip_h = true
		$AnimatedSprite.animation = "side"
		
	_h = int(global_position.x)
	_v = int(global_position.y)
