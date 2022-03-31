extends Control

var pomopet

func _ready():
	pomopet = get_node("../Pet")

func setCleanButtonEnabled(isEnabled):
	$HBoxContainer/CleanButton.disabled = !isEnabled

func setPetButtonEnabled(isEnabled):
	$HBoxContainer/PetButton.disabled = !isEnabled
	
func setFeedButtonEnabled(isEnabled):
	$HBoxContainer/FeedButton.disabled = !isEnabled

func _on_CleanButton_pressed():
	pomopet.startCleanAction()
	setCleanButtonEnabled(false)
