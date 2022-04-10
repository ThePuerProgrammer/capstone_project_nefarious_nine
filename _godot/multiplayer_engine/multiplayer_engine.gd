extends Node

onready var maxPlayersOptionButton 		= $"Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton"
onready var selectClassroomsButton 		= $"Centered/TabContainer/CreateLobby/LobbySettings/SelectClassroomOptionsButton"
onready var lobbies_vbox 				= $"Centered/TabContainer/JoinLobby/ServerListBG/ScrollContainer/LobbiesVBox"
onready var lobby_password_line_edit 	= $"Centered/TabContainer/CreateLobby/LobbySettings/PasswordLineEdit"
onready var chat_enabled_checkbutton 	= $"Centered/TabContainer/CreateLobby/LobbySettings/ChatEnabledCheckbutton"
onready var vote_minigame_checkbutton 	= $"Centered/TabContainer/CreateLobby/LobbySettings/VoteNextMinigameCheckbutton"
onready var pword_input_line_edit 		= $'Centered/TabContainer/JoinLobby/JoinHBox/PwordInput'
onready var join_button 				= $'Centered/TabContainer/JoinLobby/JoinHBox/JoinButton'
onready var category_options_button		= $'Centered/TabContainer/CreateLobby/LobbySettings/SelectCategoryOptionsButton'

var classrooms
var classrooms_docid_to_name_dict : Dictionary = {}

var available_lobbies = []
var lobby_docids = []
var selected_lobby = -1

var categories = [
	'Misc', 'English', 'Math', 'History', 
	'Physics', 'Chemistry', 'Biology', 
	'Computer Science', 'Engineering', 'French', 'Japanese'
]

func _ready():
	$FadeIn.show()
	$FadeIn.fade_in()
	
	join_button.disabled = true
	
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
		print("Fields",fields)
		classrooms_docid_to_name_dict[classroom["doc_name"]] = fields["name"]
		print("ClassRoom_DIC:",classrooms_docid_to_name_dict[classroom["doc_name"]])

	# This label will be disabled
	selectClassroomsButton.add_item("Select a Classroom")

	# Add all the users classrooms to the dropdown
	for classroom in classrooms_docid_to_name_dict.values():
		selectClassroomsButton.add_item(classroom)
	
	# This label will be diabled	
	category_options_button.add_item("Filter by Category")
	
	# Add all the catergories to the dropdown
	for category in categories:
		category_options_button.add_item(category)

	# Disable options lables
	selectClassroomsButton.set_item_disabled(0, true)
	category_options_button.set_item_disabled(0, true)
	
	# Ensure the lobbies are visible as soon as you visit the mp page
	_get_available_lobbies()


# Returning to main menu ###################################################
func _on_Back_To_Main_Menu_Button_pressed():
	$FadeOut.show()
	$FadeOut.fade_out()

func _on_FadeOut_fade_out_finished():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")
	$FadeOut.hide()
############################################################################

func _on_FadeIn_fade_in_finished():
	$FadeIn.hide()

func _createLobby():
	if selectClassroomsButton.get_selected_id() == 0:
		get_node("Centered/NoClassroomSelectedAlert").popup()
	elif maxPlayersOptionButton.get_selected_id() == 0:
		get_node("Centered/NoMaxPlayersDefinedAlert").popup()
	else:
		get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true
		
		# Get the classroom_id of chosen classroom by iterating and comparing name values of the ids
		var classroom_id
		for cr in classrooms_docid_to_name_dict.keys():
			if classrooms_docid_to_name_dict[cr] == selectClassroomsButton.get_item_text(selectClassroomsButton.get_selected_id()):
				classroom_id = cr
		
		# Get the decks from this classroom
		var decks = FirebaseController.get_classroom_decks(classroom_id)
		if decks is GDScriptFunctionState:
			decks = yield(decks, "completed")
		
		# Parse the decks, selecting only those whose category matches the selection (if so)
		var parsed_decks = [] if category_options_button.get_selected_id() != 0 else decks
		if parsed_decks.size() == 0:
			for deck in decks:
				var fields = deck['doc_fields']
				if fields['category'] == category_options_button.get_item_text(category_options_button.get_selected_id()):
					parsed_decks.append(deck)
		
		var lobby_description = {
			'host' : CurrentUser.user_email,
			'password' : lobby_password_line_edit.text,
			'classroom' : selectClassroomsButton.get_item_text(selectClassroomsButton.get_selected_id()),
			'player_count' : "1/" + maxPlayersOptionButton.get_item_text(maxPlayersOptionButton.get_selected_id()),
			'chat_enabled' : chat_enabled_checkbutton.pressed,
			'vote_enabled' : vote_minigame_checkbutton.pressed
		}
		# Global goodness for easy access across nodes
		LobbyDescription.set_lobby_description(lobby_description)
		
		# Add the lobby to firebase and await its docid
		var doc = FirebaseController.add_new_multiplayer_lobby(lobby_description)
		if doc is GDScriptFunctionState:
			doc = yield(doc, 'completed')
			
		# Parse the doc for the docid
		var doc_name : String = doc['name']
		var index_of_last_fwd_slash = doc_name.find_last('/')
		var lobby_id = doc_name.substr(index_of_last_fwd_slash + 1, doc_name.length())
		LobbyDescription.set_lobby_id(lobby_id)
		
#		CurrentUser.peer_id = _generate_peer_id()
		if get_tree().change_scene("res://multiplayer_engine/Waiting_For_Players_Screen.tscn") != OK:
			print('Could not change to the waiting for players screen')
		
func _on_lobby_selection(lobby_number):
	selected_lobby = lobby_number
	join_button.disabled = false

func _on_classroom_selected(_index):
	# Once the user selects a classroom, query for the classroom decks
	pass

func _on_RefreshButton_pressed():
	_get_available_lobbies()
	join_button.disabled = true

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
		new_lobby.get_node('HBoxContainer/ClassroomLabel').text = doc_fields['classroom']
		new_lobby.get_node('HBoxContainer/PlayerCountLabel').text = doc_fields['player_count']
		new_lobby.get_node('HBoxContainer/ChatEnabledLabel').text = 'Enabled' if doc_fields['chat_enabled'] else 'Disabled'
		
		# We are going to need all of this infor to describe the lobby when we try to join it
		new_lobby.host = doc_fields['host']
		new_lobby.password = doc_fields['password']
		new_lobby.privacy_status = 'Public' if new_lobby.password == '' else 'Private'
		new_lobby.classroom = doc_fields['classroom']
		new_lobby.player_count = doc_fields['player_count']
		new_lobby.max_players = doc_fields['player_count'][2].to_int()
		new_lobby.chat_enabled = 'Enabled' if doc_fields['chat_enabled'] else 'Disabled'
		
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
	join_button.disabled = false	
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
		
		# Get the docid to describe the lobby
		var lobby_id = lobby_docids[selected_lobby]
		LobbyDescription.set_lobby_id(lobby_id)
		
		# See, told you we'd need all this
		var host = available_lobbies[selected_lobby].host
		var password = available_lobbies[selected_lobby].password
		var classroom = available_lobbies[selected_lobby].classroom
		var player_count = available_lobbies[selected_lobby].player_count
		player_count[0] = String(player_count[0].to_int() + 1)
		var chat_enabled = available_lobbies[selected_lobby].chat_enabled
		
		# This will be parsed for important information when the WS server gets to work
		LobbyDescription.set_lobby_description({
			'host' : host,
			'password' : password,
			'classroom' : classroom,
			'player_count' : player_count,
			'chat_enabled' : chat_enabled,
			'vote_enabled' : true
		})
		
		FirebaseController.update_lobby(lobby_id, { 'player_count' : player_count })
		
		# Let's do this thing
#		CurrentUser.peer_id = _generate_peer_id()
		if get_tree().change_scene("res://multiplayer_engine/Waiting_For_Players_Screen.tscn") != OK:
			print('Could not change to the waiting for players screen')
		
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
