extends Node

func _ready():
	pass
	
####################################################################################################
#MULTIPLAYER
####################################################################################################
func get_classrooms_where_user_is_member(user_email):
	assert(user_email != null)
	var query : FirestoreQuery = FirestoreQuery.new()\
		.from(Constants.COLLECTIONS.CLASSROOMS)\
		.where("members", FirestoreQuery.OPERATOR.ARRAY_CONTAINS, user_email)
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res = yield(query_task, "task_finished")
	return res.data
	
func get_classroom_decks(classroom_id):
	assert(classroom_id != null)
	var query : FirestoreQuery = FirestoreQuery.new()\
		.from(Constants.COLLECTIONS.CLASSROOMS)\
		.from(Constants.COLLECTIONS.DECKS)\
		.where('isClassDeck', FirestoreQuery.OPERATOR.EQUAL, classroom_id)
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res = yield(query_task, "task_finished")
	return res.data
	
func get_flashcards_from_decks(classroom_id):
	assert(classroom_id != null)
	var query : FirestoreQuery = FirestoreQuery.new()\
		.from(Constants.COLLECTIONS.CLASSROOMS)\
		.from(Constants.COLLECTIONS.DECKS)\
		.where('isClassDeck', FirestoreQuery.OPERATOR.EQUAL, classroom_id)\
		.from(Constants.COLLECTIONS.FLASHCARDS)
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res = yield(query_task, "task_finished")
	return res.data
	
func get_classroom(docid):
	assert(docid != null)
	var collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.CLASSROOMS)
	var document_task : FirestoreTask = collection.get(docid)
	var document : FirestoreDocument = yield(document_task, "get_document")
	return document

func get_user_document(user_id):
	var collection : FirestoreCollection = Firebase.Firestore.collection('users')
	var document_task : FirestoreTask = collection.get(user_id)
	var document : FirestoreDocument = yield(document_task, "get_document")
	return document
	
func add_new_multiplayer_lobby(lobby_fields):
	assert(typeof(lobby_fields) == TYPE_DICTIONARY)
	var collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.MULTIPLAYER_GAME_LOBBIES)
	var add_task : FirestoreTask = collection.add('', lobby_fields)
	var document : FirestoreTask = yield(add_task, "task_finished")
	return document.data

func get_multiplayer_lobbies(classroom_list):
	assert(typeof(classroom_list) == TYPE_ARRAY)
	var query : FirestoreQuery = FirestoreQuery.new()\
		.from(Constants.COLLECTIONS.MULTIPLAYER_GAME_LOBBIES)\
		.where("classroom", FirestoreQuery.OPERATOR.IN, classroom_list)
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res : Array = yield(query_task, "task_finished").data
	return res
	
func get_lobby(lobby_id):
	var collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.MULTIPLAYER_GAME_LOBBIES)
	var document_task : FirestoreTask = collection.get(lobby_id)
	var document : FirestoreDocument = yield(document_task, "get_document")
	return document

func delete_lobby(lobby_id):
	var collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.MULTIPLAYER_GAME_LOBBIES)
	var del_task : FirestoreTask = collection.delete(lobby_id)
	yield(del_task, "task_finished")

func update_lobby(lobby_id, update_dict):
	var collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.MULTIPLAYER_GAME_LOBBIES)
	var up_task : FirestoreTask = collection.update(lobby_id, update_dict)
	yield(up_task, "task_finished")
	
####################################################################################################

####################################################################################################
#SINGLE PLAYER MENU
####################################################################################################
#GET CATEGORIES FROM FIRESTORE
func get_categories():
	var collection : FirestoreCollection=Firebase.Firestore.collection(Constants.COLLECTIONS.CATEGORIES)
	var document_task: FirestoreTask = collection.get('Categories')
	var document : FirestoreDocument = yield(document_task, "get_document")
	print("Categories Document:", document)
	return document
#GET USER DECKS FROM FIRESTORE
func get_user_doc_for_nested(uid):
	assert(uid != null)
	var user_collection : FirestoreCollection = Firebase.Firestore.collection(Constants.COLLECTIONS.USERS)
	var document_task: FirestoreTask = user_collection.get(uid)
	var document : FirestoreDocument = yield(document_task, "get_document")
	print("UID Document:", document)
	return document
	
func get_user_decks(uid):
	var query : FirestoreQuery = FirestoreQuery.new()\
		.from(Constants.COLLECTIONS.USERS)\
		.from(Constants.COLLECTIONS.DECKS)\
		.where("created_by", FirestoreQuery.OPERATOR.EQUAL, uid)\
		.order_by("category", FirestoreQuery.DIRECTION.DESCENDING)
	var query_task : FirestoreTask = Firebase.Firestore.query(query)
	var res : Array = yield(query_task, "task_finished").data
	print("DECKS:",res)
	return res
####################################################################################################
