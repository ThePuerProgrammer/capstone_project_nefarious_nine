extends Node

onready var maxPlayersOptionButton = get_node("Centered/Tab_Container/Create_Lobby/Lobby_Settings/Max_Players_Option_Button")

func _ready():
	maxPlayersOptionButton.add_item("Select Max")
	maxPlayersOptionButton.add_item("1")
	maxPlayersOptionButton.add_item("2")
	maxPlayersOptionButton.add_item("3")
	maxPlayersOptionButton.add_item("4")
	maxPlayersOptionButton.set_item_disabled(0, true)	


func _on_Back_To_Main_Menu_Button_pressed():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")
