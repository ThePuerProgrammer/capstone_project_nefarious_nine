extends ProgressBar

signal petMeterValueChange

func _ready():
	modulate.a = 0

func incrementByStep():
	# increment value
	value = value + step
	emit_signal("petMeterValueChange", value)

func setMaxValue(newMaxValue):
	max_value = newMaxValue

func reset():
	value = 0

# Percentage in form 0f - 1f
func getPercentageComplete(): 
	return value / max_value
