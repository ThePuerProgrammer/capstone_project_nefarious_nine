extends Node2D

var foodPieceScene = preload("res://ChillZone/food_pomopet/FoodPiece.tscn")
var bagShown = false
var canSpawnFoodPiece = true
var lastCloudPuffLocation = Vector2(-100, 100)

# Called when the node enters the scene tree for the first time.
func _ready():
	$BagIdle.hide()
	$BagActive.hide()
	show()

func _process(_delta):
	if Input.is_action_just_pressed("left_mouse_click"):
		startPour()
	elif Input.is_action_just_released("left_mouse_click"):
		endPour()
	
	$CloudPuffParticle.global_position = lastCloudPuffLocation

func hideFoodBag():
	lastCloudPuffLocation = get_global_mouse_position()
	$CloudPuffParticle.emitting = true
	yield(get_tree().create_timer(0.2), "timeout")
	bagShown = false
	$BagIdle.hide()
	$BagActive.hide()

func showFoodBag():
	lastCloudPuffLocation = get_global_mouse_position()
	$CloudPuffParticle.emitting = true
	yield(get_tree().create_timer(0.2), "timeout")
	$BagIdle.show()
	bagShown = true


#func showTrashcan():
#
#	yield(get_tree().create_timer($CloudPuffParticle.lifetime / 2), "timeout")
#	closeTrashCan()
#
#func hideTrashcan():
#	yield(get_tree().create_timer(0.25), "timeout") # Wait 1 second before hiding trashcan
#	$CloudPuffParticle.emitting = true
#	yield(get_tree().create_timer($CloudPuffParticle.lifetime / 4), "timeout")
#	$TrashcanOpen.hide()
#	$TrashcanClosed.hide()
	
func startPour():
	if bagShown:
		$BagIdle.hide();
		$BagActive.show()
	
func endPour():
	if bagShown:
		$BagActive.hide()
		$BagIdle.show();

func spawnFoodAtRandomPoint():
	if !canSpawnFoodPiece:
		return
	
	randomize()
	var randTexturePicker = floor(rand_range(0, 5)) # rand number 0 - 4
	var nodeString = "FoodSpawnPositions/FoodSpawnPos{randNum}"
	var spawnPosition = get_node(nodeString.format({"randNum": randTexturePicker})).global_transform.origin
	
	var foodPieceInstance = foodPieceScene.instance()
	foodPieceInstance.global_transform.origin = global_transform.origin
	get_node("../FoodPieces").add_child(foodPieceInstance)
	canSpawnFoodPiece = false
	$FoodPieceSpawnCooldown.start()


func _on_FoodPieceSpawnCooldown_timeout():
	canSpawnFoodPiece = true
