extends Node

onready var submit_button : Button	 = get_node("CenterContainer/SignInPanel/ColorRect/SignInButton")
onready var password_edit : LineEdit = get_node("CenterContainer/SignInPanel/ColorRect/CenterContainer/PasswordEdit")

signal success_banner_timeout

func _ready():
	var e = OK
	e += CurrentUser.connect("authentication_success", self, '_on_auth_success')
	e += CurrentUser.connect('failure_to_authenticate_user', self, '_on_auth_failure')

	if e != OK:
		print('Could not connect CurrentUser signals')

func _input(event):
	if event is InputEventMouseButton:
		if event.button_index == BUTTON_LEFT and event.pressed:
			if Rect2(835,555,250,50).has_point(event.position) and Input.is_mouse_button_pressed(0):
				pass
		# Coordinates for the signin button preventing it from registering clicks
		# from anywhere else on the screen as a signin button click
			elif !(Rect2(898, 665, 120, 30).has_point(event.position)) and Input.is_mouse_button_pressed(0):
				pass
	if event is InputEventKey:
		if event.pressed and event.scancode == KEY_ENTER or event.scancode == KEY_KP_ENTER:
			submit_button.emit_signal("pressed")
	#if event.type == InputEvent.KEY_
#	if event.is_action_pressed("ui_accept"):
#		if Input.is_key_pressed(KEY_ENTER):
#			submit_button.emit_signal("pressed")
#		#Text Field Coordinates to prevent it from clicking the signin button
#		elif Rect2(835,555,250,50).has_point(event.position) and Input.is_mouse_button_pressed(0):
#			pass
		# Coordinates for the signin button preventing it from registering clicks
		# from anywhere else on the screen as a signin button click
#		elif !(Rect2(898, 665, 120, 30).has_point(event.position)) and Input.is_mouse_button_pressed(0):
#			pass
#		else:
#			submit_button.emit_signal("pressed")

func _on_auth_success():
	get_node("CenterContainer/SignInPanel/ColorRect/EnterPasswordLabel").text = \
		"Success!"
	yield(get_tree().create_timer(0.3), "timeout")
	emit_signal("success_banner_timeout")
	
func _on_auth_failure():
	get_node("CenterContainer/SignInPanel/ColorRect/EnterPasswordLabel").text = \
		"Incorrect Password\nTry Again"
	password_edit.text = ''
	submit_button.disabled = false
	
func _on_SignInButton_pressed():
	submit_button.disabled = true
	CurrentUser.authenticate_current_user(password_edit.text)
