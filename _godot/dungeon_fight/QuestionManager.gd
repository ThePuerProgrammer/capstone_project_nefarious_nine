extends Node

var _progressBarEasy
var _progressBarMedium
var _progressBarHard
var _waitTime
var _subSectionWaitTime
var _waitingForAnswer = false

# 0 = easy, 1 = medium, 2 = hard
var currentProgressBarSubSection = 0

# Called when the node enters the scene tree for the first time.
func _ready():
	_progressBarEasy = get_node("../TimerBar/ProgressBarHbox/ProgressBarEasy")
	_progressBarMedium = get_node("../TimerBar/ProgressBarHbox/ProgressBarMedium")
	_progressBarHard = get_node("../TimerBar/ProgressBarHbox/ProgressBarHard")
	_waitTime = $QuestionTimer.wait_time
	_subSectionWaitTime = $QuestionTimer.wait_time / 3
	$startGameTimer.start()
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if $QuestionTimer.is_stopped() or !_waitingForAnswer:
		return
	
	var _timeRemaining = _waitTime - $QuestionTimer.time_left
	
	# updates percentage to reflect each progress bar subsection
	
	if _timeRemaining <= _subSectionWaitTime:
		currentProgressBarSubSection = 0
		_progressBarEasy.value = (_timeRemaining / _subSectionWaitTime) * 100
		
	if _timeRemaining <= _subSectionWaitTime * 2 and _timeRemaining >= _subSectionWaitTime:
		currentProgressBarSubSection = 1
		_progressBarMedium.value = ((_timeRemaining - _subSectionWaitTime) / _subSectionWaitTime) * 100
		
	if _timeRemaining <= _subSectionWaitTime * 3 and _timeRemaining >= _subSectionWaitTime * 2: 
		currentProgressBarSubSection = 2
		_progressBarHard.value = ((_timeRemaining - (_subSectionWaitTime * 2)) / _subSectionWaitTime) * 100

func reset_for_next_question():
	_progressBarEasy.value = 0
	_progressBarMedium.value = 0
	_progressBarHard.value = 0
	currentProgressBarSubSection = 0
	

func _on_startGameTimer_timeout():
	_waitingForAnswer = true
	print("called again")
	$QuestionTimer.start()
	$startGameTimer.stop()	


func _on_QuestionTimer_timeout():
	_waitingForAnswer = false

func processAnswer(answerPanelText):
	print(answerPanelText)
	$QuestionTimer.stop()
	reset_for_next_question()

func _on_Answer1PanelContainer_answer_selected(answerPanelText):
	processAnswer(answerPanelText)


func _on_Answer2PanelContainer_answer_selected(answerPanelText):
	processAnswer(answerPanelText)


func _on_Answer3PanelContainer_answer_selected(answerPanelText):
	processAnswer(answerPanelText)

func _on_Answer4PanelContainer_answer_selected(answerPanelText):
	processAnswer(answerPanelText)