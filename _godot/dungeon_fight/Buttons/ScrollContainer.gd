extends ScrollContainer

signal answer_selected_scroll

export (StyleBox) var normalStyleBox
export (StyleBox) var hoveredStyleBox
var withinButtonArea = false
var _panelContainer

func _ready():
	_panelContainer = get_node("../../../AnswerPanelContainer")
	pass

func _on_ScrollContainer_mouse_entered():
	withinButtonArea = true
	#_panelContainer.add_stylebox_override("normal", hoveredStyleBox)
	

func _on_ScrollContainer_mouse_exited():
	withinButtonArea = false
	#_panelContainer.add_stylebox_override("normal", normalStyleBox)

func _on_ScrollContainer_gui_input(event):
	if event is InputEventMouseButton:
		if event.is_action_pressed("left_mouse_click"):
			print("Panel Clicked")
			emit_signal("answer_selected_scroll")
