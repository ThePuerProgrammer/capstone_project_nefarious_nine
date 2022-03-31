extends Control

var pomopet

func _ready():
	pomopet = get_node("../Pet")
	
	print("pet dirtiness: ", pomopet.petDirtinessLevel)
	if pomopet.petDirtinessLevel == 0:
		$HBoxContainer/CleanButton.disabled = true

func setCleanButtonEnabled(isEnabled):
	$HBoxContainer/CleanButton.disabled = isEnabled

func setPetButtonEnabled(isEnabled):
	$HBoxContainer/PetButton.disabled = isEnabled
	
func setFeedButtonEnabled(isEnabled):
	$HBoxContainer/FeedButton.disabled = isEnabled

func _on_CleanButton_pressed():
	pomopet.startCleanAction()
