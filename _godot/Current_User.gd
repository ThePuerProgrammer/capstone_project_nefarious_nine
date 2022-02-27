extends Node

var user_id
var user_email
var userDoc

var unique_email = ""
var unique_pw = ""

const hasher = "Q1w!2E3r!4T5y!6U7i!8O9p!0A!1s2D!3f4G!5h6J!7k8L!9z0X1c!2V3b!4N5m!6q7W!8e9R!0t!1Y2u!3I4o!5P6a!7S8d!9F0g1H!2j3K!4l5Z!6x7C!8v9B!0n!1M2"

func _ready():
	var window = JavaScript.get_interface('window')
	if window != null:
		# Snag the user data from the window local storage and clear it
		user_id = window.localStorage.getItem('userid')
		user_email = window.localStorage.getItem('email')
		window.localStorage.clear()
		
		# Connect the auth system signals for special game user accounts
		var e = OK
		e += Firebase.Auth.connect("login_failed",		self, "_on_login_failed")
		e += Firebase.Auth.connect("login_succeeded",	self, "_on_login_succeeded")
		e += Firebase.Auth.connect("signup_succeeded",	self, "_on_signup_succeeded")
		e += Firebase.Auth.connect("signup_failed",		self, "_on_signup_failed")
		
		if e != OK:
			print("Could not connect Firebase Auth Signals")
		
		# Create a unique_email based on the entire string of the users email	
		for ch in user_email:
			if (ch != '@' and ch != '.'):
				unique_email += ch
		
		# Create a unique password based on the unique email
		var flip = true
		for i in range(unique_email.length()):
			if i % 2 == 0:
				var j = hasher.find(unique_email[i])
				unique_pw += hasher[j + 1]
			elif flip:
				flip = false
				var m = hasher.length()
				var l = m - unique_email.length() + unique_pw.length()
				unique_pw += hasher[l]
			else:
				flip = true
				var m = 0
				var l = m + unique_email.length() - unique_pw.length()
				unique_pw += hasher[l]
		
		# Finish making unique email
		unique_email += "@pomogame.com"
		
		# Attempt signin
		Firebase.Auth.login_with_email_and_password(unique_email, unique_pw)

# Create the user when the login fails
func _on_login_failed(_code, _msg):
	Firebase.Auth.signup_with_email_and_password(unique_email, unique_pw)
		
# Get the user account from the user data belonging to the website sign in user
func _on_login_succeeded(_auth_info):
	var collection : FirestoreCollection = Firebase.Firestore.collection('users')
	var document_task : FirestoreTask = collection.get(user_id)
	var document : FirestoreDocument = yield(document_task, "get_document")
	userDoc = document

# New user created. Sign them in
func _on_signup_succeeded(_auth_info):
	Firebase.Auth.login_with_email_and_password(unique_email, unique_pw)

# Something bad, probably
func _on_signup_failed(code, msg):
	print("Could not sign up new user")
	print(code)
	print(msg)
