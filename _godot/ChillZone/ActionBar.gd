extends Control

var pomopet
var poopController

func _ready():
	pomopet = get_node("../Pet")
	poopController = get_node("../ActionBarController/PoopController")

func setCleanButtonEnabled(isEnabled):
	$HBoxContainer/CleanButton.disabled = !isEnabled

func setPetButtonEnabled(isEnabled):
	$HBoxContainer/PetButton.disabled = !isEnabled
	
func setFeedButtonEnabled(isEnabled):
	$HBoxContainer/FeedButton.disabled = !isEnabled

func setPickUpPoopButtonEnabled(isEnabled):
	$HBoxContainer/PoopPickupButton.disabled = !isEnabled

func _on_CleanButton_pressed():
	pomopet.startCleanAction()
	setCleanButtonEnabled(false)

func _on_PoopPickupButton_pressed():
	poopController.startPoopPickupAction()
	setPickUpPoopButtonEnabled(false)
