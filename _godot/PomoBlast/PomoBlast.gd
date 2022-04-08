extends Node

export (PackedScene) var Mob
export (PackedScene) var PowerUp = preload("res://PomoBlast/PowerUp.tscn")
export (PackedScene) var Bullet = preload("res://PomoBlast/Bullet.tscn")
var gameOver = false
#var p = PowerUp.instance()
var rng = RandomNumberGenerator.new()
var score = 0 
#var _questionLabel 
var questionlist=["1","2","3","4"]
var _answerPanels=[]
 
	
onready var _questionLabel = get_node("HUD/QuestionPanel/Panel/QuestionLabel")
onready var pomoTimerController = get_node("/root/Pomotimer")
# Called when the node enters the scene tree for the first time.
func _ready():
	gameOver = false
	$Player.start($StartPosition.position)
	$Player.connect("playerDied",self,"_player_died")
	$MobTimer.start()
	$GameTimer.start()
	
	getFlashCard()
	
	
	
	
	#_questionLabel = get_node("HUD/QuestionPanel/Panel/QuestionLabel")
	
	


# Called every frame. 'delta' is the elapsed time since the previous frame.
#func _process(delta):
#	pass


func _on_MobTimer_timeout():
	var mob = Mob.instance()
	# Choose a random location on Path2D.
	$MobPath/MobSpawnLocation.offset = randi()
	# Create a Mob instance and add it to the scene.
	mob.connect("enemy_died",self,"_on_enemy_died")
	mob.connect("enemy_ded", $HUD/ScoreLabel,"_on_enemy_ded")
	add_child(mob)
	# Set the mob's direction perpendicular to the path direction.
	var direction = $MobPath/MobSpawnLocation.rotation + PI / 2
	# Set the mob's position to a random location.
	mob.position = $MobPath/MobSpawnLocation.position
	# Add some randomness to the direction.
	direction += rand_range(-PI / 4, PI / 4)
	mob.rotation = direction
	# Set the velocity (speed & direction).
	mob.linear_velocity = Vector2(rand_range(mob.min_speed, mob.max_speed), 0)
	mob.linear_velocity = mob.linear_velocity.rotated(direction)
	


func getFlashCard():
	var randomCard = pomoTimerController.getRandomFlashcard()
	var questiontext= randomCard[0]
	var _answerTextCorrect = randomCard[1]
	var _wrongAnswer = randomCard[2]
	$HUD/AnswerControl/Panel/Label.text = _answerTextCorrect
	$HUD/AnswerControl/Panel2/Label.text = _wrongAnswer[0]
	$HUD/AnswerControl/Panel3/Label.text = _wrongAnswer[1]
	$HUD/AnswerControl/Panel4/Label.text = _wrongAnswer[2]
	_questionLabel.text = questiontext
	
	

func _player_died():
	print("player died")
	$SoundDie.play()
	$SoundExplosion.play()
	$HUD/GameOverScreen.show()
	$HUD/QuestionPanel.hide()
	$HUD/AnswerControl.hide()
	
	gameOver = true
	
	
func _on_GameTimer_timeout():
	$MobTimer.stop()
	print('++++++++++++++++++++++++++++++++++++++ Game Timer Has Stopped')
	gameOver = true
	
	
	
func _on_enemy_died(pos,choice):
	#questionlist.pop_front()
	#_questionLabel.text = questionlist[0]
	$SoundExplosion.play()
	
	#-----------------------------------------------------------------power up drop and drop rate
	rng.randomize()
	var my_random_number = rng.randi_range(1, 10)
	if my_random_number <= 5:
		var p = PowerUp.instance()
		p.connect("powerUpPicked",self,"_on_PowerUp_Picked")
		add_child(p)
		p.position = pos
		print("++++++++++++++++++++++++++++++++++++++ power up dropped")
	if choice == "A" :
		print("A")
		print("Correct!")
		getFlashCard()
		
		
	elif choice == "B":
		print("B")
		#$HUD/AnswerControl/Panel2/Label.text = choice
		
	elif choice == "C":
		print("C")
		#$HUD/AnswerControl/Panel3/Label.text = choice
		
	elif choice == "D":
		print("D")
		#$HUD/AnswerControl/Panel4/Label.text = choice
		
	score += 1
	
	print("++++++++++++++++++++++++++++++++++++++ Asteroid dead")
	
func _on_PowerUp_Picked():
	print("++++++++++++++++++++++++++++++++++++++ powerup picked")
	$Player.speed += 100
	$SoundPowerUp.play()
	print($Player.speed)
	

func _on_Pause_pressed():
	get_tree().paused = true
	$HUD/Popup.show()


func _on_Resume_pressed():
	$HUD/Popup.hide()
	get_tree().paused = false 
