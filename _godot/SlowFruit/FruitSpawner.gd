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
var winningPath
var winningBody

var win_sound_has_played = false
var lose_sound_has_played = false

var fruits = [fruit1, fruit2, fruit3, fruit4, fruit5, fruit6, fruit7, fruit8, fruit9, fruit10]
var fruitCopy = fruits.duplicate()

var card

var correctIndex
var correctFruit
var correctRigidBody


onready var questionLabel = get_node("Control/Question/Question/Label")
onready var answers = [get_node("Control/Answer1Container/Answer1/RichTextLabel"),get_node("Control/Answer2Container/Answer2/RichTextLabel"),get_node("Control/Answer3Container/Answer3/RichTextLabel"), get_node("Control/Answer4Container/Answer4/RichTextLabel")]
onready var rigidbodies = [get_node("Control/Answer1Container/RigidBody2D"),get_node("Control/Answer2Container/RigidBody2D"),get_node("Control/Answer3Container/RigidBody2D"), get_node("Control/Answer4Container/RigidBody2D")]

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
	print(correctIndex+1)

	
	correctFruit = "Control/Answer%sContainer/Fruit%s"
	correctRigidBody = "Control/Answer%sContainer/RigidBody2D"
	
	var actualCorrectIndex = correctIndex+1
	
	var winningBodyPath
	winningPath = correctFruit %[actualCorrectIndex, actualCorrectIndex]
	winningBodyPath = correctRigidBody %actualCorrectIndex
	winningBody = get_node(winningBodyPath)
	print(winningBody.get_path())
	
	
	answers[answerLabel].text = correctAnswer
	
	var j = 0
	for i in range(0, 4):		
		if i != answerLabel:
			answers[i].text = wrongAnswers[j]
			j+= 1	

func playWinSound():
	if !win_sound_has_played:
		win_sound_has_played = true
		$WinSound.play()
		$DogWinSound.play()




func stopWinSound():
	if win_sound_has_played:
		win_sound_has_played = false
		$WinSound.stop()
		$DogWinSound.stop()

func playLoseSound():
	if !lose_sound_has_played:
		lose_sound_has_played = true
		$LoseSound.play()
		$DogLoseSound.play(2)


func stopLoseSound():
	if lose_sound_has_played:
		lose_sound_has_played = false
		$LoseSound.stop()
		$DogLoseSound.stop()


func setAnswer():
	pass

func winningChoice():
	playWinSound()
	stopWinSound()
	
	dropFruit()
	$WinLabel.show()
	
func losingChoice():
	playLoseSound()
	stopLoseSound()
	$LoseLabel.show()
	dropFruit()
	
func dropFruit():
	for fruit in rigidbodies:
		print(fruit.get_path())
		if fruit.get_path() != winningBody.get_path():
			fruit.set_gravity_scale(2)

func _on_Fruit1_body_entered(body):
	var path = "Control/Answer1Container/Fruit1"
	if (path == winningPath):
		winningChoice()
	else:
		print("nein")
		losingChoice()

func _on_Fruit2_body_entered(body):
	var path = "Control/Answer2Container/Fruit2"
	if (path == winningPath):
		winningChoice()
	else:
		print("nein")
		losingChoice()

func _on_Fruit3_body_entered(body):
	var path = "Control/Answer3Container/Fruit3"
	if (path == winningPath):
		winningChoice()
	else:
		print("nein")
		losingChoice()

func _on_Fruit4_body_entered(body):
	var path = "Control/Answer4Container/Fruit4"
	if (path == winningPath):
		winningChoice()
	else:
		print("nein")
		losingChoice()
