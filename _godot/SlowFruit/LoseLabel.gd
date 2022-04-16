extends Position2D


onready var LoseLabel = get_node("LoseLabel")
#onready var answer = get_node("Answer")
onready var tween = get_node("Tween")


# Called when the node enters the scene tree for the first time.
func _ready():
	pass
	#loseTween()
	



func loseTween():
	tween.interpolate_property(self, 'scale', scale, Vector2(1,1), 0.2, Tween.TRANS_LINEAR, Tween.EASE_OUT)
	tween.interpolate_property(self, 'scale', Vector2(1,1), Vector2(0.001,0.001), 2, Tween.TRANS_ELASTIC, Tween.EASE_IN_OUT, 5)
	tween.start()
