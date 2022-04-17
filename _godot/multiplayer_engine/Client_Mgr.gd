# This file was written using a direct reference to the following open source file (MIT License)
# https://github.com/henriquelalves/SnakeVersusWebRTC/blob/main/godot-project/MultiplayerFramework/WebRTCClient.gd
# which was, itself, a direct reference of the Godot documentation, expanded for exchanging game data

extends Node

class_name ClientMgr

var _rtc : WebRTC_Client
var _match = []
var _rtc_peers = {}
var _id = 0
var _player_number = 0
var _client : WebSocketClient
var _initialised = false
var players_ready : bool = false

var uri : String

signal on_message(message)
signal on_players_ready()
signal player_disconnected()
signal player_joining_game()

signal connected_to_ws_server

func send_data(message : Message):
	if (players_ready):
		if _rtc.rtc_mp.put_packet(message.get_raw()) != OK:
			print("Error: put_packet() Client_Mgr line 27")
		if message.is_echo:
			emit_signal("on_message", message)
	else:
		if _client.get_peer(1).put_packet(message.get_raw()) != OK:
			print("Error: put_packet() Client_Mgr line 32")

func connect_to_server():
	uri = "wss://" + Constants.WEB_SOCKET_URL + ":" + str(Constants.SERVER_PORT)
	
	players_ready = false
	_rtc = load('res://multiplayer_engine/WebRTC_Client.tscn').instance()
	_match = []
	_rtc_peers = {}
	_id = 0
	_player_number = 0
	_client = WebSocketClient.new()
	
	_client.set_verify_ssl_enabled(Constants.SSL)

	if(Constants.SSL):
		print("trusting crt...")
		var cert = X509Certificate.new()
		cert.load("res://certs/cert.crt")
		_client.set_trusted_ssl_certificate(cert)
		
	_initialised = false

	var e = OK
	e += _client.connect("connection_closed", 		self, "_closed")
	e += _client.connect("connection_error", 		self, "_closed")
	e += _client.connect("connection_established", 	self, "_connected")
	e += _client.connect("data_received", 			self, "_on_data")
	
	add_child(_rtc)
	e += _rtc.connect("on_message", 		self, "rtc_on_message")
	e += _rtc.connect("on_send_message", 	self, "rtc_on_send_message")
	e += _rtc.connect("peer_connected", 	self, "rtc_on_peer_connected")
	e += _rtc.connect("peer_disconnected", 	self, "rtc_on_peer_disconnected")
	
	if e != OK:
		print('Error connecting signals in Client Mgr')
	
	var err = _client.connect_to_url(uri)
	if err != OK:
		set_process(false)

func rtc_on_peer_connected(id):
	_rtc_peers[id] = true
	
	for peer in _rtc_peers.keys():
		if not _rtc_peers[peer]:
			return
	players_ready = true
	emit_signal("on_players_ready")
	
func rtc_on_peer_disconnected(id):
	_rtc_peers[id] = false
	
	players_ready = false
	emit_signal("player_disconnected")

func rtc_on_message(message : Message):
	emit_signal("on_message", message)

func rtc_on_send_message(message : Message):
	send_data(message)

func disconnect_from_server():
	_client.disconnect_from_host()

func _closed(was_clean = false):
	print("Closed, clean: ", was_clean)
	set_process(false)

func _connected(_proto = ""):
	if _client.get_peer(1).put_packet(LobbyDescription._lobby_id.to_utf8()) != OK:
		print("Error: put_packet() Client_Mgr line 88")
	emit_signal('connected_to_ws_server')
	print("Connected to server!")

func _on_data():
	var data = _client.get_peer(1).get_packet()
	
	var message = Message.new()
	message.from_raw(data)
	
	if (message.server_login):
		_id = message.content
		_initialised = true
		print("Logged in with id ", _id)
	if (message.game_start):
		_match = message.content as Array
		_player_number = _match.find(_id)
		print("Match started as player ", _player_number)
		
		_rtc.initialize(_id)
		for player_id in _match:
			if (player_id != _id):
				_rtc_peers[player_id] = false
				_rtc.create_peer(player_id)
	else:
		if String(message.content) == "joining":
			emit_signal("player_joining_game")
		print("On message: ", message.content)
		_rtc.on_received_setup_message(message)
	
	emit_signal("on_message", message)

func _process(_delta):
	if (_client != null): _client.poll()
	if (_rtc != null): pass

func _notification(what):
	if what == NOTIFICATION_PREDELETE:
		if (_client != null): _client.disconnect_from_host()
