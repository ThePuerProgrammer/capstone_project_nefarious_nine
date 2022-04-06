extends Node


# pomotimer variables
onready var _game_queue = Pomotimer._game_queue
onready var _timer = Pomotimer._time_limit
onready var _deck = Pomotimer._deck
onready var pomotimerController = get_node("/root/Pomotimer")
onready var money = get_node("PomoDefenseGame/UI/HUD/InfoBar/H/Money")

#question stuff
onready var questionPanelLabel = get_node("Flashcards/FlashcardHolder/QuestionText/QuestionScroll/QuestionTextLabel")
onready var result = get_node("Results/RightWrong")
var answers = []
var correctAnswer
var wrongAnswers = []
var reward = 20

func _ready():
	var game_scene = get_node("PomoDefenseGame")
	game_scene.connect("game_finished", self, 'unload_game')
	game_scene.connect("round_finished", self, 'resetRound')
	for i in get_tree().get_nodes_in_group("answer_buttons"):
		i.connect("pressed", self, "answer_chosen", [i.get_name()])
		print(i)
		answers.append(i)
	getNextFlashcard()
		
func resetRound():
	$Flashcards.visible = true
	getNextFlashcard()
		
func getNextFlashcard():
	var randomCard = pomotimerController.getRandomFlashcard()
	questionPanelLabel.text = randomCard[0]
	correctAnswer = randomCard[1]
	wrongAnswers = randomCard[2]
	var wrongCount = 0
	randomize()
	var selectedAnswer = randi() % 3 + 0
	for i in 4:
		if i - 1 == selectedAnswer:
			answers[i].text = correctAnswer
			continue
		answers[i].text = wrongAnswers[wrongCount]
		wrongCount += 1
	
		
func answer_chosen(answer):
	$Flashcards.visible = false
	var cash = money.text as int
	if answer.text == correctAnswer:
		result.text = "Correct!"
		result.visible = true
		cash += reward
		reward += 5
		money.text = String(cash)
	else:
		result.text = "Wrong!"
		result.visible = true
		reward = 20
	yield(get_tree().create_timer(2), "timeout")
	result.visible = false
	
func unload_game(result):
	get_node("PomoDefenseGame").queue_free()
	var game_over = load("res://Pomodefense/Scenes/GameOver.tscn").instance()
	add_child(game_over)

