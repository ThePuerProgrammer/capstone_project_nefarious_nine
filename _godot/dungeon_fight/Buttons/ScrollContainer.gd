extends ScrollContainer

signal answer_selected_scroll

export (StyleBox) var normalStyleBox
export (StyleBox) var hoveredStyleBox
var withinButtonArea = false
var panelContainer

func _ready():
	panelContainer = get_node("../../../AnswerPanelContainer")

func _on_ScrollContainer_mouse_entered():
	withinButtonArea = true
	

func _on_ScrollContainer_mouse_exited():
	withinButtonArea = false

func _on_ScrollContainer_gui_input(event):
	if event is InputEventMouseButton:
		if event.is_action_pressed("left_mouse_click"):
			print("Panel Clicked")
			emit_signal("answer_selected_scroll")
