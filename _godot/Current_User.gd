extends Node

var user_id
var userDoc

func _ready():
	var window = JavaScript.get_interface('window')
	if window != null:
		user_id = window.localStorage.getItem('userid')
		window.localStorage.clear()
		Firebase.Auth.connect("signup_succeeded", self, "_on_login")
		Firebase.Auth.login_anonymous()
		
func _on_login(auth_info):
	print(auth_info)
	var collection : FirestoreCollection = Firebase.Firestore.collection('users')
	var document_task : FirestoreTask = collection.get(user_id)
	var document : FirestoreDocument = yield(document_task, "get_document")
	userDoc = document
	print(userDoc)
