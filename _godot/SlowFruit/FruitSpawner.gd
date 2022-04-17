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

var answerScript = load("res://SlowFruit/Answer.gd").new()

var numCorrect = 0
var numIncorrect = 0
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

onready var fruitLevel = get_parent()
onready var anAnswer = get_node("Control/Answer1Container/Answer1/RichTextLabel")
onready var questionLabel = get_node("Control/Question/Question/Label")
onready var scoreLabel = get_node("ScoreLabel")
onready var answers = [get_node("Control/Answer1Container/Answer1/RichTextLabel"),get_node("Control/Answer2Container/Answer2/RichTextLabel"),get_node("Control/Answer3Container/Answer3/RichTextLabel"), get_node("Control/Answer4Container/Answer4/RichTextLabel")]
onready var answerNodes = [get_node("Control/Answer1Container/Answer1"),get_node("Control/Answer2Container/Answer2"),get_node("Control/Answer3Container/Answer3"), get_node("Control/Answer4Container/Answer4")]
onready var rigidbodies = [get_node("Control/Answer1Container/RigidBody2D"),get_node("Control/Answer2Container/RigidBody2D"),get_node("Control/Answer3Container/RigidBody2D"), get_node("Control/Answer4Container/RigidBody2D")]

var choseAnswer = false



# Called when the node enters the scene tree for the first time.
func _ready():
	scoreLabel.text = "Coins: " + str(fruitLevel.slowfruitCoins)
	setCards()

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(_delta):
	pass


	
func chooseFruit():	
	pass
	
func setCards():
	
	card = Pomotimer.getRandomFlashcard()	
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

#SOUNDS-------------------------------------------------------

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

#END SOUNDS-------------------------------------------------------

#RESULTS-------------------------------------------------------
func winningChoice():
	choseAnswer = true
	playWinSound()
	stopWinSound()	
	dropFruit()
	$WinLabelNode/WinLabel.show()	
	$WinLabelNode.winTween()
	fruitLevel.slowfruitCoins += 5
	var coinPrize = 5
	FirebaseController.addPomocoinsToUserDocument(coinPrize)	
	scoreLabel.text = "Coins: " + str(fruitLevel.slowfruitCoins)
	$WinLabelNode/WinLabel/Timer.start()
	
func losingChoice():
	choseAnswer = true
	playLoseSound()
	stopLoseSound()
	$LoseLabelNode/LoseLabel.show()
	$LoseLabelNode.loseTween()
	$LoseLabelNode/LoseLabel/Timer.start()
	dropFruit()
	
func dropFruit():
	for fruit in rigidbodies:
		print(fruit.get_path())
		if fruit.get_path() != winningBody.get_path():
			fruit.set_gravity_scale(5)
			
func refreshCard():		
	setCards()
	answers = [get_node("Control/Answer1Container/Answer1/RichTextLabel"),get_node("Control/Answer2Container/Answer2/RichTextLabel"),get_node("Control/Answer3Container/Answer3/RichTextLabel"), get_node("Control/Answer4Container/Answer4/RichTextLabel")]
	questionLabel.show()
	anAnswer = get_node("Control/Answer2Container/Answer2/Tween")
	
	for label in answers:	
		label.show()
	for label in answerNodes:
		pass
		
	for body in rigidbodies:
		body.show()
	

#RESULTS-------------------------------------------------------

func _on_Fruit1_body_entered(_body):
	var path = "Control/Answer1Container/Fruit1"
	if(choseAnswer == false):
		if (path == winningPath && choseAnswer):
			winningChoice()
		else:
			print("nein")
			losingChoice()


func _on_Fruit2_body_entered(_body):
	var path = "Control/Answer2Container/Fruit2"
	if(choseAnswer == false):
		if (path == winningPath):
			winningChoice()
		else:
			print("nein")
			losingChoice()

func _on_Fruit3_body_entered(_body):
	var path = "Control/Answer3Container/Fruit3"
	if(choseAnswer == false):
		if (path == winningPath):
			winningChoice()
		else:
			print("nein")
			losingChoice()

func _on_Fruit4_body_entered(_body):
	var path = "Control/Answer4Container/Fruit4"
	if(choseAnswer == false):
		if (path == winningPath):
			winningChoice()
		else:
			print("nein")
			losingChoice()


func _on_Timer_timeout():
	questionLabel.hide()
	winningBody.set_gravity_scale(3)	
	fruitLevel.reloadFruits()
	
