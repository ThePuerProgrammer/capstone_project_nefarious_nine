extends RigidBody2D

signal enemy_died(pos)
signal enemy_ded()

export var min_speed = 100 # Minimum speed range.
export var max_speed = 300  # Maximum speed range.


# Called when the node enters the scene tree for the first time.
func _ready():
	
	
	var mob_types = $AnimatedSprite.frames.get_animation_names()
	$AnimatedSprite.animation = mob_types[randi() % mob_types.size()]
	 # Replace with function body.

func _on_VisibilityNotifier2D_screen_exited():
	queue_free()


func _on_Area2D_area_entered(area):
	if area.is_in_group("bullet"):
		emit_signal("enemy_died",position)
		emit_signal("enemy_ded")
		self.queue_free()

	



