extends Label

var score = 0
# Declare member variables here. Examples:
# var a = 2
# var b = "text"


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.

func _on_enemy_ded():
	score += 1
	text = "Score: %s" % score
# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass
