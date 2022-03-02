extends PanelContainer

signal answer_selected

var _answerLabel

# Called when the node enters the scene tree for the first time.
func _ready():
	_answerLabel = get_node("MarginContainer/ScrollContainer/answerLabel")

func setAnswerText(newText):
	_answerLabel.text = newText
	
func getAnswerText():
	return _answerLabel.text

func _on_ScrollContainer_answer_selected_scroll():
	print("test")
	emit_signal("answer_selected", getAnswerText())
