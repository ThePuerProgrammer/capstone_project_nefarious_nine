extends Node

var _lobby_id

var _host_name
var _password
var _privacy_status
var _classroom
var _max_players
var _chat_status
var _vote_enabled
var _num_of_players

func _ready():
	pass

func set_lobby_description(lobby_description):
	_host_name = lobby_description['host']
	_password  = lobby_description['password']
	_privacy_status = "Private" if _password != '' else "Public"
	_classroom = lobby_description['classroom']
	_max_players = String(lobby_description['player_count'][2]).to_int()
	_num_of_players = String(lobby_description['player_count'][0]).to_int()
	_chat_status = lobby_description['chat_enabled']
	_vote_enabled = lobby_description['vote_enabled']

func set_lobby_id(lobby_id):
	_lobby_id = lobby_id

func add_player():
	_num_of_players += 1
