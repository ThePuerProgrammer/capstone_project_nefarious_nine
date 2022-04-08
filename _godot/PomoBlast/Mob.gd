extends RigidBody2D

signal enemy_died(pos,choice)
signal enemy_ded()

export var min_speed = 100 # Minimum speed range.
export var max_speed = 300  # Maximum speed range.
var rng = RandomNumberGenerator.new()
var answerChoices = ["A","B","C","D"]
# Called when the node enters the scene tree for the first time.
var my_random_number
func _ready():
	
	
	rng.randomize()
	my_random_number = rng.randi_range(0, 3)
	$Label.text = "%s" % answerChoices[my_random_number]
	var mob_types = $AnimatedSprite.frames.get_animation_names()
	$AnimatedSprite.animation = mob_types[randi() % mob_types.size()]
	 # Replace with function body.

func _on_VisibilityNotifier2D_screen_exited():
	queue_free()


func _on_Area2D_area_entered(area):
	if area.is_in_group("bullet"):
		emit_signal("enemy_died",position,answerChoices[my_random_number])
		emit_signal("enemy_ded")
		area.queue_free()
		print("++++++++++++++++++++++++++++++++++++++ bullet has hit asteroid and been freed from queue")
		queue_free()

	



