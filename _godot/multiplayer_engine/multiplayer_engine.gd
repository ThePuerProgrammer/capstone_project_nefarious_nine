extends Node

onready var maxPlayersOptionButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton")
onready var selectClassroomsButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/SelectClassroomOptionsButton")

const collections : Dictionary = {
	'lobbies' : 'lobbies',
}

var classrooms : Dictionary = {}

func _ready():
	# Max players drop down button items. Disable non numeric
	maxPlayersOptionButton.add_item("Select Max")
	maxPlayersOptionButton.add_item("2")
	maxPlayersOptionButton.add_item("3")
	maxPlayersOptionButton.add_item("4")
	maxPlayersOptionButton.set_item_disabled(0, true)
	
	# Parse the current user for their classrooms field
	var fields = CurrentUser.userDoc.doc_fields
	var myClassrooms = fields["myClassrooms"]
	
	# Get all the classroom docs from the classrooms that the user belongs to
	for classroom in myClassrooms:
		var collection : FirestoreCollection = Firebase.Firestore.collection('classrooms')
		var document_task : FirestoreTask = collection.get(classroom)
		var document : FirestoreDocument = yield(document_task, "get_document")
		classrooms[classroom] = document.doc_fields["name"]

	# This label will be disabled
	selectClassroomsButton.add_item("Select a Classroom")
	
	# Add all the users classrooms to the dropdown
	for classroom in classrooms.values():
		selectClassroomsButton.add_item(classroom)
	
	# Disable label
	selectClassroomsButton.set_item_disabled(0, true)
	
func _on_Back_To_Main_Menu_Button_pressed():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")

func _createLobby():
	get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true

func _offer_created(type, data, id):
	pass
	
func _new_ice_candidate(mid_name, index_name, sdp_name, id):
	pass
