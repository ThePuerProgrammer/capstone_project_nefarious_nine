extends Control

var scene_path_to_load

# Called when the node enters the scene tree for the first time.
func _ready():
	#$MenuContainer/MenuButtons/SingleplayerButton.grab_focus()
	for button in $MenuContainer/MenuButtons.get_children():
		button.connect("pressed", self, "_on_Button_pressed", [button.scene_to_load])
	$FadeIn.show()
	$FadeIn.fade_in()

func _on_Button_pressed(scene_to_load):
	scene_path_to_load = scene_to_load
	$FadeOut.show()
	$FadeOut.fade_out()

func _on_FadeOut_fade_out_finished():
	get_tree().change_scene(scene_path_to_load)

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()
