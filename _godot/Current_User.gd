extends Node

# From firebase_auth.js Auth.currentUser.uid
var user_id

# From firebase_auth.js Auth.currentUser.email
var user_email = "jesse@test.com"

# After successful signin, the current user's user collection
var userDoc

var window

signal failure_to_authenticate_user
signal authentication_success

func _ready():
	# Connect the auth system signals
	var e = OK
	e += Firebase.Auth.connect("login_failed",		self, "_on_login_failed")
	e += Firebase.Auth.connect("login_succeeded",	self, "_on_login_succeeded")
	
	if e != OK:
		print("Could not connect Firebase Auth Signals")
		
	# Should only execute if being run in browser	
	window = JavaScript.get_interface('window')
	if window != null:
		# Snag the user data from the window local storage and remove them
		user_id = window.localStorage.getItem('userid')
		user_email = window.localStorage.getItem('email')
		window.localStorage.removeItem('userid')
		window.localStorage.removeItem('email')

# Create the user when the login fails
func _on_login_failed(code, msg):
	print('Login failed with code: ', code)
	print(msg)
	emit_signal("failure_to_authenticate_user")
		
# Get the user account from the user data belonging to the website sign in user
func _on_login_succeeded(_auth_info):
	if window != null:
		var collection : FirestoreCollection = Firebase.Firestore.collection('users')
		var document_task : FirestoreTask = collection.get(user_id)
		var document : FirestoreDocument = yield(document_task, "get_document")
		userDoc = document
	emit_signal("authentication_success")

func authenticate_current_user(password):
	Firebase.Auth.login_with_email_and_password(user_email, password)
