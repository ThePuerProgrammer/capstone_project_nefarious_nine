extends Node

signal answer_indicators_hidden
signal enemy_attack_animation_finished
signal player_attack_animation_finished

# for "animations" and progress bar #####################################
var _progressBarEasy
var _progressBarMedium
var _progressBarHard
var _waitTime
var _subSectionWaitTime
var _waitingForAnswer = false
var _enemy
var _timeRemaining
#export (Texture) var _enemyIdle_tex
#export (Texture) var _enemyEasy_tex
#export (Texture) var _enemyMedium_tex
#export (Texture) var _enemyHard_tex
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
var _currentAction
var _player
var _enemyDead = false
var _playerDead = false
var _playerAttacking = false
#########################################################################

# information for results screen ########################################
var _totalQuestionsAnsweredCorrectly = 0
var _totalQuestionsAnsweredIncorrectly = 0
var _resultsUI
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
	_resultsUI = get_node("../ResultsUI")
	_player = get_node("../Player")
	
	_totalQuestionsAnsweredCorrectly = 0
	_totalQuestionsAnsweredIncorrectly = 0
	
	for answerPanelContainer in get_node("../QuestionMenu/MainColumn/TopAnswerRow/").get_children():
		#answerPanelContainer.connectToPanel(self, "answer_selected_scroll", "functionName")
		answerPanelContainer.connect("answer_selected", self, "_on_answerPanelContainer_Clicked")
		_answerPanels.push_back(answerPanelContainer)
	for answerPanelContainer in get_node("../QuestionMenu/MainColumn/BottomAnswerRow/").get_children():
		#answerPanelContainer.connectToPanel(self, "answer_selected_scroll", "functionName")
		answerPanelContainer.connect("answer_selected", self, "_on_answerPanelContainer_Clicked")
		_answerPanels.push_back(answerPanelContainer)
	
	_waitTime = $QuestionTimer.wait_time
	_subSectionWaitTime = $QuestionTimer.wait_time / 3
	_enemy = get_node("../Enemy")
	$overallMinigameGameTimer.start()
	$startGameTimer.start()
	_answerPanelRngSelector.randomize()
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if $QuestionTimer.is_stopped() or !_waitingForAnswer:
		return
	
	_timeRemaining = _waitTime - $QuestionTimer.time_left
	
	# updates percentage to reflect each progress bar subsection
	
	if _timeRemaining <= _subSectionWaitTime:
		_currentProgressBarSubSection = 0
		_progressBarEasy.value = (_timeRemaining / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("first_attack_level")
		
	if _timeRemaining <= _subSectionWaitTime * 2 and _timeRemaining >= _subSectionWaitTime:
		_currentProgressBarSubSection = 1
		_progressBarMedium.value = ((_timeRemaining - _subSectionWaitTime) / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("second_attack_level")
		
	if _timeRemaining <= _subSectionWaitTime * 3 and _timeRemaining >= _subSectionWaitTime * 2: 
		_currentProgressBarSubSection = 2
		_progressBarHard.value = ((_timeRemaining - (_subSectionWaitTime * 2)) / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("third_attack_level")
		
	
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
	#
	# Enemy or Player are dead
	#
	if _enemyDead or _playerDead: #or player dead
		if correctAnswerClicked:
			_totalQuestionsAnsweredCorrectly = _totalQuestionsAnsweredCorrectly + 1
		else:
			_totalQuestionsAnsweredIncorrectly = _totalQuestionsAnsweredIncorrectly + 1
		showAnswerIndicators(true)
		yield(self, "answer_indicators_hidden")
		hideAnswerIndicators()
		startNextQuestion()
			
	else:
		#
		# User answered question correctly
		#
		if correctAnswerClicked:
			_totalQuestionsAnsweredCorrectly = _totalQuestionsAnsweredCorrectly + 1
			showAnswerIndicators(true)
			performCurrentAction()
			yield(self, "answer_indicators_hidden")
			hideAnswerIndicators()
			startNextQuestion()
		#
		# User answered question incorrecty
		#
		else:
			if _currentAction == "dodge":
				showAnswerIndicators(true)
				_effectsCanvasLayer.startEnemyMissEffect()
				performCurrentAction()
				yield(self, "answer_indicators_hidden")
				hideAnswerIndicators()
				startNextQuestion()
				return
			var damageMultiplier = floor((_timeRemaining / _subSectionWaitTime) + 1)
			var newPlayerHp = _playerHpBar.value - (_enemyBaseDamage * damageMultiplier)
			if newPlayerHp < 0:
				newPlayerHp = 0
			if newPlayerHp == 0:
				print("player dead")
				_playerDead = true
			_playerHpBar.value = newPlayerHp
			_totalQuestionsAnsweredIncorrectly = _totalQuestionsAnsweredIncorrectly + 1
			_effectsCanvasLayer.startPlayerHitEffects(_playerHpBar.value)

func _on_startGameTimer_timeout():
	_waitingForAnswer = true
	$startGameTimer.stop()
	$gameplayGameTimer.start()
	startNextQuestion()

func _on_QuestionTimer_timeout():
	_waitingForAnswer = false

func _on_gameplayGameTimer_timeout():
	endGame(false, _totalQuestionsAnsweredCorrectly, _totalQuestionsAnsweredIncorrectly)

func endGame(playerWon, answeredCorrectly, answeredIncorrectly):
	stopQuestionTimer()
	if !$gameplayGameTimer.is_stopped():
		$gameplayGameTimer.stop()
	_resultsUI.showResults(playerWon, answeredCorrectly, answeredIncorrectly)
	
	
func showAnswerIndicators(userAnsweredCorrectly):
	if userAnsweredCorrectly:
		print("started correct timer")
		$AnswerIndicatorTimers/Correct.start()
	else:
		print("started incorrect timer")
		$AnswerIndicatorTimers/Incorrect.start()

	for answerPanelContainer in _answerPanels:
		if answerPanelContainer.getAnswerText() == _answerTextCorrect:
			answerPanelContainer.showAnswerIndicator(true)
		else:
			answerPanelContainer.showAnswerIndicator(false)
			
func hideAnswerIndicators():
	for answerPanelContainer in _answerPanels:
			answerPanelContainer.hideAnswerIndicator()

func _on_Correct_timeout():
	emit_signal("answer_indicators_hidden")


func _on_Incorrect_timeout():
	emit_signal("answer_indicators_hidden")
	
func setCurrentAction(newAction):
	_currentAction = newAction

func performCurrentAction():
	print("Performing action", _currentAction)
	if _currentAction == "attack":
		attackAction()
	elif _currentAction == "dodge":
		dodgeAction()
		_effectsCanvasLayer.startEnemyMissEffect()

func attackAction():
	_playerAttacking = true
	_player.attackAction()
	var newEnemyHp = _enemyHpBar.value - _playerBaseDamage
	if newEnemyHp < 0:
		newEnemyHp = 0
	if newEnemyHp == 0:
		_enemyDead = true
		_enemy.play("die")
	else:
		_enemy.play("hit_effect")
	yield(self, "player_attack_animation_finished")
	_playerAttacking = false
	_player.resumeIdleAnimation()
	_enemyHpBar.value = newEnemyHp

func dodgeAction():
	_player.dodgeAction()


func _on_PlayerAnimatedSprite_animation_finished():
	if _playerAttacking:
		emit_signal("player_attack_animation_finished")


func _on_overallMinigameGameTimer_timeout():
	$overallMinigameGameTimer.stop()
