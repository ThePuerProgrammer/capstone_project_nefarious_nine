extends ProgressBar

#var bubblesParticle = preload("res://ChillZone/wash_pomopet/MouseBubblesSmallOnlyParticle.tscn")

func _ready():
	modulate.a = 0

func incrementByStep():
	# increment value
	value = value + step
	
#	# Spawn bubbles at end of progress bar
#	if floor((value / max_value) * 100) > lastWholeValue:
#		lastWholeValue = floor((value / max_value) * 100)
#		var percentComplete = value / max_value
#		var progressBarBubbleXOffset = get_rect().size.x * 0.03
#		var bubblesInstance = bubblesParticle.instance()
#		randomize()
##		bubblesInstance.position = Vector2(progressBarBubbleXOffset + get_rect().position.x + (get_rect().size.x * percentComplete), progressBarBubbleYOffset + get_rect().position.y + (get_rect().size.y * rand_range(0, 0.5))) # set where particle effect appears (mouse pos)
#		bubblesInstance.position = Vector2(progressBarBubbleXOffset + get_rect().position.x + (get_rect().size.x * percentComplete), get_rect().position.y + (get_rect().size.y / 2)) # set where particle effect appears (mouse pos)
#		add_child(bubblesInstance)
#		bubblesInstance.emitting = true # trigger particle effect

func setMaxValue(newMaxValue):
	max_value = newMaxValue

func reset():
	value = 0

# Percentage in form 0f - 1f
func getPercentageComplete(): 
	if max_value == 0 || value == 0:
		return 0
	
	return value / max_value
