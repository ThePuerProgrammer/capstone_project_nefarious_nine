extends Node

onready var maxPlayersOptionButton = get_node("Centered/TabContainer/CreateLobby/LobbySettings/MaxPlayersOptionButton")

const collections : Dictionary = {
	'lobbies' : 'lobbies',
}

var classrooms : Dictionary = {}

func _ready():
	# Max players drop down button items. Disable non numeric
	maxPlayersOptionButton.add_item("Select Max")
	maxPlayersOptionButton.add_item("2")
	maxPlayersOptionButton.add_item("3")
	maxPlayersOptionButton.add_item("4")
	maxPlayersOptionButton.set_item_disabled(0, true)
	
#	# Query object works in the place of Firebase.Firestore.collection().doc().get()
#	var query : FirestoreQuery = FirestoreQuery.new()
#
#	# Target the classrooms collection
#	query.from('classrooms')
#
#	# Get all classrooms that the current user is a member of
#	query.where('members', FirestoreQuery.OPERATOR.ARRAY_CONTAINS, CurrentUser.userDoc.doc_fields.email)
#
#	# Issue the query
#	var query_task : FirestoreTask = Firebase.Firestore.query(query)
#
#	# Yield on the request to get a result
#	var result : Array = yield(query_task, "task_finished")
#
#	for i in result:
#		print(i)

func _on_Back_To_Main_Menu_Button_pressed():
	if (get_tree().change_scene("res://Menu/MenuScreen.tscn") != OK):
		print("Failed to change scene")

func _createLobby():
	get_node("Centered/TabContainer/CreateLobby/SubmitHBox/CreateButton").disabled = true

func _offer_created(type, data, id):
	pass
	
func _new_ice_candidate(mid_name, index_name, sdp_name, id):
	pass
