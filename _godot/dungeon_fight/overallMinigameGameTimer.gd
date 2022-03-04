extends Timer

var _timeRemainingShown = false
var _resultsTimeLeftUI

func _ready():
	_resultsTimeLeftUI = get_node("../../ResultsUI").getResultsTimeLeftContainer()

func _process(_delta):
	if _timeRemainingShown:
		_resultsTimeLeftUI.updateTimeLeftAmount(ceil(time_left))
	
func _on_AnimationPlayer_animation_finished(anim_name):
	_timeRemainingShown = true
	_resultsTimeLeftUI.show()
	
