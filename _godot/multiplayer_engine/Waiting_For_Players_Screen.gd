extends Node

func _ready():
	$Client_Mgr.connect("connected_to_ws_server", self, '_on_ws_connect')
	$Client_Mgr.connect_to_server()
	$CenterContainer/DisplayConnectedPanel/VBoxContainer/WaitingPlayersLabel.text = 'Connecting...'
	$CenterContainer/DisplayConnectedPanel/VBoxContainer/JoinedPlayersLabel.text = 'Awaiting connection...'

func _on_StartGameButton_pressed():
	pass # Replace with function body.

func _on_ws_connect():
	var msg_connect = "Connected!\n Waiting for "
	var num_of_players =  LobbyDescription._max_players - LobbyDescription._num_of_players
	msg_connect += String(num_of_players)
	msg_connect += " more players to join the game" if num_of_players > 1 else " more player to start the game"
	$CenterContainer/DisplayConnectedPanel/VBoxContainer/WaitingPlayersLabel.text = msg_connect
	$CenterContainer/DisplayConnectedPanel/VBoxContainer/JoinedPlayersLabel.text = 'Awaiting players...'
