extends Node

onready var _server = WebSocketServer.new()

var _active_lobbies : Dictionary = {
	# Example structure
	# 'server firebase docid' : {
		# 'max_players' : 4,
		# 'queued_players' : ['user1.uid, user2.uid'],
		# 'connected_players' : ['user', 'user2', etc]
	#}
}

# This array will be for polling each new peer 
# for packets that contain the Firebase docid
# of the newly created multiplayer_game_lobby
var _peers_awaiting_lobby_confirmation = []

func _ready():
	# FOR THE LINUX EXPORT
	CurrentUser.authenticate_current_user(Constants.TEST_PASSWORD)
	# Connect server signals to local functions
	_server.connect("client_connected", self, "_connected")
	_server.connect("client_disconnected", self, "_disconnected")
	_server.connect("client_close_request", self, "_close_request")
	_server.connect("data_received", self, "_on_data")

	# Start listening
	_server.private_key = load("res://certs/privkey.key");
	_server.ssl_certificate = load("res://certs/cert.crt");
	
	var err = _server.listen(Constants.SERVER_PORT)
	if err != OK:
		print("Unable to start server")
		set_process(false)

	# Won't ever make it here if unsuccessful
	print('Server listening on port: ', Constants.SERVER_PORT)

	_log()

func _connected(id, proto):
	_peers_awaiting_lobby_confirmation.append(id)
	print("Client %d connected with protocol: %s" % [id, proto])

func _close_request(id, code, reason):
	print("Client %d disconnecting with code: %d, reason: %s" % [id, code, reason])

func _disconnected(id, was_clean = false):
	# Remove the player from the lobby's connected_players array
	# If that array is empty, the lobby is empty. Delete from firestore
	for lobby in _active_lobbies:
		var disconnect_lobby = []
		var this_lobby = _active_lobbies[lobby]
		for player in this_lobby['connected_players']:
			if player == id:
				disconnect_lobby.append(player)
		for player in disconnect_lobby:
			this_lobby['connected_players'].erase(player)
		if this_lobby['connected_players'].size() == 0:
			FirebaseController.delete_lobby(lobby)
			
	print("Client %d disconnected, clean: %s" % [id, str(was_clean)])

func _on_data(id):
	# This section is related to the first packet sent after connecting to the server
	# The idea is simple, when the player connects, they are put in a queue awaiting dictionary
	# assignment between them and their lobby. As the queue is processed, they are removed from it
	# If they are the first to create the active lobby, they are assigned as host. Then for them
	# and any others that join this lobby, they are added to the connected players and the lobby
	# queue as indexes in the lobby dictionary. A visual of the active lobbies can be seen above
	# in the variable declaration. 
	################################################################################################
	var remove_peers = []
	for peer in _peers_awaiting_lobby_confirmation:
		if peer == id:
			remove_peers.append(peer)
			var pkt = _server.get_peer(id).get_packet()
			var data = pkt.get_string_from_utf8()
			
			if _active_lobbies.has(data):
				for player in _active_lobbies[data]['queued_players']:
					var message = Message.new()
					message.content = "joining"
					_server.get_peer(player).put_packet(message.get_raw())
				_active_lobbies[data]['queued_players'].append(id)
				_active_lobbies[data]['connected_players'][id] = []
			else:
				# Get the firebase document related to the data (docid)
				var lobby_doc = FirebaseController.get_lobby(data)
				if lobby_doc is GDScriptFunctionState:
					lobby_doc = yield(lobby_doc, 'completed')
				
				var fields = lobby_doc['doc_fields']
				_active_lobbies[data] = {
					'host' : fields['host'],
					'max_players' : fields['player_count'][2].to_int(),
					'queued_players' : [id],
					'connected_players' : {id : []},
				}
			var message = Message.new()
			message.server_login = true
			message.content = id
			_server.get_peer(id).put_packet(message.get_raw())
	
	# Data was first exchange from peer. Return
	if remove_peers.size() != 0:
		for peer in remove_peers:
			_peers_awaiting_lobby_confirmation.remove(_peers_awaiting_lobby_confirmation.find(peer))
		return
	################################################################################################

	# Else data wasn't related to choosing a lobby
	var message = Message.new()
	message.from_raw(_server.get_peer(id).get_packet())
	for lobby in _active_lobbies:
		if not _active_lobbies[lobby]['connected_players'].has(id):
			continue
		for player_id in _active_lobbies[lobby]['connected_players'][id]:
			if (player_id != id || (player_id == id && message.is_echo)):
				_server.get_peer(player_id).put_packet(message.get_raw())
		break

func _process(_delta):
	_server.poll()

	for lobby in _active_lobbies:
		if _active_lobbies[lobby]['queued_players'].size() >= _active_lobbies[lobby]['max_players']:
			create_new_match(_active_lobbies[lobby])

func create_new_match(lobby):
	var new_game = []
	for player in lobby['queued_players']:
		new_game.append(player)

	for _i in range(lobby['max_players']):
		var message = Message.new()
		message.game_start = true
		message.content = new_game
		_server.get_peer(lobby['queued_players'][0]).put_packet(message.get_raw())
		lobby['queued_players'].remove(0)
	
	for player in lobby['connected_players']:
		lobby['connected_players'][player] = new_game
			
func _log():
	pass
