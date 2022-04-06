extends Node

signal wrong_answer()
signal right_answer()

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
var randomAnswers = []
var right = 0

func _ready():
	var game_scene = get_node("PomoDefenseGame")
	game_scene.connect("game_finished", self, 'unload_game')
	for i in get_tree().get_nodes_in_group("answer_buttons"):
		i.connect("pressed", self, "answer_chosen", [i.get_name()])
		print(i)
		answers.append(i)
		
func getNextFlashcard():
	var randomCard = pomotimerController.getRandomFlashcard()
	questionPanelLabel.text = randomCard[0]
	correctAnswer = randomCard[1]
	wrongAnswers = randomCard[2]
	var wrongCount = 0
	randomize()
	var selectedAnswer = randi() % 3 + 0
	for i in 4:
		if i == selectedAnswer:
			answers[i].text = correctAnswer
			continue
		answers[i].text = wrongAnswers[wrongCount]
		wrongCount += 1
	
		
func answer_chosen(answer):
	$Flashcards.visible = !$Flashcards.visible
	var results = get_node("Results/RightWrong")
	var cash = money.text as int
	if answer.text == correctAnswer:
		results.text = "Correct!"
		cash = cash + 20 + right
		right += 5
		money.text = String(cash)
	else:
		results.text = "Wrong!"
		right = 0
	yield(get_tree().create_timer(2), "timeout")
	$Results.visible = !$Results.visible
	
func unload_game(result):
	get_node("PomoDefenseGame").queue_free()
	var game_over = load("res://Pomodefense/Scenes/GameOver.tscn").instance()
	add_child(game_over)

