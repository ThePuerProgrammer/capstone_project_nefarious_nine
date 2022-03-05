extends Node

onready var waiting_players_label = $CenterContainer/DisplayConnectedPanel/VBoxContainer/WaitingPlayersLabel
onready var joined_players_label  = $CenterContainer/DisplayConnectedPanel/VBoxContainer/JoinedPlayersLabel
onready var start_game_button 	  = $CenterContainer/DisplayConnectedPanel/VBoxContainer/CenterContainer/StartGameButton
onready var this_user_is_host = LobbyDescription._host_name == CurrentUser.user_email
onready var num_of_players =  LobbyDescription._max_players - LobbyDescription._num_of_players

func _ready():
	var e = OK
	e += $Client_Mgr.connect("connected_to_ws_server", 	self, '_on_ws_connect')
	e += $Client_Mgr.connect('on_players_ready', 		self, '_on_game_start')
	e += $Client_Mgr.connect("player_disconnected",		self, '_on_player_disconnected')
	e += $Client_Mgr.connect("player_joining_game",		self, '_on_player_joining_game')
	
	if e != OK:
		print("Could not connect signals in waiting screen")
	
	$Client_Mgr.connect_to_server()
	waiting_players_label.text = 'Connecting...'
	joined_players_label.text = 'Awaiting connection...'
	if not this_user_is_host:
		start_game_button.visible = false

func _on_StartGameButton_pressed():
	$CenterContainer/AcceptDialog.popup()

func _on_ws_connect():
	var msg_connect = "Connected!\n Waiting for "
	msg_connect += String(num_of_players)
	msg_connect += " more players to join the game" if num_of_players > 1 else " more player to start the game"
	waiting_players_label.text = msg_connect
	joined_players_label.text = 'Awaiting players...'

func _on_game_start():
	waiting_players_label.text = 'All Players Connected!'
	if this_user_is_host:
		joined_players_label.text = 'You\'re the host! Start the game whenever you\'re ready.'
		start_game_button.disabled = false
	else:
		joined_players_label.text = 'Waiting for the host to start the game'

func _on_player_disconnected():
	waiting_players_label.text = 'A player has left the lobby.'
	if this_user_is_host:
		joined_players_label.text = 'Please recreate the lobby.'
		start_game_button.disabled = true
	else:
		joined_players_label.text = 'Cannot continue. Host must recreate the lobby.'

func _on_player_joining_game():
	num_of_players -= 1
	var msg_connect = "Connected!\n Waiting for "
	msg_connect += String(num_of_players)
	msg_connect += " more players to join the game" if num_of_players > 1 else " more player to start the game"
	waiting_players_label.text = msg_connect
