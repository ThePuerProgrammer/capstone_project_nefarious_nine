extends Node

func _ready():
	var is_server : bool = ProjectSettings.get_setting("DefaultProjectBehavior/isServer")
	if is_server:
		get_tree().change_scene("res://multiplayer_engine/WS_Signaling_Server.tscn")
	else:
		get_tree().change_scene("res://Menu/MenuScreen.tscn")
