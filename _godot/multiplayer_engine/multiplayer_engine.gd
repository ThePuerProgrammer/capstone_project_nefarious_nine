extends Node

onready var maxPlayersOptionButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton")
onready var selectClassroomsButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/SelectClassroomOptionsButton")
onready var lobbies_vbox = get_node("Centered/TabContainer/JoinLobby/ServerListBG/ScrollContainer/LobbiesVBox")

const collections : Dictionary = {
	'lobbies' : 'lobbies',
}

var classrooms
var classrooms_docid_to_name_dict : Dictionary = {}

var decks

var lobbies = []
var selected_lobby

func _ready():
	# Max players drop down button items. Disable non numeric
	maxPlayersOptionButton.add_item("Select Max")
	maxPlayersOptionButton.add_item("2")
	maxPlayersOptionButton.add_item("3")
	maxPlayersOptionButton.add_item("4")
	maxPlayersOptionButton.set_item_disabled(0, true)
	
	# Query for classrooms that the current user is a member of
	classrooms = FirebaseController.get_classrooms_where_user_is_member(CurrentUser.user_email)
	
	# Firebase queries will yield back to the caller, so this conditional statement ensures we only 
	# continue once classrooms has gotten data back from the FirebaseController function
	if classrooms is GDScriptFunctionState:
		classrooms = yield(classrooms, "completed")

	# Create a docid to name dictionary for selecting the classroom
	for classroom in classrooms:
		var fields = classroom["doc_fields"]
		classrooms_docid_to_name_dict[classroom["doc_name"]] = fields["name"]

	# This label will be disabled
	selectClassroomsButton.add_item("Select a Classroom")

	# Add all the users classrooms to the dropdown
	for classroom in classrooms_docid_to_name_dict.values():
		selectClassroomsButton.add_item(classroom)

	# Disable label
	selectClassroomsButton.set_item_disabled(0, true)
	
func _on_Back_To_Main_Menu_Button_pressed():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")

func _createLobby():
	get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true
	
	# Instantiate a new lobby button scene
	var new_lobby = load('res://multiplayer_engine/Lobby_Selection.tscn').instance()
	lobbies.append(new_lobby)
	
	# Connect its signals	
	new_lobby.connect('lobby_button_pressed', self, '_on_lobby_selection')
	
	# Describe the lobby
	new_lobby.lobby_number = lobbies.size() - 1
	new_lobby.get_node('HBoxContainer/HostNameLabel').text = 'poop'
	
	# Add it to the scene
	lobbies_vbox.add_child(new_lobby)

func _on_lobby_selection(lobby_number):
	selected_lobby = lobby_number

func _on_classroom_selected(index):
	# Once the user selects a classroom, query for the classroom decks
	pass

func _on_RefreshButton_pressed():
	pass # Replace with function body.
