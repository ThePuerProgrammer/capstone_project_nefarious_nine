extends Node

# From firebase_auth.js Auth.currentUser.uid
var user_id

# From firebase_auth.js Auth.currentUser.email
var user_email = ""

# After successful signin, the current user's user collection
var user_doc

var user_is_authenticated = false

var window

var peer_id

var username

signal failure_to_authenticate_user
signal authentication_success

func _ready():
	if Constants.DEV:
		user_email = Constants.TEST_EMAIL
		user_id = Constants.TEST_UID
	
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
		user_id = window.sessionStorage.getItem("userid")
		user_email = window.sessionStorage.getItem("email")
		window.sessionStorage.removeItem('userid')
		window.sessionStorage.removeItem('email')

# Create the user when the login fails
func _on_login_failed(code, msg):
	print('Login failed with code: ', code)
	print(msg)
	emit_signal("failure_to_authenticate_user")
		
# Get the user account from the user data belonging to the website sign in user
func _on_login_succeeded(_auth_info):
	user_is_authenticated = true
	
	#CHANGED FOR TESTING
	#user_id = "vEcdq4xFRwODKEzZIEuE57AeQXZ2"
	#if window != null: 
	user_doc = FirebaseController.get_user_document(user_id)
	if user_doc is GDScriptFunctionState:
		user_doc = yield(user_doc, "completed")
		print("user doc received!")
		print(user_doc)

	emit_signal("authentication_success")

func authenticate_current_user(password):
	Firebase.Auth.login_with_email_and_password(user_email, password)
