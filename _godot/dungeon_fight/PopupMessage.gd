extends Control


func showPopupMessage(message, messageTimeLength):
	print("wtf")
	$PopupLabelSmallText.show()
	$MessageTimeLength.wait_time = messageTimeLength
	$MessageTimeLength.start()
	$PopupLabelSmallText.text = message

func _on_MessageTimeLength_timeout():
	$MessageTimeLength.stop()
	$PopupLabelSmallText.hide()
	$PopupLabelSmallText.text = ""
