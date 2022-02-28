extends Control

var _scene_path_to_load

onready var player = get_node("/root/MenuMusic/AudioStreamPlayer")
onready var auth = get_node("MenuContainer/Authenticate_User")

# Called when the node enters the scene tree for the first time.
func _ready():
	#$MenuContainer/MenuButtons/SingleplayerButton.grab_focus()
	for button in $MenuContainer/MenuButtons.get_children():
		button.connect("pressed", self, "_on_Button_pressed", [button.scene_to_load])
	get_node("MenuContainer/MenuButtons").visible = false
	auth.connect("success_banner_timeout", self, "_on_signin")
	$FadeIn.show()
	$FadeIn.fade_in()
	$MusicStartTimer.start()

func _on_signin():
	get_node("MenuContainer").remove_child(auth)
	get_node("MenuContainer/MenuButtons").visible = true

func _on_Button_pressed(scene_to_load):
	_scene_path_to_load = scene_to_load
	$FadeOut.show()
	$FadeOut.fade_out()

func _on_FadeOut_fade_out_finished():
	if (get_tree().change_scene(_scene_path_to_load) != OK):
		print("Failed to change scene")

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()


func _on_MusicStartTimer_timeout():
	if !player.playing:
		player.play()
