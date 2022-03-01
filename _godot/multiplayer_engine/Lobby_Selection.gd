extends Control

signal lobby_button_pressed(lobby_number)

var lobby_number
var password
const default_color = '#d1d1d1'
const pressed_color = '#56667A'

onready var host_name_label = get_node("HBoxContainer/HostNameLabel")
onready var privacy_status_label = get_node("HBoxContainer/PrivacyStatusLabel")
onready var classroom_label = get_node("HBoxContainer/ClassroomLabel")
onready var player_count_label = get_node("HBoxContainer/PlayerCountLabel")
onready var chat_enabled_label = get_node("HBoxContainer/ChatEnabledLabel")

func _ready():
	pass # Replace with function body.

func set_labels(host, privacy_status, classroom, player_count, chat_enabled):
	assert(typeof(host) == TYPE_STRING)
	assert(typeof(privacy_status) == TYPE_STRING)
	assert(typeof(classroom) == TYPE_STRING)
	assert(typeof(player_count) == TYPE_STRING)
	assert(typeof(chat_enabled) == TYPE_STRING)
	host_name_label.text = host
	privacy_status_label.text = privacy_status
	classroom_label.text = classroom
	player_count_label.text = player_count
	chat_enabled_label.text = chat_enabled
	
func update_player_count(player_count):
	assert(typeof(player_count) == TYPE_STRING)
	player_count_label.text = player_count


func _on_LobbySelectionButton_pressed():
	get_node("ColorRect").color = pressed_color
	emit_signal('lobby_button_pressed', lobby_number)

func reset_color():
	get_node("ColorRect").color = default_color
