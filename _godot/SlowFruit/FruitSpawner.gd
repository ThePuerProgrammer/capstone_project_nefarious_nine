extends Node


#var floating_text = preload("res://SlowFruit/FloatingText.tscn")


onready var fruit1 = get_node("/Fruit1")
onready var fruit2 = get_node("/Fruit2")
onready var fruit3 = get_node("/Fruit3")
onready var fruit4 = get_node("/Fruit4")
onready var fruit5 = get_node("/Fruit5")
onready var fruit6 = get_node("/Fruit6")
onready var fruit7 = get_node("/Fruit7")
onready var fruit8 = get_node("/Fruit8")
onready var fruit9 = get_node("/Fruit9")
onready var fruit10 = get_node("/Fruit10")

onready var pomotimer = get_node("root/Pomotimer")
var deck = pomotimer._deck
#print decks

var numCorrect = 0
var numIncorrect = 0
var coins = 0

var fruits = [fruit1, fruit2, fruit3, fruit4, fruit5, fruit6, fruit7, fruit8, fruit9, fruit10]
var fruitCopy = fruits.duplicate()

onready var questionLabel = get_node("Control/Question/Question/Label")
onready var answer1Label = get_node("Control/Answer1Container/Answer1/RichTextLabel")
onready var answer2Label = get_node("Control/Answer1Container/Answer2/RichTextLabel")
onready var answer3Label = get_node("Control/Answer1Container/Answer3/RichTextLabel")
onready var answer4Label = get_node("Control/Answer1Container/Answer4/RichTextLabel")

var choseAnswer = false


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	setCards()

#func showQuestion(question):
#	var text = floating_text.instance()
#	text.amount = question
#	add_child(text)
	
func chooseFruit():
	#for i in answers:
		#answerPic = fruit[randi()% fruit.size()]
	pass
	
func setCards():
	var card = pomotimer.getRandomFlashcard()
	
	questionLabel.text = card[0]
	print(questionLabel.text)
	

func setAnswer():
	pass
