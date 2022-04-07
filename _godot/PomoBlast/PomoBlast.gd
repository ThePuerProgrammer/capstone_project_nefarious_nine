extends Node

export (PackedScene) var Mob
export (PackedScene) var PowerUp = preload("res://PomoBlast/PowerUp.tscn")
export (PackedScene) var Bullet = preload("res://PomoBlast/Bullet.tscn")

var p = PowerUp.instance()
var rng = RandomNumberGenerator.new()
var score = 0 
var _questionLabel 
var questionlist=["1","2","3","4"]
# Called when the node enters the scene tree for the first time.
func _ready():
	$Player.start($StartPosition.position)
	$MobTimer.start()
	$GameTimer.start()
	rng.randomize()
	var my_random_number = rng.randi_range(1, 10)
	print(my_random_number)
	
	_questionLabel = get_node("HUD/QuestionPanel/Panel/QuestionLabel")
	_questionLabel.text = questionlist[0]
	pass # Replace with function body.


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
	pass # Replace with function body.





func _on_GameTimer_timeout():
	$MobTimer.stop()
	print('++++++++++++++++++++++++++++++++++++++ Game Timer Has Stopped')
	pass # Replace with function body.
	
	
func _on_enemy_died(pos):
	#uestionlist.pop_front()
	#_questionLabel.text = questionlist[0]
	rng.randomize()
	var my_random_number = rng.randi_range(1, 10)
	if my_random_number <= 5:
		var p = PowerUp.instance()
		p.connect("powerUpPicked",self,"_on_PowerUp_Picked")
		add_child(p)
		p.position = pos
		print("++++++++++++++++++++++++++++++++++++++ power up dropped")
	score += 1
	
	
	print("++++++++++++++++++++++++++++++++++++++ Asteroid dead")
	
func _on_PowerUp_Picked():
	print("++++++++++++++++++++++++++++++++++++++ powerup picked")
	$Player.speed += 100
	
	print($Player.speed)
	pass

func _on_Pause_pressed():
	get_tree().paused = true
	$HUD/Popup.show()


func _on_Resume_pressed():
	$HUD/Popup.hide()
	get_tree().paused = false 
