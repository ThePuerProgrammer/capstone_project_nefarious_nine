extends Node

onready var maxPlayersOptionButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton")

const collections : Dictionary = {
	'lobbies' : 'lobbies',
}

var rtc_mp: WebRTCMultiplayer = WebRTCMultiplayer.new()

func _ready():
	maxPlayersOptionButton.add_item("Select Max")
	maxPlayersOptionButton.add_item("2")
	maxPlayersOptionButton.add_item("3")
	maxPlayersOptionButton.add_item("4")
	maxPlayersOptionButton.set_item_disabled(0, true)

func _on_Back_To_Main_Menu_Button_pressed():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")

func _createLobby():
	get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true
	var lobbiesCollection : FirestoreCollection = Firebase.Firestore.collection(collections.lobbies)

func _offer_created(type, data, id):
	pass
	
func _new_ice_candidate(mid_name, index_name, sdp_name, id):
	pass
