extends Node

func _ready():
	CurrentUser.connect('failure_to_authenticate_user', self, '_on_auth_success')
	CurrentUser.connect("authentication_success", self, '_on_auth_failure')

func _on_auth_success():
	pass
	
func _on_auth_failure():
	pass
