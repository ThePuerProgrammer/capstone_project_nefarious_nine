extends Node

var data

# Called when the node enters the scene tree for the first time.
func _ready():
	Firebase.Auth.login_with_email_and_password("jesse@test.com", "jjjjjj")
	yield(Firebase.Auth, "login_succeeded")
	
#	var col = Firebase.Firestore.collection('classrooms').get('')
#	yield(col, "get_document")
#	var d = col.data.documents
#
#	for i in d:
#		print(i)

	var query : FirestoreQuery = FirestoreQuery.new().from("classrooms").where("members", FirestoreQuery.OPERATOR.ARRAY_CONTAINS, "jesse@test.com")
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res = yield(query_task, "task_finished")
	data = res.data 
	
	for i in data:
		print(i)
	
