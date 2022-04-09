extends Node


var floating_text = preload("res://SlowFruit/FloatingText.tscn")


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


var numCorrect = 0
var numIncorrect = 0
var coins = 0

var fruits = [fruit1, fruit2, fruit3, fruit4, fruit5, fruit6, fruit7, fruit8, fruit9, fruit10]
var fruitCopy = fruits.duplicate()

var card

var correctIndex
var correctFruit


onready var questionLabel = get_node("Control/Question/Question/Label")
onready var answers = [get_node("Control/Answer1Container/Answer1/RichTextLabel"),get_node("Control/Answer2Container2/Answer2/RichTextLabel"),get_node("Control/Answer3Container3/Answer3/RichTextLabel"), get_node("Control/Answer4Container/Answer4/RichTextLabel")]


var choseAnswer = false


# Called when the node enters the scene tree for the first time.
func _ready():
	
	setCards()
	#question.setQuestionText(newQuestion)
	#print(question.getQuestionText())
	#questionLabelText = "this is the new label"
	#questionLabel.set_text(str(questionLabeltext))


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass

#func showQuestion(question):
#	var text = floating_text.instance()
#	text.amount = question
#	add_child(text)
	
func chooseFruit():	
	pass
	
func setCards():
	print("helo")
	card = Pomotimer.getRandomFlashcard()
	print("helo2")
	var question = card[0]
	var correctAnswer = card[1]
	var wrongAnswers = card[2]
	
	questionLabel.text = question
	
	var rand = RandomNumberGenerator.new()
	rand.randomize()
	var answerLabel = rand.randi_range(0, 3)

	correctIndex = answerLabel	
	print("correct index")
	
	correctFruit = "Control/Answer%sContainer%s/Fruit%s"
	print("correct fruit", correctFruit)
	
	var format_answer = correctFruit %[correctIndex, correctIndex, correctIndex]
	print("format annswer", format_answer)
	
	answers[answerLabel].text = correctAnswer
	
	var j = 0
	for i in range(0, 4):		
		if i != answerLabel:
			answers[i].text = wrongAnswers[j]
			j+= 1	


func setAnswer():
	pass


func _on_Fruit1_body_entered(body):
	print("fruit1")


func _on_Fruit2_body_entered(body):
	print("fruit2")


func _on_Fruit3_body_entered(body):
	print("fruit3")


func _on_Fruit4_body_entered(body):
	print("fruit4")
