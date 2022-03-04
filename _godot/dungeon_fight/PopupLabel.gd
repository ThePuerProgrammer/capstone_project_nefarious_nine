extends Label

var _startGameTimer
var _messageScreenTime
var _gameStarted

func _ready():
	_startGameTimer = get_node('../../QuestionManager/startGameTimer')
	_messageScreenTime = _startGameTimer.wait_time / 4
	_gameStarted = false

func _process(_delta):
	if _gameStarted:
		return
	
	var _timeLeft = _startGameTimer.time_left
	
	if _timeLeft == 0:
		_gameStarted = true
		hide()
		return
		
	
	if _timeLeft <= _messageScreenTime:
		text = "GO!"
	elif _timeLeft > _messageScreenTime * 3:
		text = "3"
	elif _timeLeft > _messageScreenTime * 2:
		text = "2"
	elif  _timeLeft > _messageScreenTime:
		text = "1"
