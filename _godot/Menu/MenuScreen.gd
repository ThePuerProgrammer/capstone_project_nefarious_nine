extends Control

var _scene_path_to_load

onready var player = get_node("/root/MenuMusic/AudioStreamPlayer")
onready var auth = get_node("MenuContainer/Authenticate_User")
onready var music_on = true

# Called when the node enters the scene tree for the first time.
func _ready():
	#$MenuContainer/MenuButtons/SingleplayerButton.grab_focus()
	for button in $MenuContainer/MenuButtons.get_children():
		button.connect("pressed", self, "_on_Button_pressed", [button.scene_to_load])
	
	# Hide buttons for auth only upon first sign in
	if not CurrentUser.user_is_authenticated:
		get_node("MenuContainer/MenuButtons").visible = false
		auth.connect("success_banner_timeout", self, "_on_signin")
	else:
		get_node("MenuContainer/MenuButtons").visible = true
		get_node("MenuContainer").remove_child(auth)
		
	$FadeIn.show()
	$FadeIn.fade_in()
	$MusicStartTimer.start()

func _on_signin():
	# Get rid of auth modal and show buttons
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


func _on_SoundOffButton_pressed():
	if music_on:
		music_on = false
		player.volume_db = -80
	else:
		music_on = true
		player.volume_db = -15
