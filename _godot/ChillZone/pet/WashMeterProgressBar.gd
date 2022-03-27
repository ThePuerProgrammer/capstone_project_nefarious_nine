extends ProgressBar

func incrementByStep():
	value = value + step

func setMaxValue(newMaxValue):
	max_value = newMaxValue

func reset():
	value = 0

# Percentage in form 0f - 1f
func getPercentageComplete(): 
	return value / max_value
