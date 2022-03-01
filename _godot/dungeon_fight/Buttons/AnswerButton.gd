extends PanelContainer

signal answer_selected

var _answerLabel

# Called when the node enters the scene tree for the first time.
func _ready():
	_answerLabel = get_node("MarginContainer/ScrollContainer/answerLabel")


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass

func set_answer_text(newText):
	_answerLabel.text = newText
	
func get_answer_text():
	return _answerLabel.text


func _on_ScrollContainer_answer_selected_scroll():
	emit_signal("answer_selected", get_answer_text())
