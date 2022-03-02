extends Node

# for "animations" and progress bar #####################################
var _progressBarEasy
var _progressBarMedium
var _progressBarHard
var _waitTime
var _subSectionWaitTime
var _waitingForAnswer = false
var _enemy
var _timeRemaining
export (Texture) var _enemyIdle_tex
export (Texture) var _enemyEasy_tex
export (Texture) var _enemyMedium_tex
export (Texture) var _enemyHard_tex
var _currentProgressBarSubSection = 0 # 0 = easy, 1 = medium, 2 = hard ###

# answer panel selection & randomization ################################
var _questionPanelText
var _answerPanels = [ ]
var count = 0 # TODO: remove, for testing
var _answerTextCorrect
var _answerPanelRngSelector = RandomNumberGenerator.new()################

# combat and damage system ##############################################
var _playerHpBar
var _enemyHpBar
var _playerBaseDamage = 5
var _enemyBaseDamage = 5
var _effectsCanvasLayer
#########################################################################

# information for results screen ########################################
var _totalQuestionsAnsweredCorrectly = 0
#########################################################################


# Called when the node enters the scene tree for the first time.
func _ready():
	_questionPanelText = get_node("../QuestionMenu/MainColumn/QuestionTextPanelContainer/MarginContainer/ScrollContainer/QuestionText")
	
	_progressBarEasy = get_node("../TimerBar/ProgressBarHbox/ProgressBarEasy")
	_progressBarMedium = get_node("../TimerBar/ProgressBarHbox/ProgressBarMedium")
	_progressBarHard = get_node("../TimerBar/ProgressBarHbox/ProgressBarHard")
	
	_playerHpBar = get_node("../PlayerHpBar")
	_enemyHpBar = get_node("../EnemyHpBar")
	_effectsCanvasLayer = get_node("../Effects")
	
	_totalQuestionsAnsweredCorrectly = 0
	
	for answerPanelContainer in get_node("../QuestionMenu/MainColumn/TopAnswerRow/").get_children():
		answerPanelContainer.connect("answer_selected", self, "_on_answerPanelContainer_Clicked")
		_answerPanels.push_back(answerPanelContainer)
	for answerPanelContainer in get_node("../QuestionMenu/MainColumn/BottomAnswerRow/").get_children():
		answerPanelContainer.connect("answer_selected", self, "_on_answerPanelContainer_Clicked")
		_answerPanels.push_back(answerPanelContainer)
	
	_waitTime = $QuestionTimer.wait_time
	_subSectionWaitTime = $QuestionTimer.wait_time / 3
	_enemy = get_node("../Enemy")
	$startGameTimer.start()
	_answerPanelRngSelector.randomize()
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	if $QuestionTimer.is_stopped() or !_waitingForAnswer:
		return
	
	_timeRemaining = _waitTime - $QuestionTimer.time_left
	
	# updates percentage to reflect each progress bar subsection
	
	if _timeRemaining <= _subSectionWaitTime:
		_currentProgressBarSubSection = 0
		_progressBarEasy.value = (_timeRemaining / _subSectionWaitTime) * 100
		_enemy.texture = _enemyEasy_tex
		
	if _timeRemaining <= _subSectionWaitTime * 2 and _timeRemaining >= _subSectionWaitTime:
		_currentProgressBarSubSection = 1
		_progressBarMedium.value = ((_timeRemaining - _subSectionWaitTime) / _subSectionWaitTime) * 100
		_enemy.texture = _enemyMedium_tex
		
	if _timeRemaining <= _subSectionWaitTime * 3 and _timeRemaining >= _subSectionWaitTime * 2: 
		_currentProgressBarSubSection = 2
		_progressBarHard.value = ((_timeRemaining - (_subSectionWaitTime * 2)) / _subSectionWaitTime) * 100
		_enemy.texture = _enemyHard_tex
		
	
func startNextQuestion():
	# TODO: Get next flashcard here
	resetForNextQuestion()
	getNextQuestionAndAnswers()
	$QuestionTimer.start()
	_waitingForAnswer = true
	
func resetForNextQuestion():
	_progressBarEasy.value = 0
	_progressBarMedium.value = 0
	_progressBarHard.value = 0
	_currentProgressBarSubSection = 0
	
func getNextQuestionAndAnswers():
	var _questionText = "questionText: " + str(count)
	var _wrongAnswers = [
		"wrongAnswer1: " + str(count),
		"wrongAnswer2: " + str(count),
		"wrongAnswer2: " + str(count)
	]
	_answerTextCorrect = "answerTextCorrect: " + str(count)
	var _selectedPanel = _answerPanelRngSelector.randi_range(0, 3)
	var _wrongAnswerCounter = 0
	
	for i in 4:
		if i == _selectedPanel:
			_answerPanels[i].setAnswerText(_answerTextCorrect)
			continue
		_answerPanels[i].setAnswerText(_wrongAnswers[_wrongAnswerCounter])
		_wrongAnswerCounter = _wrongAnswerCounter + 1
	_questionPanelText.text = _questionText
	count = count + 1
	
func stopQuestionTimer():
	$QuestionTimer.stop()
	
func _on_answerPanelContainer_Clicked(answerPanelText):
	stopQuestionTimer()
	var correctAnswerClicked = answerPanelText == _answerTextCorrect
	if correctAnswerClicked:
		var newEnemyHp = _enemyHpBar.value - _playerBaseDamage
		if newEnemyHp < 0:
			newEnemyHp = 0
		_enemyHpBar.value = newEnemyHp
		_totalQuestionsAnsweredCorrectly = _totalQuestionsAnsweredCorrectly + 1
		startNextQuestion()
	else:
		var damageMultiplier = floor((_timeRemaining / _subSectionWaitTime) + 1)
		var newPlayerHp = _playerHpBar.value - (_enemyBaseDamage * damageMultiplier)
		if newPlayerHp < 0:
			newPlayerHp = 0
		_playerHpBar.value = newPlayerHp
		_effectsCanvasLayer.startPlayerHitEffects()

func _on_startGameTimer_timeout():
	_waitingForAnswer = true
	$startGameTimer.stop()
	startNextQuestion()

func _on_QuestionTimer_timeout():
	_waitingForAnswer = false
