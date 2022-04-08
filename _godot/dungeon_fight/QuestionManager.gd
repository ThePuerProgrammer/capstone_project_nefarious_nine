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
var gameStarted = false
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
var _answerTextCorrect
var _answerPanelRngSelector = RandomNumberGenerator.new()################

# combat and damage system ##############################################
var _playerHpBar
var _enemyHpBar
export (int) var _playerBaseDamage = 5
export (int) var _enemyBaseDamage = 5
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
var _gameOver = false
export (int) var _coinsPerQuestion = 2
var _coins = 0
var _popupMessage
#########################################################################

# Added Game Queue ######################################################
onready var _game_queue = Pomotimer._game_queue
onready var _timer = Pomotimer._time_limit
onready var _deck = Pomotimer._deck
#########################################################################

# Controller for getting random flashcards ##############################
onready var pomotimerController = get_node("/root/Pomotimer")
#########################################################################

# Called when the node enters the scene tree for the first time.
func _ready():	
	_questionPanelText = get_node("../QuestionMenu/MainColumn/QuestionTextPanelContainer/MarginContainer/ScrollContainer/QuestionText")
	_popupMessage = get_node("../PopupMessage")
	
	_progressBarEasy = get_node("../TimerBar/ProgressBarHbox/ProgressBarEasy")
	_progressBarMedium = get_node("../TimerBar/ProgressBarHbox/ProgressBarMedium")
	_progressBarHard = get_node("../TimerBar/ProgressBarHbox/ProgressBarHard")
	
	_playerHpBar = get_node("../PlayerHpBar")
	_enemyHpBar = get_node("../EnemyHpBar")
	_effectsCanvasLayer = get_node("../Effects")
	_resultsUI = get_node("../ResultsUI")
	_player = get_node("../Player")
	_enemy = get_node("../Enemy")
	
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
	$overallMinigameGameTimer.start()
	$startGameTimer.start()
	_answerPanelRngSelector.randomize()
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	if $QuestionTimer.is_stopped() or !_waitingForAnswer or _gameOver:
		return
	
	_timeRemaining = _waitTime - $QuestionTimer.time_left
	
	# updates percentage to reflect each progress bar subsection
	
	if _timeRemaining <= _subSectionWaitTime:
		_currentProgressBarSubSection = 0
		_progressBarEasy.value = (_timeRemaining / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("first_attack_level")
		
	if _timeRemaining <= _subSectionWaitTime * 2 and _timeRemaining >= _subSectionWaitTime:
		_progressBarEasy.value = 100
		_currentProgressBarSubSection = 1
		_progressBarMedium.value = ((_timeRemaining - _subSectionWaitTime) / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("second_attack_level")
		
	if _timeRemaining <= _subSectionWaitTime * 3 and _timeRemaining >= _subSectionWaitTime * 2: 
		_progressBarMedium.value = 100
		_currentProgressBarSubSection = 2
		_progressBarHard.value = ((_timeRemaining - (_subSectionWaitTime * 2)) / _subSectionWaitTime) * 100
		if !_enemyDead and !_playerDead:
			_enemy.play("third_attack_level")
		
	
func startNextQuestion():
	if _gameOver:
		return
	
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
	var randomCard = pomotimerController.getRandomFlashcard()

	var _questionText = randomCard[0]
	_answerTextCorrect = randomCard[1]
	var _wrongAnswers = randomCard[2]
	var _selectedPanel = _answerPanelRngSelector.randi_range(0, 3)
	var _wrongAnswerCounter = 0
	
	for i in 4:
		if i == _selectedPanel:
			_answerPanels[i].setAnswerText(_answerTextCorrect)
			continue
		_answerPanels[i].setAnswerText(_wrongAnswers[_wrongAnswerCounter])
		_wrongAnswerCounter = _wrongAnswerCounter + 1
	_questionPanelText.text = _questionText
	
func stopQuestionTimer():
	$QuestionTimer.stop()
	
func _on_answerPanelContainer_Clicked(answerPanelText):
	if !gameStarted:
		return
	
	stopQuestionTimer()
	var correctAnswerClicked = answerPanelText == _answerTextCorrect
	#
	# Enemy or Player are dead
	#
	if _enemyDead or _playerDead: #or player dead
		if correctAnswerClicked:
			_totalQuestionsAnsweredCorrectly = _totalQuestionsAnsweredCorrectly + 1
			_coins = _coins + _coinsPerQuestion
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
			_coins = _coins + _coinsPerQuestion
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
			showAnswerIndicators(true)
			var damageMultiplier = floor((_timeRemaining / _subSectionWaitTime) + 1)
			var newPlayerHp = _playerHpBar.value - (_enemyBaseDamage * damageMultiplier)
			if newPlayerHp < 0:
				newPlayerHp = 0
			if newPlayerHp == 0:
				print("player dead")
				_playerDead = true
				_coinsPerQuestion = floor(_coinsPerQuestion / 2)
				_popupMessage.showPopupMessage("Nice Try! Keep answering questions to gain more coins!", 10.0)
			_playerHpBar.value = newPlayerHp
			_totalQuestionsAnsweredIncorrectly = _totalQuestionsAnsweredIncorrectly + 1
			_effectsCanvasLayer.startPlayerHitEffects(_playerHpBar.value)

func _on_startGameTimer_timeout():
	_waitingForAnswer = true
	gameStarted = true
	$startGameTimer.stop()
	$gameplayGameTimer.start()
	startNextQuestion()

func _on_QuestionTimer_timeout():
	stopQuestionTimer()
	if _enemyDead or _playerDead: #or player dead
		_totalQuestionsAnsweredIncorrectly = _totalQuestionsAnsweredIncorrectly + 1
		showAnswerIndicators(true)
		yield(self, "answer_indicators_hidden")
		hideAnswerIndicators()
		startNextQuestion()
		return
	
	var damageMultiplier = 4
	var newPlayerHp = _playerHpBar.value - (_enemyBaseDamage * damageMultiplier)
	if newPlayerHp < 0:
		newPlayerHp = 0
	if newPlayerHp == 0:
		print("player dead")
		_playerDead = true
		_coinsPerQuestion = floor(_coinsPerQuestion / 2)
		_popupMessage.showPopupMessage("Nice Try! Keep answering questions to gain more coins!", 10.0)
	_playerHpBar.value = newPlayerHp
	_waitingForAnswer = false
	_effectsCanvasLayer.startPlayerHitEffects(_playerHpBar.value)

func _on_gameplayGameTimer_timeout():
	endGame(false, _totalQuestionsAnsweredCorrectly, _totalQuestionsAnsweredIncorrectly, _coins)

func endGame(playerWon, answeredCorrectly, answeredIncorrectly, coins):
	stopQuestionTimer()
	_gameOver = true
	if !$gameplayGameTimer.is_stopped():
		$gameplayGameTimer.stop()
	_resultsUI.showResults(playerWon, answeredCorrectly, answeredIncorrectly, coins)
	FirebaseController.addPomocoinsToUserDocument(coins)
	
	
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
		_coins = _coins + _coinsPerQuestion * 10
		_popupMessage.showPopupMessage("Great Work! Keep answering questions to gain more coins!", 5.0)
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
	Pomotimer.start_game(_timer,_game_queue,_deck)

