extends Position2D

onready var answerLabel = get_node("RichTextLabel")
#onready var answer = get_node("Answer")
onready var tween = get_node("Tween")
#var answerText = "Here's an Answer!"


# Called when the node enters the scene tree for the first time.
func _ready():
	answerTween()



func answerTween():
	tween.interpolate_property(self, 'scale', scale, Vector2(1,1), 0.5, Tween.TRANS_LINEAR, Tween.EASE_OUT)
	tween.interpolate_property(self, 'scale', Vector2(1,1), Vector2(0.01,0.01), 3, Tween.TRANS_ELASTIC, Tween.EASE_IN_OUT, 8)
	tween.start()
