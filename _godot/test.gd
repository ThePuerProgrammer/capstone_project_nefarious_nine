extends Node

func _ready():
	Firebase.Auth.connect("login_failed", self, "_on_login_failed")
	Firebase.Auth.connect("login_succeeded", self, "_on_login_succeeded")
	Firebase.Auth.connect("signup_succeeded", self, "_on_signup_succeeded")
	Firebase.Auth.login_with_email_and_password("abc@pomoanon.com", "pppppp")

func _on_login_failed(fail_code, msg):
	print("login failed")
	Firebase.Auth.signup_with_email_and_password("abc@pomoanon.com", "pppppp")

func _on_signup_succeeded(auth_info):
	print("Signup successful")
	Firebase.Auth.login_with_email_and_password("abc@pomoanon.com", "pppppp")
	
func _on_signup_failed(fail_code, msg):
	print("sign up failed")	
	
func _on_login_succeeded(auth_info):
	print("logged in!")
