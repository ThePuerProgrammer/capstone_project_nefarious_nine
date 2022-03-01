extends Node

onready var maxPlayersOptionButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton")
onready var selectClassroomsButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/SelectClassroomOptionsButton")
onready var lobbies_vbox = get_node("Centered/TabContainer/JoinLobby/ServerListBG/ScrollContainer/LobbiesVBox")
onready var lobby_password_line_edit = get_node("Centered/TabContainer/CreateLobby/LobbySettings/PasswordLineEdit")
onready var chat_enabled_checkbutton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/ChatEnabledCheckbutton")
onready var vote_minigame_checkbutton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/VoteNextMinigameCheckbutton")

var classrooms
var classrooms_docid_to_name_dict : Dictionary = {}

var decks

var available_lobbies = []
var selected_lobby = -1

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
	if selectClassroomsButton.get_selected_id() == 0:
		get_node("Centered/NoClassroomSelectedAlert").popup()
	elif maxPlayersOptionButton.get_selected_id() == 0:
		get_node("Centered/NoMaxPlayersDefinedAlert").popup()
	else:
		get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true
		var lobby_description = {
			'host' : CurrentUser.user_email,
			'password' : lobby_password_line_edit.text,
			'classroom' : selectClassroomsButton.get_item_text(selectClassroomsButton.get_selected_id()),
			'player_count' : "1/" + maxPlayersOptionButton.get_item_text(maxPlayersOptionButton.get_selected_id()),
			'chat_enabled' : chat_enabled_checkbutton.pressed,
			'vote_enabled' : vote_minigame_checkbutton.pressed
		}
		FirebaseController.add_new_multiplayer_lobby(lobby_description)

func _on_lobby_selection(lobby_number):
	selected_lobby = lobby_number

func _on_classroom_selected(index):
	# Once the user selects a classroom, query for the classroom decks
	pass

func _on_RefreshButton_pressed():
	var lobbies = FirebaseController.get_multiplayer_lobbies(classrooms_docid_to_name_dict.values())
	if lobbies is GDScriptFunctionState:
		lobbies = yield(lobbies, "completed")
	for lobby in lobbies:
		var doc_fields = lobby['doc_fields']
		var new_lobby = load('res://multiplayer_engine/Lobby_Selection.tscn').instance()
		new_lobby.get_node('HBoxContainer/HostNameLabel').text = doc_fields['host']
		new_lobby.get_node('HBoxContainer/PrivacyStatusLabel').text = 'Public' if doc_fields['password'] == '' else 'Private'
		new_lobby.password = doc_fields['password']
		new_lobby.get_node('HBoxContainer/ClassroomLabel').text = doc_fields['classroom']
		new_lobby.get_node('HBoxContainer/PlayerCountLabel').text = doc_fields['player_count']
		new_lobby.get_node('HBoxContainer/ChatEnabledLabel').text = 'Enabled' if doc_fields['chat_enabled'] else 'Disabled'
		available_lobbies.append(new_lobby)
		new_lobby.lobby_number = available_lobbies.size() - 1
		get_node('Centered/TabContainer/JoinLobby/ServerListBG/ScrollContainer/LobbiesVBox').add_child(new_lobby)			
