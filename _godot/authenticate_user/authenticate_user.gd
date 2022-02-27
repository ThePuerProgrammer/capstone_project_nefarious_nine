extends Node

onready var submit_button : Button	 = get_node("CenterContainer/SignInPanel/ColorRect/SignInButton")
onready var password_edit : LineEdit = get_node("CenterContainer/SignInPanel/ColorRect/CenterContainer/PasswordEdit")

signal success_banner_timeout

func _ready():
	CurrentUser.connect('failure_to_authenticate_user', self, '_on_auth_success')
	CurrentUser.connect("authentication_success", self, '_on_auth_failure')

func _on_auth_success():
	submit_button.text = "Success!"
	yield(get_tree().create_timer(0.5), "timeout")
	emit_signal("success_banner_timeout")
	
func _on_auth_failure():
	get_node("CenterContainer/SignInPanel/ColorRect/EnterPasswordLabel").text = \
		"Incorrect Password"
	yield(get_tree().create_timer(1.0), "timeout")
	get_node("CenterContainer/SignInPanel/ColorRect/EnterPasswordLabel").text = \
		"Try Again"
	submit_button.disabled = false
	
func _on_SignInButton_pressed():
	submit_button.disabled = true
	CurrentUser.authenticate_current_user(password_edit.text)
