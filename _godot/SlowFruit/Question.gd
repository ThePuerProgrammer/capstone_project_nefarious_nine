extends Node2D


onready var questionLabel = get_node("Label")
var questionText = "Here's a question"


# Called when the node enters the scene tree for the first time.
func _ready():
	questionLabel.set_text(str(questionText))


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass
