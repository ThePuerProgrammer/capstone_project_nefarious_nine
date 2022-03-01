extends Node

const PORT = 6969

onready var _server = WebSocketServer.new()

var _active_lobbies : Dictionary = {
	# Example structure
	# 'server firebase docid' : {
		# 'max_players' : 4,
		# 'queued_players' : ['user1.uid, user2.uid'], 
	#}
}

func _ready():
	# Connect server signals to local functions
	_server.connect("client_connected", self, "_connected")
	_server.connect("client_disconnected", self, "_disconnected")
	_server.connect("client_close_request", self, "_close_request")
	_server.connect("data_received", self, "_on_data")

	# Start listening
	var err = _server.listen(PORT)
	if err != OK:
		print("Unable to start server")
		set_process(false)

	# Won't ever make it here if unsuccessful
	print('Server listening on port: ', PORT)

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
	# Call this in _process or _physics_process.
	# Data transfer, and signals emission will only happen when calling this function.
	_server.poll()

	for lobby in _active_lobbies:
		if lobby['queued_players'].size() >= lobby['max_players']:
			create_new_match()

func create_new_match():
	pass

func _log():
	pass
