extends Node

onready var maxPlayersOptionButton 		= $"Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton"
onready var selectClassroomsButton 		= $"Centered/TabContainer/CreateLobby/LobbySettings/SelectClassroomOptionsButton"
onready var lobbies_vbox 				= $"Centered/TabContainer/JoinLobby/ServerListBG/ScrollContainer/LobbiesVBox"
onready var lobby_password_line_edit 	= $"Centered/TabContainer/CreateLobby/LobbySettings/PasswordLineEdit"
onready var chat_enabled_checkbutton 	= $"Centered/TabContainer/CreateLobby/LobbySettings/ChatEnabledCheckbutton"
onready var vote_minigame_checkbutton 	= $"Centered/TabContainer/CreateLobby/LobbySettings/VoteNextMinigameCheckbutton"
onready var pword_input_line_edit 		= $'Centered/TabContainer/JoinLobby/JoinHBox/PwordInput'
onready var join_button 				= $'Centered/TabContainer/JoinLobby/JoinHBox/JoinButton'

var classrooms
var classrooms_docid_to_name_dict : Dictionary = {}

var decks

var available_lobbies = []
var lobby_docids = []
var selected_lobby = -1

onready var client_mgr = ClientMgr.new()

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

	# Disable lable
	selectClassroomsButton.set_item_disabled(0, true)
	
	# Ensure the lobbies are visible as soon as you visit the mp page
	_get_available_lobbies()
	
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
		var doc = FirebaseController.add_new_multiplayer_lobby(lobby_description)
		if doc is GDScriptFunctionState:
			doc = yield(doc, 'completed')
		print (doc)
		CurrentUser.peer_id = _generate_peer_id()
		if get_tree().change_scene("res://multiplayer_engine/Waiting_For_Players_Screen.tscn") != OK:
			print('Could not change to the waiting for players screen')
		
func _on_lobby_selection(lobby_number):
	selected_lobby = lobby_number

func _on_classroom_selected(_index):
	# Once the user selects a classroom, query for the classroom decks
	pass

func _on_RefreshButton_pressed():
	_get_available_lobbies()		

func _get_available_lobbies():
	# Remove existing lobby nodes so there aren't duplicates
	for available in available_lobbies:
		lobbies_vbox.remove_child(available)
		
	# Firebase find lobbies from classrooms you are a member of
	var lobbies = FirebaseController.get_multiplayer_lobbies(classrooms_docid_to_name_dict.values())
	
	# Ensure that the firebase function has returned a result before continuing
	if lobbies is GDScriptFunctionState:
		lobbies = yield(lobbies, "completed")
	
	# Parse the result and add the lobbies to our list
	for lobby in lobbies:
		var doc_fields = lobby['doc_fields']
		var new_lobby = load('res://multiplayer_engine/Lobby_Selection.tscn').instance()
		
		# TODO CHANGE WHEN USERNAME FIELD EXISTS
		# Extract the username from the email as the host
		var host : String = doc_fields['host']
		host = host.substr(0, host.find('@'))
		
		new_lobby.get_node('HBoxContainer/HostNameLabel').text = host
		new_lobby.get_node('HBoxContainer/PrivacyStatusLabel').text = 'Public' if doc_fields['password'] == '' else 'Private'
		new_lobby.password = doc_fields['password'] # We are going to need this info when joining
		new_lobby.get_node('HBoxContainer/ClassroomLabel').text = doc_fields['classroom']
		new_lobby.get_node('HBoxContainer/PlayerCountLabel').text = doc_fields['player_count']
		new_lobby.get_node('HBoxContainer/ChatEnabledLabel').text = 'Enabled' if doc_fields['chat_enabled'] else 'Disabled'
		
		# Connect the signal emitted from the button component of the Lobby Selection instance
		new_lobby.connect('lobby_button_pressed', self, '_on_lobby_button_pressed')		
		
		# We need a record of these
		available_lobbies.append(new_lobby)
		lobby_docids.append(lobby['doc_name'])
		
		# This number is used for indexing when joining
		new_lobby.lobby_number = available_lobbies.size() - 1
		
		# Present it to the list
		lobbies_vbox.add_child(new_lobby)

func _on_lobby_button_pressed(lobby_number):
	selected_lobby = lobby_number
	if available_lobbies[lobby_number].password == '':
		pword_input_line_edit.text = ''
		pword_input_line_edit.editable = false
	else:
		pword_input_line_edit.editable = true
	
	# Make sure only the selected has the highlighted background color
	for lobby in available_lobbies:
		if lobby.lobby_number != lobby_number:
			lobby.get_node('ColorRect').color = lobby.default_color


func _on_JoinButton_pressed():
	if available_lobbies[selected_lobby].password != pword_input_line_edit.text:
		get_node("Centered/IncorrectJoinPasswordAlert").popup()
	else:
		pword_input_line_edit.text = ''
		join_button.disabled = true
		
func _generate_peer_id():
	# A little idea I have to convert the users docid to an int for client/peer id
	# My concern has been that a combination of the uid to int could possibly land on the same number
	# This solution doesn't entirely eliminate that, but I think it makes it a lot less likely
	# Without, perhaps, some type of log that shows what ids are currently active, nothing really
	# could prevent overlap. But in this case, the uid is converted to an array of bytes
	# that array is summed together as int values. The original uid becomes the seed hash for an rng
	# along with the current unix time and the final value is the product of the rng and the int 
	# representation of the uid. It's not perfect, but it should do for now. 
	var uid : String = CurrentUser.user_id if CurrentUser.user_id else "87gs9f7438g12shigdjkhf"
	var pool_bytes = uid.to_ascii()
	var bytes_to_int = 0
	for byte in pool_bytes:
		bytes_to_int += int(byte)
	var rng = RandomNumberGenerator.new()
	rng.seed = hash(uid) + OS.get_unix_time()
	var random_number = rng.randi_range(1, 100000) 
	return random_number * bytes_to_int
