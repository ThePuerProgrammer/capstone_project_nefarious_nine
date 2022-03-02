extends Node

func _ready():
	var is_server : bool = ProjectSettings.get_setting("DefaultProjectBehavior/isServer")
	if is_server:
		if get_tree().change_scene("res://multiplayer_engine/WS_Signaling_Server.tscn") != OK:
			print('Could not load server')
	else:
		if get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK:
			print('Could not start game with MenuScreen')
