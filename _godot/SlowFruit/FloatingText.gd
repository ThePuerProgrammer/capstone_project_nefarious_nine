extends Position2D
#floatingtext

#onready var answerLabel = get_node("Answer/RichTextLabel")
#onready var answer = get_node("Answer")
#onready var tween = get_node("Answer/Tween")
#var answerText = "Here's an Answer!!"
#var answersArray
#onready var questionLabel = get_node("Question/Label")
#var questionText = "here's a question"



# Called when the node enters the scene tree for the first time.
func _ready():
	pass
	#answerLabel.set_text(str(answerText))
	#questionLabel.set_text(str(questionText))

	#tween.interpolate_property(answer, 'scale', scale, Vector2(1,1), 0.2, Tween.TRANS_LINEAR, Tween.EASE_OUT)
	#tween.interpolate_property(answer, 'scale', Vector2(1,1), Vector2(0.01,0.01), 3, Tween.TRANS_LINEAR, Tween.EASE_OUT, 7)
	#tween.start()
