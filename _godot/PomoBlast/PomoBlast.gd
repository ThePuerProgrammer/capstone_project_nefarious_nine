extends Node

export (PackedScene) var Mob
export (PackedScene) var PowerUp = preload("res://PomoBlast/PowerUp.tscn")

var score = 0 
# Called when the node enters the scene tree for the first time.
func _ready():
	$Player.start($StartPosition.position)
	$MobTimer.start()
	$GameTimer.start()
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
	print('**********************************Game Timer Has Stopped')
	pass # Replace with function body.
	
	
func _on_enemy_died(pos):
	score += 1
	var p = PowerUp.instance()
	add_child(p)
	p.position = pos
	print("we dead")


func _on_Pause_pressed():
	get_tree().paused = true
	$HUD/Popup.show()


func _on_Resume_pressed():
	$HUD/Popup.hide()
	get_tree().paused = false 
