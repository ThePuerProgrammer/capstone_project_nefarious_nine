extends Timer

var _timeLeftUI
func _ready():
	_timeLeftUI = get_node("../../TimeLeft")


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	_timeLeftUI.updateTimeLeftAmount(ceil(time_left))


func _on_startGameTimer_timeout():
	_timeLeftUI.show()
