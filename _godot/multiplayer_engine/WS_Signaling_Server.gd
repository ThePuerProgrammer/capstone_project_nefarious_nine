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

func _ready():
	# Connect server signals to local functions
	_server.connect("client_connected", self, "_connected")
	_server.connect("client_disconnected", self, "_disconnected")
	_server.connect("client_close_request", self, "_close_request")
	_server.connect("data_received", self, "_on_data")

	# Start listening
	var err = _server.listen(Constants.SERVER_PORT)
	if err != OK:
		print("Unable to start server")
		set_process(false)

	# Won't ever make it here if unsuccessful
	print('Server listening on port: ', Constants.SERVER_PORT)

	_log()

func _connected(id, proto):
	print("Client %d connected with protocol: %s" % [id, proto])

func _close_request(id, code, reason):
	print("Client %d disconnecting with code: %d, reason: %s" % [id, code, reason])

func _disconnected(id, was_clean = false):
	print("Client %d disconnected, clean: %s" % [id, str(was_clean)])

func _on_data(id):
	var pkt = _server.get_peer(id).get_packet()
	print("Got data from client %d: %s ... echoing" % [id, pkt.get_string_from_utf8()])
	_server.get_peer(id).put_packet(pkt)

func _process(_delta):
	_server.poll()

	for lobby in _active_lobbies:
		if lobby['queued_players'].size() >= lobby['max_players']:
			create_new_match(lobby)

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
	
	for n in new_game:
		lobby['connected_players'][n] = new_game
			
func _log():
	pass
