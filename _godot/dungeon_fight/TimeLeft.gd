extends Control

func _ready():
	hide()

func updateTimeLeftAmount(newAmount):
	$TimeLeftLabel.text = str(newAmount)
