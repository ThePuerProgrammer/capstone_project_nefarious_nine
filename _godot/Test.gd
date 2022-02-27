extends Node

# Called when the node enters the scene tree for the first time.
func _ready():
	Firebase.Auth.login_with_email_and_password("jesse@test.com", "jjjjjj")
	yield(Firebase.Auth, "login_succeeded")
	
	var col = Firebase.Firestore.collection('classrooms').get('')
	yield(col, "get_document")
	var d = col.data.documents
	
	for i in d:
		print(i)
