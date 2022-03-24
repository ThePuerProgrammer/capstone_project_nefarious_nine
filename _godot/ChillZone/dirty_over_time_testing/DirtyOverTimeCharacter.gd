extends Node2D


# Declare member variables here. Examples:
# var a = 2
# var b = "text"


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if Input.is_action_pressed("pomo_blast_dash"):
		flash()


func flash():
	$Sprite.material.set_shader_param("flash_modifier", 1)
	$Sprite/FlashTimer.start()

func _on_FlashTimer_timeout():
	$Sprite.material.set_shader_param("flash_modifier", 0)
