extends Node2D



var questionLabel


# Called when the node enters the scene tree for the first time.
func _ready():
	questionLabel = get_node("Label")
	
	#questionLabel.set_text(str(questionText))


#func setQuestionText(question):
	#questionLabel.text = question

#func getQuestionText():
#	return questionLabel.text
	
func _on_Fruit1_area_entered(area):
	pass # Replace with function body.
