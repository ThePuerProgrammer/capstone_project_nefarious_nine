extends Node

func _ready():
	Firebase.Auth.login_with_email_and_password("jesse@test.com", "jjjjjj")
	var collection : FirestoreCollection = Firebase.Firestore.collection("users")
	var document_task : FirestoreTask = collection.get("77ybrdrB2IhEGYnJmjhJBjeqq9G3")
	var document : FirestoreDocument = yield(document_task, "get_document")
	print(document)
