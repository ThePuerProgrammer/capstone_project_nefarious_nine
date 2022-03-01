extends Node

onready var mp = WebRTCMultiplayer.new()

func _ready():
	var peer = WebRTCPeerConnection.new()
	var data = WebRTCDataChannel.new()
	peer.initialize({
		"iceServers": [ { "urls": ["stun:stun.l.google.com:19302"] } ]
	})
	mp.add_peer(peer, 1)
	print('hi22')
